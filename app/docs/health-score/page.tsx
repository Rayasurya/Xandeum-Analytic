
"use client";

import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ChevronRight, Activity, Database, Server } from 'lucide-react';
import { cn } from "@/lib/utils";

// --- Math Helpers ---
const calculateUptimeScore = (days: number) => {
    // Sigmoid: 100 / (1 + exp(-2 * (days - 0.5)))
    // Adjusted for visual playground: Midpoint at 7 days, Slope 0.5
    return 100 / (1 + Math.exp(-0.5 * (days - 7)));
};

const calculateStorageScore = (tb: number) => {
    // Logarithmic: 50 * log2(TB + 1). Cap at 100.
    return Math.min(100, 50 * Math.log2(tb + 1));
};

export default function HealthScoreDocs() {
    const [activeStep, setActiveStep] = useState(1);
    const [uptimeDays, setUptimeDays] = useState(7); // Default midpoint
    const [storageTB, setStorageTB] = useState(1);

    // Generate Chart Data for Uptime
    const uptimeData = Array.from({ length: 30 }, (_, i) => {
        const d = i;
        return { day: d, score: calculateUptimeScore(d), current: d === uptimeDays };
    });

    // Generate Chart Data for Storage
    const storageData = Array.from({ length: 20 }, (_, i) => {
        return { tb: i, score: calculateStorageScore(i), current: i === Math.floor(storageTB) }
    });

    return (
        <div className="max-w-3xl mx-auto space-y-16 pb-20">

            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    Algorithm No. 001
                </div>
                <h1 className="text-4xl font-bold text-white">Validator Consensus Score</h1>
                <p className="text-gray-400 text-lg">
                    This isn't just a number. It's a measure of your reliability, contribution, and alignment with the network.
                    Let's break down how we calculate it.
                </p>
            </div>

            {/* STEP 1: UPTIME (Interactable) */}
            <section className={cn(
                "space-y-8 p-8 rounded-2xl border transition-all duration-500",
                activeStep >= 1 ? "bg-[#0a0a0a] border-emerald-500/20 opacity-100" : "opacity-30 border-white/5 blur-sm"
            )}>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                        <Activity className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">1. The Foundation: Uptime (35%)</h2>
                        <p className="text-gray-400">
                            We use a <span className="text-white font-bold">Sigmoid Function</span>, not a linear counter.
                            Why? Because consistency matters most in the first few days.
                        </p>
                    </div>
                </div>

                {/* Interactive Playground */}
                <div className="bg-black/40 rounded-xl p-6 border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Simulation</span>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                            Score: {Math.round(calculateUptimeScore(uptimeDays))} / 100
                        </Badge>
                    </div>

                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={uptimeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="day" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                                    itemStyle={{ color: '#10b981' }}
                                />
                                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={false} />
                                <ReferenceLine x={uptimeDays} stroke="white" strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-xs text-gray-500 font-mono">
                            <span>0 Days</span>
                            <span className="text-white font-bold">Current: {uptimeDays} Days</span>
                            <span>30 Days</span>
                        </div>
                        <Slider
                            value={[uptimeDays]}
                            max={30}
                            step={1}
                            onValueChange={(val) => setUptimeDays(val[0])}
                            className="py-4"
                        />
                    </div>
                </div>

                {activeStep === 1 && (
                    <Button onClick={() => setActiveStep(2)} className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10">
                        Next: Add Storage Impact <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </section>

            {/* STEP 2: STORAGE (Logarithmic) */}
            <section className={cn(
                "space-y-8 p-8 rounded-2xl border transition-all duration-500",
                activeStep >= 2 ? "bg-[#0a0a0a] border-blue-500/20 opacity-100" : "opacity-30 border-white/5 blur-sm"
            )}>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                        <Database className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">2. The Scale: Storage (30%)</h2>
                        <p className="text-gray-400">
                            Storage scoring is <span className="text-white font-bold">Logarithmic</span>.
                            Adding your first 1TB is a huge milestone. Adding your 100th TB has diminishing returns.
                        </p>
                    </div>
                </div>

                {/* Storage Playground */}
                <div className="bg-black/40 rounded-xl p-6 border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Simulation</span>
                        <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                            Score: {Math.round(calculateStorageScore(storageTB))} / 100
                        </Badge>
                    </div>

                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={storageData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="tb" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={false} />
                                <ReferenceLine x={storageTB} stroke="white" strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-xs text-gray-500 font-mono">
                            <span>0 TB</span>
                            <span className="text-white font-bold">Current: {storageTB} TB</span>
                            <span>20 TB</span>
                        </div>
                        <Slider
                            value={[storageTB]}
                            max={20}
                            step={0.5}
                            onValueChange={(val) => setStorageTB(val[0])}
                            className="py-4"
                        />
                    </div>
                </div>

                {activeStep === 2 && (
                    <Button onClick={() => setActiveStep(3)} className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10">
                        Next: Final Consensus <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </section>

            {/* STEP 3: VERSION & CONSENSUS */}
            <section className={cn(
                "space-y-8 p-8 rounded-2xl border transition-all duration-500",
                activeStep >= 3 ? "bg-[#0a0a0a] border-purple-500/20 opacity-100" : "opacity-30 border-white/5 blur-sm"
            )}>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                        <Server className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">3. The Consensus: Version Rank (15%)</h2>
                        <p className="text-gray-400">
                            We rank all active versions in the network. If you are on the <span className="text-white font-bold">Latest Version</span>,
                            you get 100 points. Older versions lose points progressively.
                        </p>
                        <div className="pt-4 grid grid-cols-2 gap-4">
                            <div className="p-4 rounded bg-white/5 border border-white/10 text-center">
                                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Rank 1 (Latest)</div>
                                <div className="text-2xl font-black text-purple-400">100 Pts</div>
                            </div>
                            <div className="p-4 rounded bg-white/5 border border-white/10 text-center opacity-50">
                                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Rank 2 (Old)</div>
                                <div className="text-2xl font-black text-gray-400">~75 Pts</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            {activeStep >= 3 && (
                <div className="p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h3 className="text-2xl font-bold text-white">Ready to Optimize?</h3>
                    <p className="text-gray-400">Check your node's real-time score on the dashboard.</p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8">
                        <a href="/">Go to Dashboard</a>
                    </Button>
                </div>
            )}

        </div>
    );
}
