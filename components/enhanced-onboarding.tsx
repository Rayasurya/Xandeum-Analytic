"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Sparkles, Map, Monitor, Smartphone,
    ArrowRight, ChevronRight
} from "lucide-react";
import type { CallBackProps, Step, Styles } from "react-joyride";

// Dynamic import for Joyride (client-only)
const Joyride = dynamic(() => import("react-joyride"), { ssr: false });

// Type for tour callback
type JoyrideCallback = (data: CallBackProps) => void;

export function EnhancedOnboarding() {
    const [showWelcome, setShowWelcome] = useState(false);
    const [runTour, setRunTour] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const isMobile = useMediaQuery("(max-width: 768px)");

    // Check if user has seen onboarding before
    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem("xandeum_onboarding_v2_seen");
        if (!hasSeenOnboarding) {
            // Delay to let the page load completely
            const timer = setTimeout(() => setShowWelcome(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    // Device-aware features
    const deviceFeatures = isMobile
        ? {
            icon: Smartphone,
            title: "Welcome to Xandeum Scope",
            subtitle: "Mobile Experience",
            description: "We've optimized the experience for your device:",
            features: [
                "Swipe-friendly card navigation",
                "Bottom tab bar for quick access",
                "Touch-optimized node cards",
                "Slide-up node intelligence drawer"
            ],
            highlight: "All core features available on the go!"
        }
        : {
            icon: Monitor,
            title: "Welcome to Xandeum Scope",
            subtitle: "Desktop Experience",
            description: "You're getting the full power experience:",
            features: [
                "Full sortable node registry table",
                "Side-by-side intelligence panel",
                "Advanced map filtering & clustering",
                "Multi-metric comparison view"
            ],
            highlight: "Maximum data visibility and control!"
        };

    // Tour steps - Focus on elements visible in Dashboard view first
    // Then guide to switching views
    const tourSteps: Step[] = isMobile
        ? [
            {
                target: ".dashboard-stats-row",
                content: (
                    <div className="space-y-2">
                        <h3 className="font-bold text-foreground">📊 Network Stats</h3>
                        <p className="text-sm text-muted-foreground">
                            Real-time overview: total nodes, active nodes, health status, and at-risk alerts.
                        </p>
                        <p className="text-xs text-primary font-medium">Tap any card to filter by that metric!</p>
                    </div>
                ),
                placement: "bottom" as const,
                disableBeacon: true,
                disableScrolling: true,
            },
            {
                target: ".mobile-nav",
                content: (
                    <div className="space-y-2">
                        <h3 className="font-bold text-foreground">🧭 Navigation Bar</h3>
                        <p className="text-sm text-muted-foreground">
                            Switch views: Dashboard, Nodes, Watchlist, Map, and Docs. All just one tap away!
                        </p>
                        <p className="text-xs text-primary font-medium">Try tapping "Nodes" to see the node list!</p>
                    </div>
                ),
                placement: "top" as const,
                disableBeacon: true,
                disableScrolling: true,
            },
            {
                target: ".ai-chat-button",
                content: (
                    <div className="space-y-2">
                        <h3 className="font-bold text-foreground">🤖 AI Assistant</h3>
                        <p className="text-sm text-muted-foreground">
                            Ask anything! "Which nodes have low health?", "Show storage stats", "Explain credits"
                        </p>
                        <p className="text-xs text-primary font-medium">Your personal analytics assistant!</p>
                    </div>
                ),
                placement: "left" as const,
                disableBeacon: true,
                disableScrolling: true,
            },
        ]
        : [
            {
                target: ".dashboard-stats-row",
                content: (
                    <div className="space-y-2">
                        <h3 className="font-bold text-foreground">📊 Network Dashboard</h3>
                        <p className="text-sm text-muted-foreground">
                            Real-time stats: total nodes, active nodes, health distribution, and storage capacity.
                        </p>
                        <p className="text-xs text-primary font-medium">Click any stat for deeper insights!</p>
                    </div>
                ),
                placement: "bottom" as const,
                disableBeacon: true,
                disableScrolling: true,
            },
            {
                target: ".view-tabs-desktop",
                content: (
                    <div className="space-y-2">
                        <h3 className="font-bold text-foreground">🗂️ View Tabs</h3>
                        <p className="text-sm text-muted-foreground">
                            Switch between Dashboard, Node Registry (table), Watchlist, and Global Map.
                        </p>
                        <p className="text-xs text-primary font-medium">Try "Node Registry" to see all nodes!</p>
                    </div>
                ),
                placement: "bottom" as const,
                disableBeacon: true,
                disableScrolling: true,
            },
            {
                target: ".ai-chat-button",
                content: (
                    <div className="space-y-2">
                        <h3 className="font-bold text-foreground">🤖 AI Assistant</h3>
                        <p className="text-sm text-muted-foreground">
                            Ask anything! "Which nodes have low health?", "Show me storage stats", "Explain pNode credits"
                        </p>
                        <p className="text-xs text-primary font-medium">Click to start a conversation!</p>
                    </div>
                ),
                placement: "left" as const,
                disableBeacon: true,
                disableScrolling: true,
            },
        ];

    // Joyride custom styles
    const joyrideStyles: Partial<Styles> = {
        options: {
            arrowColor: "hsl(var(--card))",
            backgroundColor: "hsl(var(--card))",
            overlayColor: "rgba(0, 0, 0, 0.7)",
            primaryColor: "hsl(var(--primary))",
            textColor: "hsl(var(--foreground))",
            zIndex: 10000,
        },
        tooltip: {
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
        tooltipContainer: {
            textAlign: "left" as const,
        },
        buttonNext: {
            backgroundColor: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            borderRadius: "8px",
            padding: "8px 16px",
            fontWeight: 600,
        },
        buttonBack: {
            color: "hsl(var(--muted-foreground))",
            marginRight: "8px",
        },
        buttonSkip: {
            color: "hsl(var(--muted-foreground))",
        },
        spotlight: {
            borderRadius: "12px",
        },
    };

    // Handle Joyride callback
    const handleJoyrideCallback: JoyrideCallback = useCallback((data) => {
        const { status, action, index, type } = data;

        // Handle finish/skip
        if (status === "finished" || status === "skipped") {
            setRunTour(false);
            setStepIndex(0);
            localStorage.setItem("xandeum_onboarding_v2_seen", "true");
            return;
        }

        // Handle step transitions (both Next and Back)
        if (type === "step:after") {
            if (action === "next") {
                setStepIndex(index + 1);
            } else if (action === "prev") {
                setStepIndex(index - 1);
            }
        }

        // Handle close button on individual steps
        if (action === "close") {
            setRunTour(false);
            setStepIndex(0);
            localStorage.setItem("xandeum_onboarding_v2_seen", "true");
        }
    }, []);

    // Start the interactive tour
    const handleStartTour = () => {
        setShowWelcome(false);
        // Small delay to let the dialog close
        setTimeout(() => {
            setStepIndex(0);
            setRunTour(true);
        }, 400);
    };

    // Skip onboarding
    const handleSkip = () => {
        setShowWelcome(false);
        localStorage.setItem("xandeum_onboarding_v2_seen", "true");
    };

    const DeviceIcon = deviceFeatures.icon;

    return (
        <>
            {/* Welcome Dialog */}
            <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
                <DialogContent className="sm:max-w-lg border-border bg-gradient-to-br from-background via-background to-primary/5">
                    <DialogHeader className="space-y-4">
                        {/* Device Icon Badge */}
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/20">
                            <DeviceIcon className="w-8 h-8 text-white" />
                        </div>

                        <div className="text-center">
                            <DialogTitle className="text-2xl font-bold text-foreground">
                                {deviceFeatures.title}
                            </DialogTitle>
                            <p className="text-sm text-primary font-medium mt-1">
                                {deviceFeatures.subtitle}
                            </p>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <p className="text-muted-foreground text-center">
                            {deviceFeatures.description}
                        </p>

                        {/* Feature List */}
                        <div className="space-y-2 bg-muted/50 rounded-xl p-4">
                            {deviceFeatures.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                                    <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                                    {feature}
                                </div>
                            ))}
                        </div>

                        {/* Highlight */}
                        <div className="flex items-center justify-center gap-2 text-primary font-medium text-sm">
                            <Sparkles className="w-4 h-4" />
                            {deviceFeatures.highlight}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={handleStartTour}
                            className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-500 text-white font-semibold h-12 text-base"
                        >
                            <Map className="w-5 h-5 mr-2" />
                            Start Interactive Tour
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleSkip}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Skip for now
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Joyride Tour */}
            <Joyride
                steps={tourSteps}
                run={runTour}
                stepIndex={stepIndex}
                callback={handleJoyrideCallback}
                continuous
                showProgress
                showSkipButton
                disableScrolling
                spotlightClicks
                disableOverlayClose
                hideCloseButton={false}
                styles={joyrideStyles}
                floaterProps={{
                    disableAnimation: false,
                }}
                locale={{
                    back: "Back",
                    close: "Close",
                    last: "Got it!",
                    next: "Next",
                    skip: "Skip Tour",
                }}
            />
        </>
    );
}
