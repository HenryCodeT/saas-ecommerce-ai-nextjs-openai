# OpenAI MCP (Model Context Protocol) Implementation

## Overview

This document describes the complete MCP integration for the SaaS E-commerce AI platform. The implementation replaces the previous direct OpenAI SDK usage with a structured tool-based approach using OpenAI's function calling (MCP).

## Architecture

```
User Message
    ↓
ChatBox UI Component
    ↓
useChat Hook
    ↓
/api/chat Route (validates session)
    ↓
chatService.ts (MCP orchestrator)
    ↓
OpenAI API with MCP Tools
    ↓
Tool Execution (mcpService.ts)
    ↓
Prisma Database Operations
    ↓
Response back to User
```

## MCP Tools Defined

### 1. **filter_products**
**Purpose**: Search and filter products in the current store

**Parameters**:
- `search` (string): General search term for name/description/tags
- `brand` (string): Filter by brand name
- `category` (string): Filter by category
- `color` (string): Filter by color
- `price_min` (number): Minimum price
- `price_max` (number): Maximum price
- `in_stock_only` (boolean): Only show in-stock products (default: true)

**Returns**: Array of matching products with id, name, description, price, stock, images, tags

**Example**:
```json
{
  "search": "running shoes",
  "brand": "Nike",
  "price_max": 100
}
```

### 2. **show_product_details**
**Purpose**: Get detailed information about a specific product

**Parameters**:
- `product_id` (string, required): Product ID

**Returns**: Complete product details including images, stock, SKU

### 3. **add_to_cart**
**Purpose**: Add a product to the user's cart (conceptual confirmation)

**Parameters**:
- `product_id` (string, required): Product to add
- `quantity` (number): Quantity (default: 1)

**Returns**: Confirmation with product details

**Side Effects**:
- Logs to `ActivityLog` table with actionType='ADD_TO_CART'
- Verifies product stock availability

### 4. **remove_from_cart**
**Purpose**: Remove a product from cart

**Parameters**:
- `product_id` (string, required): Product to remove

**Returns**: Confirmation message

**Side Effects**:
- Logs to `ActivityLog` table with actionType='REMOVE_FROM_CART'

### 5. **get_cart_summary**
**Purpose**: Get cart summary (UI-managed)

**Parameters**: None

**Returns**: Message directing user to UI cart

### 6. **save_ai_query**
**Purpose**: Internal tool for logging AI interactions

**Parameters**:
- `user_id` (string, required)
- `question` (string, required)
- `answer` (string, required)
- `product_id` (string, optional)

**Returns**: Success confirmation

**Side Effects**:
- Creates record in `AIQuery` table

## MCP System Prompt

The MCP system prompt defines:

1. **Assistant Personality**
   - Warm, friendly, enthusiastic
   - Uses emojis naturally (👋 🏃‍♀️ 👕 ✅ 🧾 🎉 🛒)
   - Conversational and personable

2. **Tool Capabilities**
   - Lists all available MCP tools
   - Explains when to use each tool

3. **Response Guidelines**
   - Product list formatting: "Product Name — $Price"
   - Use bullet points with "—"
   - Always use tools to get real data
   - Confirm actions enthusiastically

4. **Few-Shot Examples**
   - User: "I'm looking for running shoes"
   - User: "Show me Nike shoes under $100"
   - User: "Add the first one"
   - User: "Show me my cart"

## Security & Context

### Store Scoping
All MCP tools automatically enforce store context:
- Tools only access products from `context.storeId`
- END_USER role can only query their registered store
- Client-side session validation before API calls

### Permission Model
```typescript
interface ToolExecutionContext {
  storeId: string;  // Current store ID
  userId: string;   // Authenticated user ID
  userRole: string; // User role (ADMIN/CLIENT/END_USER)
}
```

### Database Safety
- All queries use Prisma ORM (prepared statements)
- Type-safe operations
- Automatic SQL injection prevention
- Row-level store filtering

## MCP Execution Flow

