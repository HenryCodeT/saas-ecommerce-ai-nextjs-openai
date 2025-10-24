import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { ChatMessage } from '@/hooks/useChat';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatContext {
  storeId: string;
  userId: string;
  message: string;
  history?: ChatMessage[];
}

/**
 * Get AI response using OpenAI SDK
 * Includes store and product context for relevant answers
 */
export async function getAIResponse(context: ChatContext): Promise<string> {
  const { storeId, userId, message, history = [] } = context;

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

    // Build context for AI
    const storeContext = {
      name: store.storeName,
      description: store.description,
      city: store.city,
      category: store.category,
      businessHours: store.businessHours,
      products: store.products.map((p) => ({
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        tags: p.tags,
      })),
    };

    // Build conversation history
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a helpful AI shopping assistant for ${store.storeName}.

Store Information:
${JSON.stringify(storeContext, null, 2)}

Your role is to:
- Help customers find products they're looking for
- Answer questions about product features, pricing, and availability
- Provide recommendations based on customer needs
- Share information about the store (location, hours, policies)
- Be friendly, helpful, and concise

Important:
- Only recommend products that are currently in stock
- Always mention the price when discussing products
- If a product is out of stock, suggest alternatives
- Keep responses conversational and natural`,
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

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseContent = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

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

    return responseContent;
  } catch (error) {
    console.error('Error getting AI response:', error);

    // Return a fallback message
    return 'I apologize, but I\'m having trouble processing your request right now. Please try again later or contact our support team for assistance.';
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
