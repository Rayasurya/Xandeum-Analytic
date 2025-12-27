"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Sparkles,
    Activity,
    Map,
    Star,
    MessageSquare,
    ChevronRight,
    ChevronLeft,
    X
} from "lucide-react";

const ONBOARDING_STEPS = [
    {
        icon: Sparkles,
        title: "Welcome to Xandeum Scope",
        description: "Your command center for the Xandeum pNode network. Get real-time insights, AI-powered analytics, and comprehensive health monitoring.",
        gradient: "from-primary via-orange-500 to-amber-500"
    },
    {
        icon: Activity,
        title: "Network Intelligence",
        description: "Track network health with our proprietary scoring algorithm. Instantly identify at-risk nodes, outdated software, and performance bottlenecks.",
        gradient: "from-emerald-500 via-teal-500 to-cyan-500"
    },
    {
        icon: Map,
        title: "Global Visualization",
        description: "Explore the decentralized network on an interactive world map. See node distribution, health status, and regional clusters at a glance.",
        gradient: "from-blue-500 via-indigo-500 to-violet-500"
    },
    {
        icon: MessageSquare,
        title: "AI-Powered Assistant",
        description: "Ask questions about the network in natural language. Our AI analyst understands your dashboard and provides instant, contextual answers.",
        gradient: "from-pink-500 via-rose-500 to-red-500"
    },
    {
        icon: Star,
        title: "Personal Watchlist",
        description: "Track your nodes with a personal watchlist. Get quick access to your most important nodes and monitor their health over time.",
        gradient: "from-amber-500 via-yellow-500 to-orange-500"
    }
];

export function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Check if user has seen onboarding
        const hasSeenOnboarding = localStorage.getItem("xandeum_onboarding_seen");
        if (!hasSeenOnboarding) {
            // Delay opening for smooth page load
            const timer = setTimeout(() => setIsOpen(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem("xandeum_onboarding_seen", "true");
        setIsOpen(false);
    };

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setIsAnimating(false);
            }, 150);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setIsAnimating(false);
            }, 150);
        }
    };

    const handleSkip = () => {
        handleClose();
    };

    if (!isOpen) return null;

    const step = ONBOARDING_STEPS[currentStep];
    const Icon = step.icon;
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Modal */}
            <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Gradient header */}
                <div className={cn(
                    "relative h-48 bg-gradient-to-br overflow-hidden transition-all duration-500",
                    step.gradient
                )}>
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)]" />
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4zKSIvPjwvZz48L3N2Zz4=')]" />
                    </div>

                    {/* Icon */}
                    <div className={cn(
                        "absolute inset-0 flex items-center justify-center transition-all duration-300",
                        isAnimating ? "opacity-0 scale-90" : "opacity-100 scale-100"
                    )}>
                        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <Icon className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className={cn(
                        "text-center space-y-3 transition-all duration-300",
                        isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                    )}>
                        <h2 className="text-2xl font-bold text-foreground">
                            {step.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {step.description}
                        </p>
                    </div>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-2">
                        {ONBOARDING_STEPS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setIsAnimating(true);
                                    setTimeout(() => {
                                        setCurrentStep(index);
                                        setIsAnimating(false);
                                    }, 150);
                                }}
                                className={cn(
                                    "h-2 rounded-full transition-all duration-300",
                                    index === currentStep
                                        ? "w-8 bg-primary"
                                        : "w-2 bg-muted hover:bg-muted-foreground/30"
                                )}
                            />
                        ))}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex gap-3">
                        {currentStep > 0 ? (
                            <Button
                                variant="outline"
                                onClick={handlePrev}
                                className="flex-1"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Back
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                onClick={handleSkip}
                                className="flex-1 text-muted-foreground"
                            >
                                Skip Tour
                            </Button>
                        )}
                        <Button
                            onClick={handleNext}
                            className={cn(
                                "flex-1 bg-gradient-to-r text-white",
                                step.gradient
                            )}
                        >
                            {isLastStep ? "Get Started" : "Next"}
                            {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
