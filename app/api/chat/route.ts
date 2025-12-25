import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { XANDEUM_KNOWLEDGE_BASE } from "@/app/data/knowledge";

// Custom Google Provider Instance
// We use createGoogleGenerativeAI to allow advanced configuration if needed in the future
const google = createGoogleGenerativeAI({
    // apiKey is automatically loaded from process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json();

        // Get the last user message for intent detection
        const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

        // Calculate some quick stats for the prompt context
        const healthyCount = context.healthyCount || 0;
        const totalNodes = context.totalNodes || 0;
        const activeNodes = context.activeNodes || 0;
        const warningCount = context.warningCount || 0;
        const criticalCount = context.criticalCount || 0;
        const atRiskCount = warningCount + criticalCount;
        const healthPct = totalNodes > 0 ? Math.round((healthyCount / totalNodes) * 100) : 0;
        const activePct = totalNodes > 0 ? Math.round((activeNodes / totalNodes) * 100) : 0;

        // --- QUICK HANDLERS (Regex) ---
        // Only for small talk to ensure instant response.
        if (lastMessage.length < 50) {
            // GREETINGS
            if (lastMessage.match(/^(hi|hello|hey|yo|sup|greetings)/)) {
                const greetings = [
                    "👋 Hey there! I'm ready to help with your Xandeum nodes.",
                    "Hi! 🌟 How can I assist you with the network today?",
                    "Hello! Xandeum Scope AI at your service.",
                ];
                return new Response(greetings[Math.floor(Math.random() * greetings.length)], { headers: { "Content-Type": "text/plain" } });
            }
            // GRATITUDE
            if (lastMessage.match(/^(thanks|thank you|thx|nice|cool|great)/)) {
                const replies = [
                    "You're very welcome! 🧡",
                    "Happy to help! 🚀",
                    "Anytime! Let me know if you need anything else.",
                ];
                return new Response(replies[Math.floor(Math.random() * replies.length)], { headers: { "Content-Type": "text/plain" } });
            }
        }

        // --- RAG SYSTEM PROMPT ---
        const systemPrompt = `
<role>
You are **Xandeum Scope AI**, a friendly, intelligent expert assistant for the Xandeum pNode network.
</role>

<instructions>
1. **Source of Truth**: Answer technical questions using *only* the content in the <knowledge_base> section below.
2. **Handle Unknowns**: If the answer is not in the <knowledge_base> or <dashboard_context>, politely say: "I am not aware of this specific detail. Please check the documentation:" and provide the link [Documentation](/docs).
3. **No Empty Responses**: Always provide a helpful response. Never return an empty string.
4. **Citations**: When using the Knowledge Base, cite the relevant document link.
5. **Tone**: Be warm, helpful, and conversational. Small talk ("hi") is fine without citations.
</instructions>

<dashboard_context>
Total Nodes: ${totalNodes}
Active: ${activeNodes} (${activePct}%)
Healthy: ${healthyCount}
Storage: ${context.totalStorage || "Unknown"}
At Risk: ${context.atRiskNodes?.length ? context.atRiskNodes.slice(0, 5).join(", ") : "None"}
</dashboard_context>

<knowledge_base>
${XANDEUM_KNOWLEDGE_BASE}
</knowledge_base>
`;

        // --- STREAMING RESPONSE ---
        // Using Gemini 1.5 Flash for speed/reliability.
        // Explicitly setting BLOCK_NONE for all safety categories to prevent "Empty/Hanging" responses on benign technical queries.

        const result = await streamText({
            // @ts-ignore: Safety settings are critical for RAG reliability
            model: google("gemini-1.5-flash", {
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                ],
            }),
            system: systemPrompt,
            messages,
            temperature: 0.2, // Low temp prevents hallucinations
            onError: (err) => {
                console.error("StreamText Error Log:", err);
            },
        });

        return result.toTextStreamResponse();

    } catch (error: any) {
        console.error("Chat API error:", error);
        if (error.message?.includes("429")) {
            return new Response("⏳ Too many requests. Please wait.", { status: 429 });
        }
        return new Response("😕 Something went wrong. Please try again.", { status: 500 });
    }
}