1. **User sends message** → ChatBox UI
2. **API receives message** → Validates session, extracts storeId, userId, userRole
3. **chatService creates MCP context**:
   ```typescript
   {
     storeId: session.user.storeId,
     userId: session.user.id,
     userRole: session.user.role,
     message: userMessage,
     history: previousMessages
   }
   ```
4. **OpenAI called with tools**:
   ```typescript
   openai.chat.completions.create({
     model: 'gpt-4o-mini',
     messages: conversationHistory,
     tools: MCP_TOOLS,
     tool_choice: 'auto'
   })
   ```
5. **If model requests tool**:
   - Extract tool name and arguments
   - Execute via `executeMCPTool(toolName, args, context)`
   - Return result to OpenAI
   - Get final conversational response
6. **Response sent to user** → Natural language with tool results embedded

## Tool Execution Loop

```typescript
while (responseMessage?.tool_calls && iterations < MAX_TOOL_ITERATIONS) {
  // 1. Add assistant's tool request to conversation
  messages.push(responseMessage);

  // 2. Execute each tool call
  for (const toolCall of responseMessage.tool_calls) {
    const toolResult = await executeMCPTool(
      toolCall.function.name,
      JSON.parse(toolCall.function.arguments),
      toolContext
    );

    // 3. Add tool result to conversation
    messages.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: JSON.stringify(toolResult)
    });
  }

  // 4. Call OpenAI again with tool results
  completion = await openai.chat.completions.create({...});
  responseMessage = completion.choices[0]?.message;
}
```

## Example Conversation Flow

### User: "Show me running shoes under $100"

**Step 1**: OpenAI receives message with MCP tools available

**Step 2**: Model decides to call `filter_products`:
```json
{
  "name": "filter_products",
  "arguments": {
    "search": "running shoes",
    "price_max": 100,
    "in_stock_only": true
  }
}
```

**Step 3**: `mcpService.ts` executes tool:
```typescript
const products = await prisma.product.findMany({
  where: {
    storeId: context.storeId,
    isActive: true,
    stock: { gt: 0 },
    price: { lte: 100 },
    OR: [
      { name: { contains: 'running shoes', mode: 'insensitive' } },
      { description: { contains: 'running shoes', mode: 'insensitive' } }
    ]
  }
});
```

**Step 4**: Tool result returned:
```json
{
  "success": true,
  "count": 2,
  "products": [
    {
      "id": "prod_123",
      "name": "Nike Revolution 6",
      "price": 85,
      "stock": 15
    },
    {
      "id": "prod_124",
      "name": "Nike Downshifter 12",
      "price": 90,
      "stock": 8
    }
  ]
}
```

**Step 5**: OpenAI generates conversational response:
```
"Sure! I found these Nike running shoes under $100:

• Nike Revolution 6 — $85
• Nike Downshifter 12 — $90

Would you like to add one of these to your cart?"
```

## Database Schema Integration

### AIQuery Table
```prisma
model AIQuery {
  id         String    @id @default(cuid())
  userId     String
  question   String    @db.Text
  answer     String    @db.Text
  productId  String?
  createdAt  DateTime  @default(now())

  user       User      @relation(fields: [userId], references: [id])
  product    Product?  @relation(fields: [productId], references: [id])
}
```

**Logged for every interaction**

### ActivityLog Table
```prisma
model ActivityLog {
  id          String   @id @default(cuid())
  userId      String
  actionType  String
  targetId    String
  metadata    Json?
  timestamp   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}
```

**Logged for cart actions**: ADD_TO_CART, REMOVE_FROM_CART

### TokenUsage Table
```prisma
model TokenUsage {
  id         String   @id @default(cuid())
  storeId    String
  userId     String
  tokensUsed Int
  createdAt  DateTime @default(now())

  store      Store    @relation(fields: [storeId], references: [id])
  user       User     @relation(fields: [userId], references: [id])
}
```

**Logged after every OpenAI call**

## File Structure

