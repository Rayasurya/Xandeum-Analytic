
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Zap, Trophy, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";

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
}

export function CreditsSimulatorModal({
    isOpen,
    onClose,
    currentCredits,
    totalNetworkCredits
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
        // We remove the OLD credit contribution of this node from total, and add the NEW projected one
        // AdjustedTotal = (Total - OldBase + Projected)
        // Share = Projected / AdjustedTotal
        const oldContribution = currentCredits || 0;
        const adjustedTotalNetwork = (totalNetworkCredits - oldContribution) + projected;
        const share = adjustedTotalNetwork > 0 ? (projected / adjustedTotalNetwork) * 100 : 0;

        return { multiplier, projected, share };
    };

    const { multiplier, projected, share } = calculateMetrics();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl bg-black border border-amber-500/30 text-amber-50 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-amber-500">
                        <Calculator className="w-6 h-6" />
                        STOINC SIMULATOR
                    </DialogTitle>
                    <DialogDescription className="text-amber-500/60">
                        Forecast your earnings potential by applying network boosts.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    {/* Left Column: Inputs */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold tracking-wider text-amber-500/80">Base Reputation Credits</Label>
                            <Input
                                type="number"
                                value={baseCredits}
                                onChange={(e) => setBaseCredits(e.target.value)}
                                className="bg-zinc-900/50 border-amber-500/20 text-white font-mono text-lg focus:border-amber-500/50 focus:ring-amber-500/20"
                            />
                            <p className="text-[10px] text-zinc-500">
                                Defaults to current node credits. Adjust to simulate hardware upgrades.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs uppercase font-bold tracking-wider text-amber-500/80 flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> Apply Boosts
                                </Label>
                                <span className="text-[10px] text-zinc-500">Multipliers stack</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {BOOSTS.map(boost => {
                                    const isActive = selectedBoosts.has(boost.id);
                                    return (
                                        <button
                                            key={boost.id}
                                            onClick={() => toggleBoost(boost.id)}
                                            className={cn(
                                                "px-2 py-2 rounded text-xs font-medium border transition-all duration-200 flex flex-col items-center justify-center gap-1",
                                                isActive
                                                    ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                                                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-amber-500/30 hover:text-amber-500/70"
                                            )}
                                        >
                                            <span>{boost.label}</span>
                                            <span className={cn("text-[10px] font-bold opacity-80", isActive ? "text-black" : "text-amber-500")}>
                                                x{boost.multiplier}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Outcomes */}
                    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 flex flex-col justify-between relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />

                        <div className="space-y-6 relative z-10">
                            <div className="text-center">
                                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Total Boost Factor</div>
                                <div className="text-4xl font-black text-white flex items-center justify-center gap-1">
                                    <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
                                    <span>{multiplier.toLocaleString(undefined, { maximumFractionDigits: 1 })}x</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-zinc-400">Projected Credits</span>
                                    <span className="text-2xl font-bold text-amber-400 font-mono">
                                        {projected.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    {/* Visual bar just for flavor */}
                                    <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: '100%' }} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 relative z-10 bg-black/40 rounded-lg p-4 border border-amber-500/20 backdrop-blur-sm">
                            <div className="flex items-start gap-3">
                                <Trophy className="w-8 h-8 text-amber-500 shrink-0" />
                                <div>
                                    <div className="text-xs uppercase font-bold text-amber-500/80 mb-1">Est. Network Share</div>
                                    <div className="text-3xl font-bold text-white tracking-tight">
                                        {share.toPrecision(4)}%
                                    </div>
                                    <div className="text-[10px] text-zinc-500 mt-1">
                                        of Global Epoch Rewards
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-800">
                    <Button variant="ghost" onClick={onClose} className="text-zinc-500 hover:text-white">Close Simulator</Button>
                    <Button className="bg-amber-500 text-black hover:bg-amber-400 font-bold">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Apply Strategy Plan
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
