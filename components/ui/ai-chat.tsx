"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";

interface ChatContext {
    totalNodes: number;
    activeNodes: number;
    totalStorage: string;
    healthyCount: number;
    warningCount: number;
    criticalCount: number;
    lastUpdated?: string;
    atRiskNodes?: string[];
    topCountries?: string[];
    offlineNodes?: string[];
    softwareVersions?: string[];
}

interface AIChatWidgetProps {
    context: ChatContext;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

const WELCOME_MESSAGE = `👋 Hi! I'm **Xandeum Scope AI**.

I can help you with:
• Network statistics (active nodes, storage, health)
• Node diagnostics (why is my node unhealthy?)
• Understanding dashboard metrics

*I can only answer based on current dashboard data.*`;

const SUGGESTIONS = [
    "How many nodes are active?",
    "Network health summary",
    "What's the total storage?",
    "Show node issues",
];

export function AIChatWidget({ context }: AIChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    context,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to get response");
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantContent = "";

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "",
            };
            setMessages((prev) => [...prev, assistantMessage]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    assistantContent += chunk;

                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantMessage.id
                                ? { ...m, content: assistantContent }
                                : m
                        )
                    );
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, something went wrong. Please try again.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        // Trigger submit after state update
        setTimeout(() => {
            const form = document.getElementById("chat-form") as HTMLFormElement;
            if (form) form.requestSubmit();
        }, 50);
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300",
                    "bg-gradient-to-br from-primary to-orange-600 hover:from-orange-600 hover:to-primary",
                    "flex items-center justify-center text-white",
                    "hover:scale-110 active:scale-95",
                    isOpen && "rotate-90"
                )}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageSquare className="w-6 h-6" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div
                    className={cn(
                        "fixed z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden",
                        "flex flex-col",
                        // Desktop
                        "bottom-24 right-6 w-[380px] h-[520px]",
                        // Mobile
                        "max-md:bottom-0 max-md:right-0 max-md:left-0 max-md:w-full max-md:h-[70vh] max-md:rounded-b-none"
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-orange-500/10 border-b border-border">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm text-foreground">Xandeum Scope AI</h3>
                            <p className="text-[10px] text-muted-foreground">Network Analytics Assistant</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {/* Welcome Message */}
                        {messages.length === 0 && (
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                                    <p className="text-sm text-foreground whitespace-pre-line">
                                        {WELCOME_MESSAGE.split("**").map((part, i) =>
                                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Chat Messages */}
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex gap-3",
                                    message.role === "user" && "flex-row-reverse"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                                        message.role === "user" ? "bg-primary" : "bg-muted"
                                    )}
                                >
                                    {message.role === "user" ? (
                                        <User className="w-4 h-4 text-white" />
                                    ) : (
                                        <Bot className="w-4 h-4 text-primary" />
                                    )}
                                </div>
                                <div
                                    className={cn(
                                        "rounded-2xl px-4 py-3 max-w-[85%]",
                                        message.role === "user"
                                            ? "bg-primary text-white rounded-tr-sm"
                                            : "bg-muted text-foreground rounded-tl-sm"
                                    )}
                                >
                                    <p className="text-sm whitespace-pre-wrap">
                                        {message.content.split("**").map((part, i) =>
                                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length === 0 && !isLoading && (
                        <div className="px-4 pb-2 flex flex-wrap gap-2">
                            {SUGGESTIONS.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <form
                        id="chat-form"
                        onSubmit={handleSubmit}
                        className="p-3 border-t border-border bg-background/50"
                    >
                        <div className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about the network..."
                                className="flex-1 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className="bg-primary hover:bg-orange-600 text-white"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
