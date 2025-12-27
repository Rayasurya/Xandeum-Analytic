
import React from 'react';
import { Database, TrendingUp, Info } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

export default function StorageDocs() {
    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-secondary font-mono text-xs uppercase tracking-widest">
                    <Database className="w-4 h-4" />
                    Algorithm No. 003
                </div>
                <h1 className="text-4xl font-bold text-foreground">Storage Log-Curve</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    We use a <span className="text-foreground font-bold">Logarithmic Scale</span> for storage scoring.
                    This incentivizes decentralization—tons of smaller, distributed nodes are better than one massive central server.
                </p>
            </div>

            {/* The Maths */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-foreground">The Mathematics</h2>
                    <div className="bg-card border border-border p-6 rounded-xl space-y-4">
                        <div className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Formula</div>
                        <div className="text-2xl md:text-3xl font-mono text-secondary font-bold">
                            Score = 50 × log₂(StorageTB + 1)
                        </div>
                        <Separator className="bg-border" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The <span className="text-secondary">log₂</span> function means the score grows quickly at first, but slows down as you add more storage.
                            Doubling your storage only adds a fixed amount to your score.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-foreground">Why Logarithmic?</h2>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="p-2 bg-primary/10 rounded h-fit">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">Anti-Monopoly</h3>
                                <p className="text-sm text-muted-foreground">Prevents a single whale with 10PB from dominating the network score.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="p-2 bg-secondary/10 rounded h-fit">
                                <Info className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">Encourages Entry</h3>
                                <p className="text-sm text-muted-foreground">New providers with just 2TB can still get a respectable score (approx 80 points).</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reference Table */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Score Reference Table</h2>
                <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-mono uppercase text-xs">
                            <tr>
                                <th className="p-4 font-bold">Storage Size</th>
                                <th className="p-4 font-bold">Storage Score (Approx)</th>
                                <th className="p-4 font-bold hidden md:table-cell">Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            <tr className="group hover:bg-muted/50 transition-colors">
                                <td className="p-4 text-foreground font-mono font-bold">1 TB</td>
                                <td className="p-4 text-secondary font-bold">50 Pts</td>
                                <td className="p-4 text-muted-foreground hidden md:table-cell">The Baseline.</td>
                            </tr>
                            <tr className="group hover:bg-muted/50 transition-colors">
                                <td className="p-4 text-foreground font-mono font-bold">3 TB</td>
                                <td className="p-4 text-secondary font-bold">100 Pts</td>
                                <td className="p-4 text-muted-foreground hidden md:table-cell">The Sweet Spot. Max score achieved quickly.</td>
                            </tr>
                            <tr className="group hover:bg-muted/50 transition-colors">
                                <td className="p-4 text-foreground font-mono font-bold">10 TB</td>
                                <td className="p-4 text-foreground font-bold opacity-50">100 Pts (Capped)</td>
                                <td className="p-4 text-muted-foreground hidden md:table-cell">Anything above 3TB is capped at 100 for the Health Score, but earns more Credits.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-muted-foreground text-center italic">
                    * Note: While Health Score caps at 100, your Credit Yield continues to grow linearly with storage.
                </p>
            </section>
        </div>
    );
}
