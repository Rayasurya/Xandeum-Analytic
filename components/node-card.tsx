"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Star, Wifi, WifiOff, Activity, HardDrive, MapPin } from "lucide-react";

interface NodeCardProps {
    node: any; // PNodeInfo
    healthScore: {
        total: number;
        status: "HEALTHY" | "WARNING" | "CRITICAL";
    };
    isWatched: boolean;
    location?: string;
    onClick: () => void;
}

function formatPubkey(key: string): string {
    if (!key || key.length < 12) return key || "Unknown";
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

function formatStorage(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function NodeCard({ node, healthScore, isWatched, location, onClick }: NodeCardProps) {
    const isOnline = !!node.rpc;

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-4 bg-card rounded-xl border border-border mb-3 shadow-sm",
                "active:scale-[0.98] transition-all cursor-pointer",
                "hover:border-primary/50 hover:bg-card/80"
            )}
        >
            {/* Header: Pubkey + Status */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-foreground font-bold">
                        {formatPubkey(node.pubkey)}
                    </code>
                    {isWatched && (
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    {isOnline ? (
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-none text-[10px] px-1.5 py-0.5">
                            <Wifi className="h-3 w-3 mr-0.5" />
                            Online
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                            <WifiOff className="h-3 w-3 mr-0.5" />
                            Offline
                        </Badge>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                {/* Health Score */}
                <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        Health
                    </p>
                    <div className="flex items-center gap-1.5">
                        <span className={cn(
                            "font-bold text-sm",
                            healthScore.status === "HEALTHY" && "text-emerald-500",
                            healthScore.status === "WARNING" && "text-amber-500",
                            healthScore.status === "CRITICAL" && "text-red-500"
                        )}>
                            {healthScore.total}
                        </span>
                        <span className="text-[10px] text-muted-foreground">/100</span>
                    </div>
                </div>

                {/* Storage */}
                <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        Storage
                    </p>
                    <p className="font-bold text-sm text-foreground">
                        {formatStorage(node.storage_committed || 0)}
                    </p>
                </div>

                {/* Location */}
                <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Location
                    </p>
                    <p className="font-bold text-sm text-foreground truncate">
                        {location || "Unknown"}
                    </p>
                </div>
            </div>

            {/* Health Bar */}
            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all",
                        healthScore.total >= 75 && "bg-emerald-500",
                        healthScore.total >= 50 && healthScore.total < 75 && "bg-amber-500",
                        healthScore.total < 50 && "bg-red-500"
                    )}
                    style={{ width: `${healthScore.total}%` }}
                />
            </div>
        </div>
    );
}
