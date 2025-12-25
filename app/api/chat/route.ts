import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { XANDEUM_KNOWLEDGE_BASE } from "@/app/data/knowledge";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json();

        // Get the last user message for intent detection
        const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

        // Lightweight intent detection for simple queries (no API call needed)
        if (lastMessage.length < 50) {
            if (lastMessage.includes("active") && lastMessage.includes("node")) {
                return new Response(
                    `Based on current dashboard data, there are **${context.activeNodes}** active nodes out of ${context.totalNodes} total.`,
                    { headers: { "Content-Type": "text/plain" } }
                );
            }
            if (lastMessage.includes("total storage") || (lastMessage.includes("storage") && lastMessage.includes("network"))) {
                return new Response(
                    `The Xandeum network currently has **${context.totalStorage}** of total committed storage.`,
                    { headers: { "Content-Type": "text/plain" } }
                );
            }
        }

        const systemPrompt = `You are Xandeum Scope AI, a helpful assistant for the Xandeum pNode network analytics dashboard.

CURRENT NETWORK STATUS (as of ${context.lastUpdated || "now"}):
- Total Nodes: ${context.totalNodes}
- Active Nodes: ${context.activeNodes}
- Inactive Nodes: ${context.totalNodes - context.activeNodes}
- Online Rate: ${((context.activeNodes / context.totalNodes) * 100).toFixed(1)}%
- Total Storage: ${context.totalStorage}
- Healthy Nodes (≥75 health): ${context.healthyCount}
- Warning Nodes (50-74 health): ${context.warningCount}  
- Critical Nodes (<50 health): ${context.criticalCount}

AT-RISK NODES (Warning/Critical, showing top 10):
${context.atRiskNodes?.length ? context.atRiskNodes.join("\n") : "No at-risk nodes found!"}

OFFLINE NODES (Top 10):
${context.offlineNodes?.length ? context.offlineNodes.join("\n") : "No offline nodes."}

GEOGRAPHIC DISTRIBUTION (Top Countries):
${context.topCountries?.length ? context.topCountries.join("\n") : "No location data available."}

SOFTWARE VERSIONS:
${context.softwareVersions?.length ? context.softwareVersions.join("\n") : "No version data available."}

KNOWLEDGE BASE:
${XANDEUM_KNOWLEDGE_BASE}

RULES:
- ONLY use the data provided above. Never guess or invent statistics.
- Use the KNOWLEDGE BASE to answer general questions (e.g. definitions, troubleshooting).
- If information is unavailable, say "I don't have that data available in the current dashboard."
- Preface answers with "Based on current dashboard data..." when relevant.
- Be concise. Use bullet points for lists.
- Use emojis sparingly for visual cues (✅ ⚠️ 🔴 📊).

You help users:
1. Understand network health and node statistics
2. Diagnose common issues (low uptime, outdated version, storage problems)
3. Explain what metrics mean
4. Navigate the dashboard features

You CANNOT:
- Access individual node details unless provided
- Make changes to nodes
- Access user credentials or sensitive data
- Answer off-topic questions (poems, jokes, stories, general knowledge, etc.)

OFF-TOPIC HANDLING:
If a user asks for something unrelated to Xandeum, pNodes, crypto/blockchain, or network analytics, politely decline and suggest they ask a relevant question. Example response:
"I'm focused on helping with Xandeum pNode analytics! I can answer questions about node health, network stats, troubleshooting, or dashboard features. What would you like to know?"`;

        const result = await streamText({
            model: google("gemini-2.5-flash"),
            system: systemPrompt,
            messages,
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error("Chat API error:", error);

        if (error.message?.includes("429") || error.message?.includes("rate")) {
            return new Response(
                "I'm getting a lot of questions! Please wait a moment and try again.",
                { status: 429, headers: { "Content-Type": "text/plain" } }
            );
        }

        return new Response(
            "Something went wrong. Please try again.",
            { status: 500, headers: { "Content-Type": "text/plain" } }
        );
    }
}
