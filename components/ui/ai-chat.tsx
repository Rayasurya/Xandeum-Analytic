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
    externalOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    hideFloatingButton?: boolean;
    initialMessage?: string;
    onMessageSent?: () => void; // Callback to clear message from parent
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

export function AIChatWidget({ context, externalOpen, onOpenChange, hideFloatingButton, initialMessage, onMessageSent }: AIChatWidgetProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
    const setIsOpen = (open: boolean) => {
        if (onOpenChange) {
            onOpenChange(open);
        } else {
            setInternalOpen(open);
        }
    };
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showNudge, setShowNudge] = useState(true);
    const [position, setPosition] = useState({ side: 'right' as 'left' | 'right', y: 24 }); // side and y distance from bottom
    const [isDragging, setIsDragging] = useState(false);
    const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null); // temp position during drag
    const dragRef = useRef<{ startX: number; startY: number; startY2: number } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Auto-send initial message
    useEffect(() => {
        if (isOpen && initialMessage && !isLoading) {
            setInput(initialMessage);
            // Small delay to allow state update before submitting
            setTimeout(() => {
                if (formRef.current) {
                    formRef.current.requestSubmit();
                    if (onMessageSent) onMessageSent();
                }
            }, 100);
        }
    }, [isOpen, initialMessage]); // Only depend on these to avoid loops

    // Load saved position from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('chatbot-position-v2');
        if (saved) {
            try {
                const pos = JSON.parse(saved);
                setPosition(pos);
            } catch (e) {
                // ignore parse errors
            }
        }
    }, []);

    // Save position to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('chatbot-position-v2', JSON.stringify(position));
    }, [position]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-hide nudge after opening chat once
    useEffect(() => {
        if (isOpen) {
            setShowNudge(false);
        }
    }, [isOpen]);

    // Drag handlers
    const [hasDragged, setHasDragged] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setHasDragged(false); // Reset on mousedown
        const currentX = position.side === 'right' ? window.innerWidth - 24 - 56 : 24;
        setDragPos({ x: currentX, y: window.innerHeight - position.y - 56 });
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startY2: position.y
        };
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !dragRef.current) return;

        // Check if mouse moved more than 5 pixels (threshold for drag vs click)
        const deltaX = Math.abs(e.clientX - dragRef.current.startX);
        const deltaY = Math.abs(e.clientY - dragRef.current.startY);
        if (deltaX > 5 || deltaY > 5) {
            setHasDragged(true);
        }

        const newX = Math.max(10, Math.min(window.innerWidth - 66, e.clientX - 28));
        const newYDelta = dragRef.current.startY - e.clientY;
        const newY = Math.max(10, Math.min(window.innerHeight - 70, dragRef.current.startY2 + newYDelta));

        setDragPos({ x: newX, y: window.innerHeight - newY - 56 });
        // Update y position for final snap
        setPosition(prev => ({ ...prev, y: newY }));
    };

    const [isSnapping, setIsSnapping] = useState(false);

    const handleMouseUp = () => {
        if (isDragging && dragPos) {
            // Enable snap animation
            setIsSnapping(true);
            // Snap to left or right based on which side is closer
            const snapToRight = dragPos.x > window.innerWidth / 2;
            setPosition(prev => ({ side: snapToRight ? 'right' : 'left', y: prev.y }));
            setDragPos(null);
            setIsDragging(false);
            dragRef.current = null;
            // Disable snap animation after it completes
            setTimeout(() => setIsSnapping(false), 300);
        }
    };

    // Global mouse event listeners for dragging
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging]);

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
            {/* AI Nudge Tooltip */}
            {showNudge && !isOpen && !isDragging && !hideFloatingButton && (
                <div
                    className="fixed z-50 animate-in fade-in slide-in-from-bottom-2 duration-500"
                    style={position.side === 'right'
                        ? { right: 96, bottom: position.y + 12 }
                        : { left: 96, bottom: position.y + 12 }
                    }
                >
                    <div className="relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-border/50 rounded-2xl px-5 py-3 shadow-xl">
                        <button
                            onClick={() => setShowNudge(false)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-primary/10 rounded-full animate-pulse">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Need insights?</p>
                                <p className="text-xs text-muted-foreground">Ask me about network health...</p>
                            </div>
                        </div>
                        {/* Arrow pointing to button */}
                        <div className={cn(
                            "absolute top-1/2 -translate-y-1/2",
                            position.side === 'right' ? "right-0 translate-x-full" : "left-0 -translate-x-full rotate-180"
                        )}>
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[10px] border-l-border/50" />
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Chat Button (Draggable) */}
            {!hideFloatingButton && (
                <button
                    onMouseDown={handleMouseDown}
                    onClick={() => !hasDragged && setIsOpen(!isOpen)}
                    className={cn(
                        "ai-chat-button fixed z-50 w-14 h-14 rounded-full shadow-2xl shadow-primary/20",
                        (isSnapping || !isDragging) && "transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)", // Bouncy spring
                        "bg-gradient-to-tr from-primary to-orange-500 hover:brightness-110",
                        "flex items-center justify-center text-white border-4 border-background/20 backdrop-blur-sm",
                        isDragging ? "cursor-grabbing scale-110" : "cursor-grab hover:scale-105",
                        "active:scale-90",
                        isOpen && "rotate-90 scale-90 bg-zinc-800 from-zinc-800 to-zinc-800"
                    )}
                    style={isDragging && dragPos
                        ? { left: dragPos.x, top: dragPos.y }
                        : position.side === 'right'
                            ? { right: 24, bottom: position.y }
                            : { left: 24, bottom: position.y }
                    }
                >
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Bot className="w-7 h-7" />
                    )}
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className={cn(
                        "fixed z-50 flex flex-col overflow-hidden",
                        "bg-background/80 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl",
                        "rounded-[2rem]",
                        // Desktop size
                        "w-[400px] h-[600px]",
                        // Mobile - full width bottom sheet
                        "max-md:bottom-0 max-md:right-0 max-md:left-0 max-md:w-full max-md:h-[85vh] max-md:rounded-b-none max-md:rounded-t-[2rem]",
                        // Entry animation
                        "animate-in slide-in-from-bottom-10 fade-in duration-300"
                    )}
                    style={(() => {
                        if (hideFloatingButton) {
                            return { top: 72, right: 20 };
                        }
                        const buttonBottom = position.y;
                        const spaceAbove = typeof window !== 'undefined' ? window.innerHeight - buttonBottom - 56 : 600;
                        const chatHeight = 600;
                        const hasSpaceAbove = spaceAbove >= chatHeight + 20;

                        const baseStyle = position.side === 'right'
                            ? { right: 24 }
                            : { left: 24 };

                        if (hasSpaceAbove) {
                            return { ...baseStyle, bottom: buttonBottom + 75 };
                        } else {
                            return { ...baseStyle, top: 80 };
                        }
                    })()}
                >
                    {/* Header */}
                    <div className="flex items-center gap-4 px-6 py-4 border-b border-border/40 bg-white/5 dark:bg-black/5 backdrop-blur-md sticky top-0 z-10">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-base text-foreground tracking-tight">Xandeum Assistant</h3>
                            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Online • v1.5 Flash</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 -mr-2 text-muted-foreground/70 hover:text-foreground transition-colors hover:bg-muted/50 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar scroll-smooth">
                        {/* Welcome Message */}
                        {messages.length === 0 && (
                            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="bg-muted/30 border border-muted/50 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[85%] shadow-sm">
                                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                                        {WELCOME_MESSAGE.split("**").map((part, i) =>
                                            i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
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
                                    "flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300",
                                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-auto mb-1 shadow-sm",
                                        message.role === "user"
                                            ? "bg-gradient-to-br from-primary to-orange-600"
                                            : "bg-white dark:bg-zinc-800 border border-border"
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
                                        "px-5 py-3 max-w-[85%] shadow-sm text-sm leading-relaxed",
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-[1.25rem] rounded-tr-sm"
                                            : "bg-white dark:bg-zinc-800 border border-border/50 text-foreground rounded-[1.25rem] rounded-tl-sm"
                                    )}
                                >
                                    <div className={cn(
                                        "whitespace-pre-wrap",
                                        "[&>a]:underline [&>a]:underline-offset-4 [&>a]:decoration-white/30 hover:[&>a]:decoration-white/100"
                                    )}>
                                        {(() => {
                                            const content = message.content;
                                            // Simple markdown link parser
                                            const parts = [];
                                            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                                            let lastIndex = 0;
                                            let match;

                                            while ((match = linkRegex.exec(content)) !== null) {
                                                if (match.index > lastIndex) {
                                                    parts.push({ type: 'text', content: content.substring(lastIndex, match.index) });
                                                }
                                                parts.push({ type: 'link', text: match[1], url: match[2] });
                                                lastIndex = match.index + match[0].length;
                                            }
                                            if (lastIndex < content.length) {
                                                parts.push({ type: 'text', content: content.substring(lastIndex) });
                                            }

                                            return parts.map((part, i) => {
                                                if (part.type === 'link') {
                                                    return (
                                                        <a
                                                            key={i}
                                                            href={part.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={cn(
                                                                "font-medium transition-opacity",
                                                                message.role === "user" ? "text-white" : "text-primary hover:opacity-80 decoration-primary/30"
                                                            )}
                                                        >
                                                            {part.text}
                                                        </a>
                                                    );
                                                }
                                                return part.content?.split("**").map((subPart, j) =>
                                                    j % 2 === 1 ? <strong key={`${i}-${j}`} className="font-bold">{subPart}</strong> : subPart
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex gap-4 animate-in fade-in duration-300">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-border flex items-center justify-center flex-shrink-0 mt-auto mb-1">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                                <div className="bg-white dark:bg-zinc-800 border border-border/50 rounded-[1.25rem] rounded-tl-sm px-4 py-3 shadow-sm">
                                    <div className="flex gap-1.5 items-center h-5">
                                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} className="h-2" />
                    </div>

                    {/* Suggestions Area */}
                    {messages.length === 0 && !isLoading && (
                        <div className="px-5 pb-3">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3 pl-1">Suggested Questions</p>
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTIONS.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="text-xs px-3 py-2 rounded-xl bg-muted/50 hover:bg-primary/10 border border-border/50 hover:border-primary/20 text-foreground transition-all duration-200 active:scale-95 text-left"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-white/5 dark:bg-black/5 backdrop-blur-md border-t border-border/40">
                        <form
                            ref={formRef}
                            id="chat-form"
                            onSubmit={handleSubmit}
                            className="relative flex items-end gap-2"
                        >
                            <div className="relative flex-1">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="pr-4 py-6 bg-muted/50 border-transparent focus:bg-background focus:border-primary/30 rounded-2xl shadow-inner transition-all placeholder:text-muted-foreground/70"
                                    disabled={isLoading}
                                    autoComplete="off"
                                />
                            </div>
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className={cn(
                                    "h-12 w-12 rounded-2xl shadow-lg transition-all duration-300",
                                    input.trim()
                                        ? "bg-gradient-to-tr from-primary to-orange-500 hover:brightness-110 hover:shadow-primary/25 hover:-translate-y-0.5"
                                        : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                                )}
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        </form>
                        <div className="text-[10px] text-center text-muted-foreground/40 mt-2 font-medium">
                            AI can make mistakes. Check important info.
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
