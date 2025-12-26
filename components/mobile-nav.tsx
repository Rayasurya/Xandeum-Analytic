"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, Database, Map, Star, BookOpen } from "lucide-react";

type ViewState = "dashboard" | "pnodes" | "analytics" | "map" | "watchlist";

interface MobileNavProps {
    activeView: ViewState;
    onViewChange: (view: ViewState) => void;
}

interface NavButtonProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}

function NavButton({ icon, label, active, onClick }: NavButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all",
                "active:scale-95",
                active
                    ? "text-primary"
                    : "text-muted-foreground"
            )}
        >
            <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                active && "bg-primary/10"
            )}>
                {icon}
            </div>
            <span className={cn(
                "text-[10px] font-medium",
                active && "font-bold"
            )}>
                {label}
            </span>
        </button>
    );
}

export function MobileNav({ activeView, onViewChange }: MobileNavProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex justify-around items-center md:hidden z-[9999]">
            <NavButton
                icon={<LayoutDashboard className="h-5 w-5" />}
                label="Dashboard"
                active={activeView === "dashboard"}
                onClick={() => onViewChange("dashboard")}
            />
            <NavButton
                icon={<Database className="h-5 w-5" />}
                label="Nodes"
                active={activeView === "pnodes"}
                onClick={() => onViewChange("pnodes")}
            />
            <NavButton
                icon={<Star className="h-5 w-5" />}
                label="Watchlist"
                active={activeView === "watchlist"}
                onClick={() => onViewChange("watchlist")}
            />
            <NavButton
                icon={<Map className="h-5 w-5" />}
                label="Map"
                active={activeView === "map"}
                onClick={() => onViewChange("map")}
            />
            <a
                href="/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-muted-foreground active:scale-95"
            >
                <div className="p-1.5 rounded-lg">
                    <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium">Docs</span>
            </a>
        </nav>
    );
}
