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

export function AIChatWidget({ context, externalOpen, onOpenChange, hideFloatingButton }: AIChatWidgetProps) {
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
                    className="fixed z-50 animate-fade-in"
                    style={position.side === 'right'
                        ? { right: 96, bottom: position.y + 7 }
                        : { left: 96, bottom: position.y + 7 }
                    }
                >
                    <div className="relative bg-card border border-border rounded-xl px-4 py-2 shadow-lg">
                        <button
                            onClick={() => setShowNudge(false)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-muted hover:bg-muted-foreground/20 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-xs"
                        >
                            ×
                        </button>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">Ask me anything!</span>
                        </div>
                        {/* Arrow pointing to button */}
                        <div className={cn(
                            "absolute top-1/2 -translate-y-1/2",
                            position.side === 'right' ? "right-0 translate-x-full" : "left-0 -translate-x-full rotate-180"
                        )}>
                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-border" />
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Chat Button (Draggable) - Hidden when hideFloatingButton is true */}
            {!hideFloatingButton && (
                <button
                    onMouseDown={handleMouseDown}
                    onClick={() => !hasDragged && setIsOpen(!isOpen)}
                    className={cn(
                        "fixed z-50 w-14 h-14 rounded-full shadow-lg",
                        (isSnapping || !isDragging) && "transition-all duration-300 ease-out", // Animate when snapping or not dragging
                        "bg-gradient-to-br from-primary to-orange-600 hover:from-orange-600 hover:to-primary",
                        "flex items-center justify-center text-white",
                        isDragging ? "cursor-grabbing scale-110" : "cursor-grab hover:scale-110",
                        "active:scale-95",
                        isOpen && "rotate-90"
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
                        <Bot className="w-6 h-6" />
                    )}
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className={cn(
                        "fixed z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden",
                        "flex flex-col",
                        // Desktop size
                        "w-[380px] h-[520px]",
                        // Mobile - full width bottom sheet
                        "max-md:bottom-0 max-md:right-0 max-md:left-0 max-md:w-full max-md:h-[70vh] max-md:rounded-b-none"
                    )}
                    style={(() => {
                        // Calculate if there's enough space above the button for the chat window (520px height + 70px offset)
                        const buttonBottom = position.y;
                        const spaceAbove = typeof window !== 'undefined' ? window.innerHeight - buttonBottom - 56 : 600; // 56px is button height
                        const chatHeight = 520;
                        const hasSpaceAbove = spaceAbove >= chatHeight + 20; // 20px padding

                        const baseStyle = position.side === 'right'
                            ? { right: 24 }
                            : { left: 24 };

                        if (hasSpaceAbove) {
                            // Open above the button
                            return { ...baseStyle, bottom: buttonBottom + 70 };
                        } else {
                            // Open below the button (use top instead of bottom)
                            return { ...baseStyle, top: 70 };
                        }
                    })()}
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
                                <div className="bg-orange-50 dark:bg-primary/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
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
                                            ? "bg-orange-600 text-white rounded-tr-sm"
                                            : "bg-orange-50 dark:bg-primary/10 text-foreground rounded-tl-sm"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "text-sm whitespace-pre-wrap",
                                            // Ensure links inside have generic styles if not overridden
                                            "[&>a]:underline [&>a]:underline-offset-2 [&>a]:font-medium"
                                        )}
                                    >
                                        {(() => {
                                            // Helper to parse markdown links and bold
                                            const content = message.content;
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
                                                                "transition-colors",
                                                                message.role === "user"
                                                                    ? "text-white/90 hover:text-white"
                                                                    : "text-primary hover:text-orange-700"
                                                            )}
                                                        >
                                                            {part.text}
                                                        </a>
                                                    );
                                                }
                                                // Handle Bold text
                                                return part.content?.split("**").map((subPart, j) =>
                                                    j % 2 === 1 ? <strong key={`${i}-${j}`}>{subPart}</strong> : subPart
                                                );
                                            });
                                        })()}
                                    </div>
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
