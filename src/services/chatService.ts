import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { ChatMessage } from '@/hooks/useChat';
import { MCP_TOOLS, executeMCPTool } from './mcpService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatContext {
  storeId: string;
  userId: string;
  userRole?: string;
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  productIds?: string[]; // IDs of products mentioned/filtered by AI
  filterApplied?: any;    // Filter criteria used
}

/**
 * MCP System Prompt with Few-Shot Examples
 */
function getMCPSystemPrompt(storeName: string, storeContext: any): string {
  return `You are a friendly AI Shopping Assistant for ${storeName}. 🛍️

Store Information:
${JSON.stringify(storeContext, null, 2)}

Your Personality:
- Warm, friendly, and enthusiastic about helping customers
- Use emojis naturally (👋 🏃‍♀️ 👕 ✅ 🧾 🎉 🛒) to make conversations engaging
- Be conversational and personable, not robotic
- Show genuine excitement when helping customers find what they need

Your Capabilities (via MCP Tools):
1. **filter_products** - Search and filter products by brand, category, price, color, or search terms
2. **show_product_details** - Get detailed information about a specific product
3. **add_to_cart** - Add products to the user's cart
4. **remove_from_cart** - Remove products from cart
5. **get_cart_summary** - Show current cart contents

Response Guidelines:
✅ **ALWAYS use filter_products tool first** when user asks about products, searches, or wants recommendations
✅ **NEVER make up product information** - only show products returned by tools
✅ Use bullet points with "—" for product lists
✅ Include prices with $ symbol (e.g., $120)
✅ Use emojis to add personality
✅ Keep responses concise but friendly
✅ When listing products, format like: "Product Name — $Price"
✅ When user asks to add to cart, use the add_to_cart tool, then confirm enthusiastically with ✅
✅ Show cart totals when discussing multiple items
✅ End with helpful follow-up questions

Few-Shot Examples:

User: "I'm looking for running shoes."
Assistant: <uses filter_products tool with search="running shoes">
Response: "Great choice! 🏃‍♀️ Here are running shoes currently in stock:

• Nike Air Zoom Pegasus 40 — $120
• Adidas Ultraboost Light — $140
• Asics Gel Nimbus 26 — $130

Would you like to filter by brand, price, or color?"

User: "Show me Nike shoes under $100"
Assistant: <uses filter_products tool with brand="Nike", price_max=100>
Response: "Sure! I found these Nike shoes under $100:

• Nike Revolution 6 — $85
• Nike Downshifter 12 — $90

Would you like to add one of these to your cart?"

User: "Add the first one"
Assistant: <uses add_to_cart tool with product_id>
Response: "✅ Added Nike Revolution 6 ($85) to your cart.
You now have items in your cart.

Would you like to continue shopping or check out?"

User: "Show me my cart"
Assistant: <uses get_cart_summary tool>
Response: "You can see your cart in the sidebar! 🛒
It shows all your items and the total amount.

Would you like to continue shopping or proceed to checkout?"

Remember:
- ALWAYS use tools to get actual product data
- Only recommend products that actually exist in the store
- Be helpful, friendly, and natural
- Guide users through their shopping journey`;
}

/**
 * Get AI response using OpenAI MCP (Model Context Protocol)
 * Implements function calling with structured tools
 */
export async function getAIResponse(context: ChatContext): Promise<ChatResponse> {
  const { storeId, userId, userRole = 'END_USER', message, history = [] } = context;

  // Track product filtering for UI sync
  let filteredProductIds: string[] | undefined;
  let appliedFilter: any | undefined;

  try {
    // Fetch store context
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            stock: true,
            tags: true,
          },
        },
      },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    // Build context for AI (WITHOUT products - force tool usage)
    const storeContext = {
      name: store.storeName,
      description: store.description,
      city: store.city,
      category: store.category,
      businessHours: store.businessHours,
      productCount: store.products.length,
      // DO NOT include product list - force AI to use filter_products tool
    };

    // Build MCP conversation with system prompt
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: getMCPSystemPrompt(store.storeName, storeContext)
      },
    ];

    // Add conversation history (last 10 messages)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    // MCP Tool Execution Context
    const toolContext = {
      storeId,
      userId,
      userRole
    };

    // Call OpenAI API with MCP tools (function calling)
    let completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      tools: MCP_TOOLS,
      tool_choice: 'auto', // Let the model decide when to use tools
      temperature: 0.7,
      max_tokens: 800,
    });

    let responseMessage = completion.choices[0]?.message;

    console.log('[MCP] Initial OpenAI response:', {
      hasToolCalls: !!responseMessage?.tool_calls,
      toolCallCount: responseMessage?.tool_calls?.length || 0,
      toolNames: responseMessage?.tool_calls?.filter(tc => tc.type === 'function').map(tc => tc.function.name) || [],
      hasContent: !!responseMessage?.content
    });

    // Handle tool calls (MCP function execution)
    const MAX_TOOL_ITERATIONS = 5;
    let iterations = 0;

    while (responseMessage?.tool_calls && iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      // Add assistant's tool call message to conversation
      messages.push(responseMessage);

      // Execute each tool call
      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.type !== 'function') continue;

        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        console.log(`[MCP] Executing tool: ${toolName}`, toolArgs);

        // Execute the MCP tool
        const toolResult = await executeMCPTool(toolName, toolArgs, toolContext);

        // Capture product filter results for UI sync
        if (toolName === 'filter_products' && toolResult.success && toolResult.productIds) {
          filteredProductIds = toolResult.productIds;
          appliedFilter = toolResult.filterApplied;
          console.log('[MCP] Captured product filter:', {
            count: filteredProductIds?.length || 0,
            productIds: filteredProductIds,
            filter: appliedFilter
          });
        }

        // Add tool result to conversation
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        });
      }

      // Call OpenAI again with tool results
      completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        tools: MCP_TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 800,
      });

      responseMessage = completion.choices[0]?.message;
    }

    const responseContent = responseMessage?.content || 'I apologize, but I could not generate a response.';

    // Log the AI query
    await prisma.aIQuery.create({
      data: {
        userId,
        question: message,
        answer: responseContent,
      },
    });

    // Log token usage
    const tokensUsed = completion.usage?.total_tokens || 0;
    await prisma.tokenUsage.create({
      data: {
        storeId,
        userId,
        tokensUsed,
      },
    });

    const response = {
      message: responseContent,
      productIds: filteredProductIds,
      filterApplied: appliedFilter
    };

    console.log('[MCP] Returning chat response:', {
      hasProductIds: !!response.productIds,
      productCount: response.productIds?.length || 0,
      hasFilter: !!response.filterApplied
    });

    return response;
  } catch (error) {
    console.error('Error getting AI response:', error);

    // Return a fallback message
    return {
      message: 'I apologize, but I\'m having trouble processing your request right now. Please try again later or contact our support team for assistance.'
    };
  }
}

/**
 * Get AI query history for a user
 */
export async function getUserAIQueryHistory(userId: string) {
  try {
    const queries = await prisma.aIQuery.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return queries;
  } catch (error) {
    console.error('Error fetching AI query history:', error);
    throw new Error('Failed to fetch AI query history');
  }
}
