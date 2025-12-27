
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Zap, TrendingUp, BarChart3, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { PNodeInfo } from '@/app/lib/xandeum';
import { calculateHealthScore } from '@/app/lib/scoring-engine';

interface Boost {
    id: string;
    label: string;
    multiplier: number;
    category: 'region' | 'nft' | 'era';
}

const BOOSTS: Boost[] = [
    { id: 'deepsouth', label: 'DeepSouth', multiplier: 16, category: 'region' },
    { id: 'titan', label: 'Titan', multiplier: 11, category: 'nft' },
    { id: 'south', label: 'South', multiplier: 10, category: 'region' },
    { id: 'main', label: 'Main', multiplier: 7, category: 'region' },
    { id: 'dragon', label: 'Dragon', multiplier: 4, category: 'nft' },
    { id: 'coal', label: 'Coal', multiplier: 3.5, category: 'region' },
    { id: 'coyote', label: 'Coyote', multiplier: 2.5, category: 'nft' },
    { id: 'central', label: 'Central', multiplier: 2, category: 'region' },
    { id: 'rabbit', label: 'Rabbit', multiplier: 1.5, category: 'nft' },
    { id: 'cricket', label: 'Cricket', multiplier: 1.1, category: 'nft' },
    { id: 'xeno', label: 'XENO', multiplier: 1.1, category: 'nft' },
];

interface CreditsSimulatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCredits: number;
    totalNetworkCredits: number;
    node: PNodeInfo | null;
    sortedVersions: string[];
    mostCommonVersion: string;
}

export function CreditsSimulatorModal({
    isOpen,
    onClose,
    currentCredits,
    totalNetworkCredits,
    node,
    sortedVersions,
    mostCommonVersion
}: CreditsSimulatorModalProps) {
    const [baseCredits, setBaseCredits] = useState<string>(currentCredits.toString());
    const [selectedBoosts, setSelectedBoosts] = useState<Set<string>>(new Set());

    // Reset when opened with new node
    useEffect(() => {
        if (isOpen) {
            setBaseCredits(currentCredits.toString());
            setSelectedBoosts(new Set());
        }
    }, [isOpen, currentCredits]);

    const toggleBoost = (boostId: string) => {
        const newBoosts = new Set(selectedBoosts);
        if (newBoosts.has(boostId)) {
            newBoosts.delete(boostId);
        } else {
            newBoosts.add(boostId);
        }
        setSelectedBoosts(newBoosts);
    };

    const calculateMetrics = () => {
        const base = parseFloat(baseCredits) || 0;

        // Calculate total multiplier
        let multiplier = 1;
        selectedBoosts.forEach(id => {
            const boost = BOOSTS.find(b => b.id === id);
            if (boost) multiplier *= boost.multiplier;
        });

        const projected = base * multiplier;

        // Network Share Calculation
        const oldContribution = currentCredits || 0;
        const adjustedTotalNetwork = (totalNetworkCredits - oldContribution) + projected;
        const share = adjustedTotalNetwork > 0 ? (projected / adjustedTotalNetwork) * 100 : 0;

        // Validator Consensus Score Impact
        // 1. Current Score
        const currentScore = node
            ? calculateHealthScore(node, totalNetworkCredits, sortedVersions, mostCommonVersion).total
            : 0;

        // 2. Projected Score
        const projectedScore = node
            ? calculateHealthScore({ ...node, credits: projected }, adjustedTotalNetwork, sortedVersions, mostCommonVersion).total
            : 0;

        return { multiplier, projected, share, currentScore, projectedScore };
    };

    const { multiplier, projected, share, currentScore, projectedScore } = calculateMetrics();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-3xl bg-background border border-border shadow-xl">
                <DialogHeader className="pb-4 border-b border-border">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Yield Forecast Calculator
                    </DialogTitle>
                    <DialogDescription>
                        Simulate the impact of multipliers on your node's earning potential and consensus score.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:divide-x divide-border">
                    {/* Left Column: Configuration (Inputs) */}
                    <div className="md:col-span-7 p-6 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Base Performance</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={baseCredits}
                                    onChange={(e) => setBaseCredits(e.target.value)}
                                    className="pl-9 font-mono text-lg bg-muted/30"
                                />
                                <Zap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            </div>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                <AlertCircle className="w-3 h-3" />
                                This is your node's raw credit score before multipliers.
                            </p>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Active Multipliers</Label>
                                <span className="text-xs font-mono font-medium text-primary">Total: {multiplier.toFixed(1)}x</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {BOOSTS.map(boost => {
                                    const isActive = selectedBoosts.has(boost.id);
                                    return (
                                        <button
                                            key={boost.id}
                                            onClick={() => toggleBoost(boost.id)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5",
                                                isActive
                                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                    : "bg-muted/50 border-input text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                            )}
                                        >
                                            {boost.label}
                                            <span className={cn("opacity-70 text-[10px]", isActive ? "text-primary-foreground" : "text-muted-foreground")}>
                                                x{boost.multiplier}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Results (Forecast) */}
                    <div className="md:col-span-5 p-6 bg-muted/10 flex flex-col justify-center">
                        <div className="space-y-8">

                            {/* Projected Credits */}
                            <div>
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Projected Credits</div>
                                <div className="text-3xl font-black text-foreground tracking-tight font-mono">
                                    {projected.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="text-xs font-medium text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        +{(projected - (parseFloat(baseCredits) || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">gain</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Network Share */}
                            <div>
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Est. Daily Yield Share</div>
                                <div className="text-4xl font-black text-primary tracking-tighter">
                                    {share.toPrecision(4)}%
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-2 leading-tight">
                                    Percent of the total daily network rewards pool this node would capture.
                                </p>
                            </div>

                            <Separator />

                            {/* Validator Score Impact */}
                            <div>
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <ShieldCheck className="w-3 h-3" />
                                    Score Impact
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-xl font-bold text-muted-foreground line-through decoration-border">
                                        {currentScore}
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                    <div className={cn(
                                        "text-3xl font-black",
                                        projectedScore >= 70 ? "text-emerald-500" :
                                            projectedScore >= 30 ? "text-amber-400" : "text-red-400"
                                    )}>
                                        {projectedScore}
                                    </div>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-2 leading-tight">
                                    Higher credit balance improves your Validator Consensus Score.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-border bg-muted/5 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button className="font-bold">
                        Apply Strategies
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
