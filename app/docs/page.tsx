
import React from 'react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import {
    ShieldCheck,
    Zap,
    Database,
    Map,
    ArrowRight,
    Activity,
    Cpu
} from 'lucide-react';

export default function DocsPage() {
    return (
        <div className="space-y-12">

            {/* Hero Section */}
            <section className="space-y-6">
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1 uppercase tracking-widest text-[10px] font-bold">
                    Technical Manual v1.0
                </Badge>
                <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">
                    Master the <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        Neural Network
                    </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    Welcome to the operator's manual. This guide breaks down the core algorithms that power the Xandeum network.
                    Learn how to optimize your validator for maximum consensus and yield.
                </p>
            </section>

            {/* Chapter 1: The Core */}
            <section>
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 bg-border"></div>
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Chapter 01: The Core</span>
                    <div className="h-px flex-1 bg-border"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Card 1: Validator Consensus (Big Focus) */}
                    <Link href="/docs/health-score" className="col-span-1 lg:col-span-2 group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-500 p-8">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShieldCheck className="w-32 h-32 text-primary" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="p-3 bg-primary/10 w-fit rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                Validator Consensus Score
                            </h3>
                            <p className="text-muted-foreground max-w-md">
                                The single most important metric. Understand how Uptime, Storage, and Versioning combine to determine your network standing.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-primary font-medium pt-4">
                                Explore the Algorithm <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Card 2: Yield & Rewards */}
                    <Link href="/docs/rewards" className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all duration-500 p-8">
                        <div className="relative z-10 space-y-4">
                            <div className="p-3 bg-secondary/10 w-fit rounded-lg">
                                <Zap className="w-6 h-6 text-secondary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-secondary transition-colors">
                                Yield Mechanics
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                How credits are calculated and how "Boosts" multiply your daily earnings.
                            </p>
                        </div>
                    </Link>

                    {/* Card 3: Storage Metrics */}
                    <Link href="/docs/storage" className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-blue-500/50 transition-all duration-500 p-8">
                        <div className="relative z-10 space-y-4">
                            <div className="p-3 bg-blue-500/10 w-fit rounded-lg">
                                <Database className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-blue-400 transition-colors">
                                Storage Log-Curve
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Why the first 10TB matters more than the next 100TB.
                            </p>
                        </div>
                    </Link>

                    {/* Card 4: Network Map */}
                    <Link href="/docs/geo" className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-purple-500/50 transition-all duration-500 p-8">
                        <div className="relative z-10 space-y-4">
                            <div className="p-3 bg-purple-500/10 w-fit rounded-lg">
                                <Map className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-purple-400 transition-colors">
                                Network Topology
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Understanding the GOSSIP protocol and geographical distribution.
                            </p>
                        </div>
                    </Link>

                    {/* Card 5: Hardware Spec */}
                    <Link href="/docs/hardware" className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-pink-500/50 transition-all duration-500 p-8">
                        <div className="relative z-10 space-y-4">
                            <div className="p-3 bg-pink-500/10 w-fit rounded-lg">
                                <Cpu className="w-6 h-6 text-pink-400" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-pink-400 transition-colors">
                                Hardware Recs
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Recommended specs for "Excellent" grade.
                            </p>
                        </div>
                    </Link>

                </div>
            </section>

        </div>
    );
}
