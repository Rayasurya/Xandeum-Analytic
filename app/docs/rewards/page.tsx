
import React from 'react';
import { Zap, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function RewardsDocs() {
    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest">
                    <Zap className="w-4 h-4" />
                    Algorithm No. 002
                </div>
                <h1 className="text-4xl font-bold text-foreground">Yield & Rewards Mechanics</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Xandeum rewards providers not just for raw storage, but for <span className="text-foreground font-bold">Performance</span> and <span className="text-foreground font-bold">Reliability</span>.
                    Understand the formula to maximize your daily credit yield.
                </p>
            </div>

            {/* The Formula Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">The Credit Formula</h2>
                <Card className="bg-card border-border p-8">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xl md:text-3xl font-mono font-bold text-muted-foreground">
                        <div className="text-center">
                            <span className="block text-sm uppercase tracking-widest text-primary mb-2">Base</span>
                            <span className="text-foreground">Storage</span>
                        </div>
                        <span className="text-primary">×</span>
                        <div className="text-center">
                            <span className="block text-sm uppercase tracking-widest text-primary mb-2">Multiplier</span>
                            <span className="text-foreground">Boost</span>
                        </div>
                        <span className="text-primary">×</span>
                        <div className="text-center">
                            <span className="block text-sm uppercase tracking-widest text-primary mb-2">Factor</span>
                            <span className="text-foreground">Uptime</span>
                        </div>
                        <span className="text-primary">=</span>
                        <div className="text-center p-4 bg-primary/10 rounded-xl border border-primary/20">
                            <span className="block text-sm uppercase tracking-widest text-primary mb-2">Result</span>
                            <span className="text-primary">Total Credits</span>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Boost Multipliers */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary/10 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Boost Multipliers</h2>
                        <p className="text-muted-foreground">Special hardware configurations earn massive multipliers.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* DeepSouth */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4 hover:border-primary/50 transition-all">
                        <div className="flex justify-between items-start">
                            <Badge variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">x16 Multiplier</Badge>
                            <Award className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">DeepSouth</h3>
                        <p className="text-sm text-muted-foreground">
                            The highest tier. Reserved for verified high-density enterprise storage clusters geographically located in the Global South.
                        </p>
                        <Separator className="bg-border" />
                        <div className="text-xs font-mono text-muted-foreground">Req: 1PB+ & Verified Geo</div>
                    </div>

                    {/* Titan */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4 hover:border-secondary/50 transition-all">
                        <div className="flex justify-between items-start">
                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">x11 Multiplier</Badge>
                            <Award className="w-5 h-5 text-secondary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Titan</h3>
                        <p className="text-sm text-muted-foreground">
                            Standard enterprise grade. High-performance NVMe arrays with verified redundancy.
                        </p>
                        <Separator className="bg-border" />
                        <div className="text-xs font-mono text-muted-foreground">Req: 100TB+ NVMe RAID</div>
                    </div>

                    {/* Standard */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4 hover:border-muted-foreground/50 transition-all">
                        <div className="flex justify-between items-start">
                            <Badge variant="outline" className="border-muted-foreground text-muted-foreground">x1 Base</Badge>
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Standard</h3>
                        <p className="text-sm text-muted-foreground">
                            Residential or entry-level nodes. Great for getting started and earning initial reputation.
                        </p>
                        <Separator className="bg-border" />
                        <div className="text-xs font-mono text-muted-foreground">Req: 2TB+ SSD</div>
                    </div>
                </div>
            </section>

            {/* Yield Table */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Yield Projections</h2>
                <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-mono uppercase text-xs">
                            <tr>
                                <th className="p-4 font-bold">Hardware Tier</th>
                                <th className="p-4 font-bold">Storage</th>
                                <th className="p-4 font-bold">Est. Daily Credits</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            <tr className="group hover:bg-muted/50 transition-colors">
                                <td className="p-4 text-primary font-bold">DeepSouth (x16)</td>
                                <td className="p-4 text-foreground">1 PB</td>
                                <td className="p-4 text-foreground font-mono">1,600,000</td>
                            </tr>
                            <tr className="group hover:bg-muted/50 transition-colors">
                                <td className="p-4 text-secondary font-bold">Titan (x11)</td>
                                <td className="p-4 text-foreground">100 TB</td>
                                <td className="p-4 text-foreground font-mono">110,000</td>
                            </tr>
                            <tr className="group hover:bg-muted/50 transition-colors">
                                <td className="p-4 text-muted-foreground font-bold">Standard (x1)</td>
                                <td className="p-4 text-foreground">10 TB</td>
                                <td className="p-4 text-foreground font-mono">1,000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
