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
        const body = await req.json();
        const messages = body.messages || [];
        const context = body.context || {};

        // 1. PREPARE CONTEXT & STATS
        const healthyCount = context.healthyCount || 0;
        const totalNodes = context.totalNodes || 0;
        const activeNodes = context.activeNodes || 0;
        const activePct = totalNodes > 0 ? Math.round((activeNodes / totalNodes) * 100) : 0;

        // Capture for fallback usage
        lastUserMessage = messages.length > 0 ? messages[messages.length - 1].content : "";

        // 2. DETERMINISTIC QUICK ANSWERS (Root Fix for Reliability)
        // Bypass AI for specific stats questions to ensure always-correct, instant answers.
        const lowerMsg = lastUserMessage.toLowerCase();

        // Helper to check for quantity intent
        const isAskingStatus = (msg: string) =>
            msg.includes("how many") ||
            msg.includes("how much") ||
            msg.includes("total") ||
            msg.includes("count") ||
            msg.includes("number of") ||
            msg.includes("status of");

        // Nodes Count
        if (lowerMsg.includes("nodes") && (isAskingStatus(lowerMsg) || lowerMsg === "nodes")) {
            if (lowerMsg.includes("active") || lowerMsg.includes("online")) {
                return new Response(`There are **${activeNodes} active nodes** (${activePct}% of the network).`);
            }
            return new Response(`There are currently **${totalNodes} nodes** in the Xandeum network.`);
        }

        // Network Health
        if ((lowerMsg.includes("healthy") || lowerMsg.includes("health")) && isAskingStatus(lowerMsg)) {
            return new Response(`There are **${healthyCount} healthy nodes** in the network.`);
        }

        // Storage - Be strict to avoid catching "What is storage?"
        if ((lowerMsg.includes("storage") || lowerMsg.includes("disk")) && (isAskingStatus(lowerMsg) || lowerMsg.includes("available") || lowerMsg.includes("committed"))) {
            return new Response(`The total committed network storage is **${context.totalStorage || "Unknown"}**.`);
        }

        // Greetings - Handle simple conversational inputs
        const greetings = ["hey", "hello", "hi", "yo", "sup", "hola", "greetings"];
        const isGreeting = greetings.some(g => lowerMsg === g || lowerMsg.startsWith(g + " ") || lowerMsg.startsWith(g + ",") || lowerMsg.startsWith(g + "!"));
        if (isGreeting) {
            return new Response(`Hey there! 👋 I'm the Xandeum Scope AI. I can help you with:
• **Network stats** - "How many nodes are active?"
• **Health info** - "Show me unhealthy nodes"
• **Storage data** - "What's the total storage?"

Or explore the [Documentation](/docs) for in-depth guides!`);
        }

        // Thanks / Goodbye
        const thanks = ["thanks", "thank you", "thx", "ty", "appreciate"];
        const isThanks = thanks.some(t => lowerMsg.includes(t));
        if (isThanks) {
            return new Response(`You're welcome! 🙌 Let me know if you have any other questions about the Xandeum network.`);
        }

        // Generic short messages that aren't questions
        if (lowerMsg.length < 5 && !lowerMsg.includes("?")) {
            return new Response(`I'm here to help with Xandeum network analytics! Try asking:
• "How many nodes are online?"
• "What's the network health?"
• "Explain the health score"

Learn more: [Documentation](/docs)`);
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
- **ALWAYS INCLUDE DOC LINKS**: When you cannot fully answer a question OR when the topic has a related documentation page, ALWAYS include a relevant link at the end of your response using this format:
  - For health/uptime topics: "Learn more: [Health Score Guide](/docs/health-score)"
  - For storage/metrics topics: "Learn more: [Metrics Guide](/docs/metrics)"
  - For setup/installation topics: "Learn more: [Getting Started](/docs/getting-started)"
  - For errors/problems topics: "Learn more: [Troubleshooting Guide](/docs/troubleshooting)"
  - For general topics: "Learn more: [Documentation](/docs)"
- **TONE**: Professional, concise, and friendly.

## LIVE SYSTEM DATA (Real-Time)
- Total Nodes: ${totalNodes}
- Active Nodes: ${activeNodes} (${activePct}%)
- Healthy Nodes: ${healthyCount}
- Network Storage: ${context.totalStorage || "Unknown"}
- At Risk Nodes: ${context.atRiskNodes?.length ? context.atRiskNodes.slice(0, 5).join(", ") : "None"}

## DOCUMENTATION (Knowledge Base)
${XANDEUM_KNOWLEDGE_BASE}
`;

        // 4. PREPARE MESSAGES (Strict Role Mapping)
        const historyMessages = messages.slice(0, -1);
        const history = historyMessages.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
        }));

        // 5. CONFIGURE MODEL
        // Switched to 'gemini-pro' for better stability (1.5-flash was returning 404s)
        const model = genAI.getGenerativeModel({
            model: "gemini-pro",
            systemInstruction: systemInstruction,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
        });

        // 6. START CHAT & SEND MESSAGE (Blocking)
        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.2,
            }
        });

        const result = await chat.sendMessage(lastUserMessage);
        const text = result.response.text();

        // 7. VALIDATE RESPONSE
        if (!text || text.trim() === "") {
            throw new Error("Empty Response from Gemini");
        }

        return new Response(text);

    } catch (error: any) {
        console.error("Gemini Chat Error:", error);

        // 8. POLISHED FALLBACK WITH DEEP LINKS & ERROR INFO
        const q = lastUserMessage.toLowerCase();
        let docLink = "/docs";
        let docTitle = "Xandeum Documentation";

        // Simple Heuristic for Context-Aware Links
        if (q.includes("health") || q.includes("score") || q.includes("uptime")) {
            docLink = "/docs/health-score";
            docTitle = "Health Score Guide";
        } else if (q.includes("storage") || q.includes("space") || q.includes("disk")) {
            docLink = "/docs/metrics";
            docTitle = "Storage Metrics Guide";
        } else if (q.includes("trouble") || q.includes("error") || q.includes("fail") || q.includes("offline")) {
            docLink = "/docs/troubleshooting";
            docTitle = "Troubleshooting Guide";
        } else if (q.includes("install") || q.includes("getting started") || q.includes("setup")) {
            docLink = "/docs/getting-started";
            docTitle = "Getting Started Guide";
        }

        // Return a SHORT, POLITE fallback as requested
        return new Response(
            `I apologize, but I cannot help you with that request right now.\n\nYou can find detailed information here: [${docTitle}](${docLink})`,
            { status: 200 }
        );
    }
}
