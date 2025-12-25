# AI Chatbot Implementation Plan for Xandeum Scope

## Project Context

**Project**: Xandeum Scope - pNode Analytics Dashboard  
**Stack**: Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui  
**Deployment**: Vercel  
**Goal**: Add AI-powered chatbot to help users understand node data and network health

---

## Current Application State

### Existing Data Sources
```typescript
// app/page.tsx - Main state variables available
const [nodes, setNodes] = useState<PNodeInfo[]>([]);  // All node data
const [geoCache, setGeoCache] = useState<Record<string, any>>({}); // IP to location mapping
const [stats, setStats] = useState({ total: 0, active: 0, totalStorage: 0 });

// PNodeInfo interface (app/lib/xandeum.ts)
interface PNodeInfo {
  pubkey: string;
  gossip?: string;
  rpc?: string;
  tpu?: string;
  version?: string | null;
  storage_committed?: number;
  storage_used?: number;
  uptime?: number;
  credits?: number;
}

// Health calculation function exists: calculateHealthScore(node) 
// Returns: { total: number, status: "HEALTHY" | "WARNING" | "CRITICAL", breakdown: {...} }
```

### Key Statistics Computed
- Total nodes count
- Active/inactive node count
- Total network storage
- Health distribution (healthy/warning/critical)
- Version distribution
- Country distribution

---

## Implementation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Client)                         │
│  ┌──────────────────┐    ┌─────────────────────────────────┐   │
│  │   AIChatWidget   │───▶│  React Context / Props          │   │
│  │   (Floating UI)  │    │  - nodes[], stats, geoCache     │   │
│  └────────┬─────────┘    └─────────────────────────────────┘   │
│           │                                                      │
│           │ POST /api/chat                                       │
│           │ { message, context: { stats, nodeCount, etc } }     │
│           ▼                                                      │
├─────────────────────────────────────────────────────────────────┤
│                        BACKEND (Server)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  app/api/chat/route.ts                                    │   │
│  │  - Receives user message + context                        │   │
│  │  - Constructs system prompt with real data                │   │
│  │  - Calls Gemini API via Vercel AI SDK                     │   │
│  │  - Returns streaming response                             │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │                                      │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
                 ┌────────────────────┐
                 │   Google Gemini    │
                 │   (gemini-1.5-flash)│
                 │   FREE TIER        │
                 └────────────────────┘