```
src/
├── services/
│   ├── mcpService.ts         # NEW: MCP tool definitions & implementations
│   └── chatService.ts        # UPDATED: MCP orchestration with OpenAI
├── app/api/chat/
│   └── route.ts              # UPDATED: Pass userRole to chatService
└── hooks/
    └── useChat.ts            # UNCHANGED: Frontend chat hook
```

## Key Differences from Previous Implementation

| Aspect | Before (Direct OpenAI) | After (MCP) |
|--------|----------------------|-------------|
| Product Data | Embedded in system prompt | Retrieved via `filter_products` tool |
| Cart Actions | Conceptual only | Logged to ActivityLog via tools |
| Product Search | AI guesses from context | Real Prisma queries |
| Scalability | Limited by context window | Tools fetch on-demand |
| Accuracy | Hallucinations possible | Always uses real data |
| Database Logs | Only final Q&A | Full cart action audit trail |

## Environment Variables

Required `.env.local`:
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini  # or gpt-4o
DATABASE_URL=postgresql://...
```

## Testing the MCP Implementation

### 1. Test Product Search
```
User: "Show me all products"
Expected: filter_products tool called, real products listed
```

### 2. Test Price Filtering
```
User: "I need shoes under $50"
Expected: filter_products with price_max=50
```

### 3. Test Add to Cart
```
User: "Add the Nike Revolution to my cart"
Expected: add_to_cart tool called, ActivityLog created, confirmation sent
```

### 4. Test Product Details
```
User: "Tell me more about product XYZ"
Expected: show_product_details called with product_id
```

### 5. Test Cart Summary
```
User: "What's in my cart?"
Expected: get_cart_summary tool returns UI redirect message
```

## Monitoring & Debugging

### Console Logs
```typescript
console.log(`[MCP] Executing tool: ${toolName}`, toolArgs);
```

Look for these in server console to see tool execution.

### Database Queries
Check `ActivityLog` table:
```sql
SELECT * FROM activity_logs
WHERE action_type IN ('ADD_TO_CART', 'REMOVE_FROM_CART')
ORDER BY timestamp DESC;
```

Check `AIQuery` table:
```sql
SELECT question, answer, created_at
FROM ai_queries
ORDER BY created_at DESC
LIMIT 10;
```

## Future Enhancements

### Potential Additional Tools

1. **`check_inventory`** - Real-time stock checks
2. **`get_similar_products`** - ML-based recommendations
3. **`apply_discount_code`** - Promotional codes
4. **`get_shipping_estimate`** - Delivery time/cost
5. **`save_for_later`** - Wishlist functionality
6. **`compare_products`** - Side-by-side comparison

### Advanced Features

- **Multi-turn tool chaining**: Let model call multiple tools in sequence
- **Streaming responses**: Real-time tool execution feedback
- **Tool result caching**: Speed up repeated queries
- **Custom embeddings**: Semantic product search
- **User preferences**: Personalized recommendations

## Troubleshooting

### Tool not being called
- Check system prompt includes tool descriptions
- Verify `tool_choice: 'auto'` is set
- Ensure user message is clear about intent

### Tool execution fails
- Check Prisma connection
- Verify storeId/userId in context
- Check product exists in database

### Wrong products returned
- Verify store scoping in WHERE clause
- Check `isActive: true` filter
- Ensure price/stock filters are correct

### Token limit exceeded
- Reduce `max_tokens` in OpenAI call
- Limit tool result size (e.g., max 20 products)
- Truncate long product descriptions

## Summary

The MCP implementation provides:
✅ Structured, type-safe tool definitions
✅ Real database queries via Prisma
✅ Complete audit trail in ActivityLog
✅ Store-scoped security
✅ Scalable architecture for new tools
✅ Natural language + structured data
✅ Full conversation context retention
✅ Token usage tracking
✅ No hallucinations (tools use real data)

The AI assistant now has access to real-time product data and can execute actual operations while maintaining conversational fluency.
