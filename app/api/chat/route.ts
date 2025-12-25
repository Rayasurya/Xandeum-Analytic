import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { XANDEUM_KNOWLEDGE_BASE } from "@/app/data/knowledge";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json();

        // Get the last user message for intent detection
        const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

        // Calculate some quick stats
        const healthyCount = context.healthyCount || 0;
        const totalNodes = context.totalNodes || 0;
        const activeNodes = context.activeNodes || 0;
        const warningCount = context.warningCount || 0;
        const criticalCount = context.criticalCount || 0;
        const atRiskCount = warningCount + criticalCount;
        const healthPct = totalNodes > 0 ? Math.round((healthyCount / totalNodes) * 100) : 0;
        const activePct = totalNodes > 0 ? Math.round((activeNodes / totalNodes) * 100) : 0;

        // Quick response handlers for common questions (no API call needed)
        if (lastMessage.length < 80) {
            // Active nodes
            if ((lastMessage.includes("how many") || lastMessage.includes("count")) && lastMessage.includes("active")) {
                return new Response(
                    `📊 **${activeNodes}** nodes are currently active out of ${totalNodes} total (${activePct}% online rate).`,
                    { headers: { "Content-Type": "text/plain" } }
                );
            }

            // Total nodes
            if ((lastMessage.includes("how many") || lastMessage.includes("total")) && lastMessage.includes("node") && !lastMessage.includes("active")) {
                return new Response(
                    `📊 The network has **${totalNodes}** total pNodes registered.\n\n• Active: ${activeNodes}\n• Inactive: ${totalNodes - activeNodes}`,
                    { headers: { "Content-Type": "text/plain" } }
                );
            }

            // Storage
            if (lastMessage.includes("storage") || lastMessage.includes("how much storage")) {
                return new Response(
                    `💾 The Xandeum network has **${context.totalStorage}** of total committed storage across all pNodes.`,
                    { headers: { "Content-Type": "text/plain" } }
                );
            }

            // Health summary
            if (lastMessage.includes("health") && (lastMessage.includes("summary") || lastMessage.includes("status") || lastMessage.includes("overview"))) {
                return new Response(
                    `🏥 **Network Health Summary**\n\n✅ Healthy: **${healthyCount}** nodes (${healthPct}%)\n⚠️ Warning: **${warningCount}** nodes\n🔴 Critical: **${criticalCount}** nodes\n\n${atRiskCount > 0 ? `${atRiskCount} nodes need attention.` : "All nodes are healthy! 🎉"}\n\n📖 [Learn about Health Scores](/docs/health-score)`,
                    { headers: { "Content-Type": "text/plain" } }
                );
            }

            // Node issues / problems
            if (lastMessage.includes("issue") || lastMessage.includes("problem") || lastMessage.includes("at risk") || lastMessage.includes("at-risk")) {
                if (atRiskCount === 0) {
                    return new Response(
                        `✅ **Great news!** All ${totalNodes} nodes are healthy with no issues detected.`,
                        { headers: { "Content-Type": "text/plain" } }
                    );
                }
                return new Response(
                    `⚠️ **${atRiskCount}** nodes need attention:\n\n• Warning (50-74 health): ${warningCount}\n• Critical (<50 health): ${criticalCount}\n\nCommon causes: outdated software, high latency, or storage issues.\n\n📖 [Troubleshooting Guide](/docs/troubleshooting)`,
                    { headers: { "Content-Type": "text/plain" } }
                );
            }

            // Greetings
            if (lastMessage.match(/^(hi|hello|hey|yo|sup|greetings)/)) {
                return new Response(
                    `👋 Hey! I'm Xandeum Scope AI. I can help you with:\n\n• Network stats (nodes, storage, health)\n• Troubleshooting node issues\n• Understanding dashboard metrics\n\nWhat would you like to know?`,
                    { headers: { "Content-Type": "text/plain" } }
                );
            }

            // Help
            if (lastMessage === "help" || lastMessage === "?" || lastMessage.includes("what can you")) {
                return new Response(
                    `🤖 **I can help you with:**\n\n1. **Network Stats** - "How many nodes are active?"\n2. **Health Check** - "Show node issues"\n3. **Storage Info** - "What's the total storage?"\n4. **Troubleshooting** - "Why is my node offline?"\n5. **Metrics** - "What is health score?"\n\n📖 [Full Documentation](/docs)`,
                    { headers: { "Content-Type": "text/plain" } }
                );
            }
        }

        const systemPrompt = `You are Xandeum Scope AI - a friendly, helpful assistant for the Xandeum pNode network dashboard.

PERSONALITY:
- Be conversational but concise
- Use emojis sparingly for visual appeal (✅ ⚠️ 🔴 📊 💾 🔧)
- Format with markdown: **bold** for key numbers, bullet points for lists
- Start responses naturally, don't always say "Based on current dashboard data"

CURRENT NETWORK DATA:
📊 Total Nodes: ${totalNodes}
✅ Active: ${activeNodes} (${activePct}%)
💚 Healthy (≥75): ${healthyCount}
⚠️ Warning (50-74): ${warningCount}
🔴 Critical (<50): ${criticalCount}
💾 Storage: ${context.totalStorage || "Unknown"}

${context.atRiskNodes?.length ? `AT-RISK NODES:\n${context.atRiskNodes.slice(0, 5).join("\n")}` : ""}

${context.softwareVersions?.length ? `VERSIONS:\n${context.softwareVersions.slice(0, 3).join("\n")}` : ""}

KNOWLEDGE BASE:
${XANDEUM_KNOWLEDGE_BASE}

RESPONSE GUIDELINES:
1. Answer questions directly - don't be vague
2. Use actual numbers from the data above
3. For node counts, give specific numbers
4. For health, explain what the numbers mean
5. For troubleshooting, give actionable steps
6. Keep answers under 150 words unless asked for detail

DOCUMENTATION LINKS (include these when relevant):
- Health scores: [Learn more](/docs/health-score)
- Troubleshooting: [Guide](/docs/troubleshooting)
- Getting started: [Docs](/docs/getting-started)
- FAQ: [FAQ](/docs/faq)
- All metrics: [Metrics](/docs/metrics)
Format links as: 📖 [Link Text](/path)

IF YOU DON'T KNOW:
Say "I don't have that specific data in the dashboard" and suggest what you CAN help with.

STAY ON TOPIC:
Only answer questions about Xandeum, pNodes, blockchain, or the dashboard. For other topics, politely redirect.`;

        const result = await streamText({
            model: google("gemini-2.0-flash"),
            system: systemPrompt,
            messages,
            temperature: 0.7, // Slightly creative but consistent
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error("Chat API error:", error);

        // Handle specific errors
        if (error.message?.includes("429") || error.message?.includes("rate") || error.message?.includes("quota")) {
            return new Response(
                "⏳ I'm getting a lot of questions! Please wait a moment and try again.",
                { status: 429, headers: { "Content-Type": "text/plain" } }
            );
        }

        if (error.message?.includes("timeout") || error.message?.includes("ETIMEDOUT")) {
            return new Response(
                "⏱️ The request timed out. Please try again.",
                { status: 504, headers: { "Content-Type": "text/plain" } }
            );
        }

        // Generic fallback with a helpful message
        return new Response(
            "😕 Something went wrong on my end. Try asking again, or check the dashboard directly for the info you need.",
            { status: 500, headers: { "Content-Type": "text/plain" } }
        );
    }
}