```

---

## Files to Create/Modify

### 1. [NEW] `app/api/chat/route.ts`
Server-side API route for Gemini integration.

```typescript
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages, context } = await req.json();
  
  const systemPrompt = `You are Xandeum Scope AI, a helpful assistant for the Xandeum pNode network.

CURRENT NETWORK STATUS:
- Total Nodes: ${context.totalNodes}
- Active Nodes: ${context.activeNodes}
- Inactive Nodes: ${context.totalNodes - context.activeNodes}
- Total Storage: ${context.totalStorage}
- Healthy Nodes: ${context.healthyCount}
- Warning Nodes: ${context.warningCount}
- Critical Nodes: ${context.criticalCount}

You help users:
1. Understand node health and metrics
2. Diagnose issues (low uptime, outdated version, storage problems)
3. Explain network statistics
4. Answer questions about Xandeum ecosystem

Be concise. Use bullet points. Use emojis sparingly for visual cues.`;

  const result = streamText({
    model: google("gemini-1.5-flash"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
```

### 2. [NEW] `components/ui/ai-chat.tsx`
Floating chat widget component.

**Features:**
- Floating button (bottom-right, fixed position)
- Expandable chat window (400px wide, 500px tall)
- Message list with user/assistant styling
- Input field with send button
- Streaming text display
- Loading indicator
- Close/minimize button
- Mobile responsive

### 3. [MODIFY] `app/page.tsx`
Add chat widget to main layout.

```typescript
import { AIChatWidget } from "@/components/ui/ai-chat";

// In the return JSX, add before closing tag:
<AIChatWidget 
  context={{
    totalNodes: stats.total,
    activeNodes: stats.active,
    totalStorage: formatStorage(stats.totalStorage),
    healthyCount: healthyNodes.length,
    warningCount: warningNodes.length,
    criticalCount: criticalNodes.length,
  }}
/>
```

### 4. [NEW] `.env.local` (add variable)
```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

---

## Dependencies to Install

```bash
npm install ai @ai-sdk/google
```

**Package versions (latest stable):**
- `ai`: ^3.x (Vercel AI SDK)
- `@ai-sdk/google`: ^0.x (Google/Gemini provider)

---

## Gemini API Free Tier Limits

| Metric | Limit |
|--------|-------|
| Requests per minute | 15 RPM |
| Tokens per minute | 32,000 TPM |
| Requests per day | 1,500 RPD |
| Context window | 1M tokens |
| Model | gemini-1.5-flash |

**Risk Assessment**: For a demo/bounty submission, these limits are MORE than sufficient.

---

## Potential Issues & Mitigations

### 1. Rate Limiting (Medium Risk)
**Problem**: User spams chat, hits 15 RPM limit.  
**Solution**: 
- Disable send button while waiting for response
- Show "Please wait" if rate limited
- Add debounce on input

### 2. API Key Security (High Risk)
**Problem**: API key exposed in client-side code.  
**Solution**: 
- Use Next.js API route (server-side only)
- Key stored in `.env.local` (never committed)
- Vercel handles env vars securely

### 3. Hallucinations (Medium Risk)
**Problem**: AI makes up incorrect node data.  
**Solution**: 
- Inject real stats in system prompt
- Instruct AI to only use provided data
- For specific node queries, pass node data in context

### 4. Slow Responses (Low Risk)
**Problem**: User waits 3-5 seconds for response.  
**Solution**: 
- Use streaming (text appears word-by-word)
- Show typing indicator

### 5. Empty/Error States (Low Risk)
**Problem**: Network error or API failure.  
**Solution**: 
- Try/catch with user-friendly error message
- Retry button for failed requests

---

## UI/UX Specifications

### Chat Button (Collapsed State)
```
Position: fixed, bottom-right (bottom-6 right-6)
Size: 56x56px (14 in Tailwind)
Color: Primary orange (#F97316)
Icon: MessageSquare or Bot icon
Animation: Subtle pulse on hover
Z-index: 50 (above content, below modals)
```

### Chat Window (Expanded State)
```
Size: w-[380px] h-[500px] on desktop
      w-full h-[70vh] on mobile
Position: fixed, bottom-6 right-6 (desktop)
          fixed, bottom-0 left-0 right-0 (mobile)
Border radius: rounded-2xl
Shadow: shadow-2xl
Background: card color with backdrop blur
```

### Message Styling
```
User messages: bg-primary text-white, right-aligned
AI messages: bg-muted, left-aligned
Streaming: Show cursor/typing indicator
Code blocks: Syntax highlighted
```

---

## Sample Conversations

**User**: "How many nodes are active?"  
**AI**: "Currently there are **185** active nodes out of **211** total nodes on the Xandeum network. That's an 87.7% online rate."

**User**: "Why is my node unhealthy?"  
**AI**: "Nodes can be marked unhealthy for several reasons:
- ⚠️ **Low uptime** - Less than 24h of continuous operation
- ⚠️ **Outdated version** - Not running the latest software
- ⚠️ **Storage issues** - Low committed storage
- ⚠️ **RPC offline** - Node not responding to requests

To check your specific node, search for it in the table and click to see its health breakdown."

**User**: "What's the total storage on the network?"  
**AI**: "The Xandeum network currently has **15.9 TB** of total committed storage across all nodes."

---

## Reviewer Feedback - Incorporated Additions

Based on external AI review, these low-cost additions are incorporated:

### 1. Data Freshness Timestamp
Pass `lastUpdated` timestamp to context so AI can communicate data recency.
```typescript
context: {
  ...stats,
  lastUpdated: new Date().toISOString(), // or actual fetch timestamp
}
```

### 2. Strict Grounding Rules in System Prompt
```
RULES:
- ONLY use the data provided above. Never guess or invent statistics.
- If information is unavailable, say "I don't have that data available."
- Preface answers with "Based on current dashboard data..." when relevant.
- Be concise. Use bullet points for lists.
```

### 3. Lightweight Intent Detection
Before calling Gemini, check for simple queries and answer directly:
```typescript
// In API route, before LLM call:
const simpleAnswers: Record<string, () => string> = {
  "active": () => `There are ${context.activeNodes} active nodes.`,
  "total": () => `Total nodes: ${context.totalNodes}`,
  "storage": () => `Network storage: ${context.totalStorage}`,
};

// Check if query matches simple pattern
for (const [keyword, answer] of Object.entries(simpleAnswers)) {
  if (userMessage.toLowerCase().includes(keyword) && userMessage.length < 30) {
    return new Response(answer());
  }
}
// Otherwise, call Gemini...
```

### 4. Static Welcome Message
On chat open, show immediately (no API call):
```
👋 Hi! I'm Xandeum Scope AI.

I can help you with:
• Network statistics (active nodes, storage, health)
• Node diagnostics (why is my node unhealthy?)
• Understanding metrics

I can only answer based on current dashboard data.
```

### 5. Suggested Question Chips
Show clickable chips below input:
```tsx
const suggestions = [
  "How many nodes are active?",
  "Show unhealthy nodes",
  "What's the total storage?",
  "Network health summary",
];
```

### 6. Friendly Error Messages
```typescript
const errorMessages = {
  rateLimit: "I'm getting a lot of questions! Please wait a moment and try again.",
  networkError: "Having trouble connecting. Check your internet and try again.",
  generic: "Something went wrong. Please try again.",
};
```

---

## Testing Checklist

- [ ] Chat button visible on dashboard
- [ ] Chat opens/closes smoothly
- [ ] Messages send successfully
- [ ] AI responds with correct network stats
- [ ] Streaming works (text appears progressively)
- [ ] Error handling works (show friendly message)
- [ ] Mobile responsive (full-width on small screens)
- [ ] Z-index correct (above table, below existing modals)
- [ ] Rate limiting handled gracefully
- [ ] Empty state (welcome message on first open)

---

## Estimated Implementation Time

| Task | Time |
|------|------|
| Install dependencies | 2 min |
| Create API route | 15 min |
| Create chat UI component | 30 min |
| Integrate in page.tsx | 10 min |
| Testing & fixes | 15 min |
| **Total** | **~75 min** |

---

## Prerequisites Before Starting

1. **Gemini API Key** - Get free at https://aistudio.google.com/apikey
2. **Node.js 18+** - Already have
3. **npm/pnpm** - Already have

---

## Verification by Another AI

To verify this plan is complete, check:

1. ✅ All files to create/modify are listed
2. ✅ Dependencies are specified with install command
3. ✅ API route handles security (server-side only)
4. ✅ Error handling is considered
5. ✅ Mobile responsiveness addressed
6. ✅ Rate limiting handled
7. ✅ Context passing to AI is specified
8. ✅ UI specifications are detailed
9. ✅ Testing checklist provided

**Missing items to flag:**
- None identified - plan is comprehensive

---

## Next Steps

1. User provides or obtains Gemini API key
2. Install dependencies: `npm install ai @ai-sdk/google`
3. Create API route
4. Create chat UI component
5. Integrate and test
6. Push to Git/Vercel
