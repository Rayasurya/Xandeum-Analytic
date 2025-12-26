import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { XANDEUM_KNOWLEDGE_BASE } from "@/app/data/knowledge";

// Critical for large RAG context handling
export const maxDuration = 60;
// Ensure Node.js runtime for Native SDK
export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
    let lastUserMessage = "";

    try {
        const { messages, context } = await req.json();

        // 1. PREPARE CONTEXT & STATS
        const healthyCount = context?.healthyCount || 0;
        const totalNodes = context?.totalNodes || 0;
        const activeNodes = context?.activeNodes || 0;
        const activePct = totalNodes > 0 ? Math.round((activeNodes / totalNodes) * 100) : 0;

        // Capture for fallback usage
        lastUserMessage = messages[messages.length - 1]?.content || "";

        // 2. DETERMINISTIC QUICK ANSWERS (Root Fix for Reliability)
        // Bypass AI for specific stats questions to ensure always-correct, instant answers.
        const lowerMsg = lastUserMessage.toLowerCase();

        if (lowerMsg.includes("how many nodes") || lowerMsg.includes("total nodes")) {
            return new Response(`There are currently **${totalNodes} nodes** in the Xandeum network.`);
        }
        if (lowerMsg.includes("active") || lowerMsg.includes("online")) {
            return new Response(`There are **${activeNodes} active nodes** (${activePct}% of the network).`);
        }
        if (lowerMsg.includes("healthy") || lowerMsg.includes("health")) {
            return new Response(`There are **${healthyCount} healthy nodes** in the network.`);
        }
        if (lowerMsg.includes("storage") || lowerMsg.includes("space")) {
            return new Response(`The total committed network storage is **${context?.totalStorage || "Unknown"}**.`);
        }

        // 3. DEFINE SYSTEM PROMPT (Rich RAG Context)
        const systemInstruction = `
## ROLE
You are Xandeum Scope AI, a helpful expert assistant for the Xandeum Network. 
Your goal is to answer user questions using the **LIVE SYSTEM DATA** and **DOCUMENTATION** provided below.

## RULES
- **PRIORITY**: If the user asks about current statuses (counts, health, storage), use the **LIVE SYSTEM DATA**.
- **EXPLANATIONS**: If the user asks "How" or "Why", use the **DOCUMENTATION**.
- **ACCURACY**: If the answer isn't in the provided data, politely say "I don't have that specific information right now."
- **TONE**: Professional, concise, and friendly.

## LIVE SYSTEM DATA (Real-Time)
- Total Nodes: ${totalNodes}
- Active Nodes: ${activeNodes} (${activePct}%)
- Healthy Nodes: ${healthyCount}
- Network Storage: ${context?.totalStorage || "Unknown"}
- At Risk Nodes: ${context?.atRiskNodes?.length ? context.atRiskNodes.slice(0, 5).join(", ") : "None"}

## DOCUMENTATION (Knowledge Base)
${XANDEUM_KNOWLEDGE_BASE}
`;

        // 3. PREPARE MESSAGES (Strict Role Mapping)
        const historyMessages = messages.slice(0, -1);
        const history = historyMessages.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
        }));

        // 4. CONFIGURE MODEL
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
        });

        // 5. START CHAT & SEND MESSAGE (Blocking)
        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.2,
            }
        });

        const result = await chat.sendMessage(lastUserMessage);
        const text = result.response.text();

        // 6. VALIDATE RESPONSE
        if (!text || text.trim() === "") {
            throw new Error("Empty Response from Gemini");
        }

        return new Response(text);

    } catch (error: any) {
        console.error("Gemini Chat Error:", error);

        // 7. POLISHED FALLBACK WITH DEEP LINKS
        const q = lastUserMessage.toLowerCase();
        let docLink = "/docs";
        let docTitle = "Xandeum Documentation";

        // Simple Heuristic for Context-Aware Links
        if (q.includes("health") || q.includes("score") || q.includes("uptime")) {
            docLink = "/docs/health-score";
            docTitle = "Health Score Guide";
        } else if (q.includes("storage") || q.includes("space") || q.includes("disk")) {
            docLink = "/docs/metrics"; // Assuming metrics covers storage stats
            docTitle = "Storage Metrics Guide";
        } else if (q.includes("trouble") || q.includes("error") || q.includes("fail") || q.includes("offline")) {
            docLink = "/docs/troubleshooting";
            docTitle = "Troubleshooting Guide";
        } else if (q.includes("install") || q.includes("getting started") || q.includes("setup")) {
            docLink = "/docs/getting-started";
            docTitle = "Getting Started Guide";
        }

        return new Response(
            `I apologize, but I can't provide the full explanation right now. However, you can find the complete details in the official documentation here: [${docTitle}](${docLink})`,
            { status: 200 }
        );
    }
}
