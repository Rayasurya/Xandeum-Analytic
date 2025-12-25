import { HeartPulse, ShieldCheck, Activity, AlertTriangle, ArrowRight, Gauge, Layers } from "lucide-react";
import Link from "next/link";

export default function HealthScorePage() {
    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <div className="text-sm text-primary font-medium mb-2">Technical Documentation</div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Health Score Algorithm</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Comprehensive breakdown of the 0-100 scoring model used to grade pNode performance and determine reward eligibility.
                </p>
            </div>

            {/* The Formula */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Gauge className="h-6 w-6 text-primary" />
                    The Scoring Algorithm
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                    The Node Health Score ($H$) is a weighted sum of four key performance indicators. It is recalculated every <strong>Epoch (approx 2 days)</strong>.
                </p>

                <div className="p-6 rounded-lg bg-card border border-border">
                    <div className="text-center mb-6">
                        <code className="text-xl md:text-2xl font-mono bg-slate-950 text-emerald-400 p-3 rounded-lg border border-emerald-500/30">
                            H = (0.4 × U) + (0.3 × S) + (0.2 × R) + (0.1 × V)
                        </code>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                        <div className="p-3 bg-muted/50 rounded border border-border">
                            <h4 className="font-bold flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> U: Uptime (40%)</h4>
                            <p className="text-xs text-muted-foreground mt-1">Percentage of time the node was reachable via Gossip over the last epoch.</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded border border-border">
                            <h4 className="font-bold flex items-center gap-2"><Layers className="w-4 h-4 text-purple-500" /> S: Storage (30%)</h4>
                            <p className="text-xs text-muted-foreground mt-1">Consistency of Proof of Storage challenges passed vs attempted.</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded border border-border">
                            <h4 className="font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-500" /> R: RPC (20%)</h4>
                            <p className="text-xs text-muted-foreground mt-1">Availability of the HTTP/JSON-RPC API on port 8899.</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded border border-border">
                            <h4 className="font-bold flex items-center gap-2"><HeartPulse className="w-4 h-4 text-indigo-500" /> V: Version (10%)</h4>
                            <p className="text-xs text-muted-foreground mt-1">Binary freshness (100% for latest, 50% for N-1, 0% for older).</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Thresholds & Penalties */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-primary" />
                    Grading & Rewards
                </h2>
                <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-3 text-left font-bold text-foreground">Grade</th>
                                <th className="p-3 text-left font-bold text-foreground">Score Range</th>
                                <th className="p-3 text-left font-bold text-foreground">Reward Multiplier</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <tr className="bg-card">
                                <td className="p-3 font-bold text-emerald-500">Healthy</td>
                                <td className="p-3 font-mono">75 - 100</td>
                                <td className="p-3 text-muted-foreground">1.0x (Full Reward)</td>
                            </tr>
                            <tr className="bg-card/50">
                                <td className="p-3 font-bold text-yellow-500">Warning</td>
                                <td className="p-3 font-mono">50 - 74</td>
                                <td className="p-3 text-muted-foreground">0.5x (Halved Reward)</td>
                            </tr>
                            <tr className="bg-card">
                                <td className="p-3 font-bold text-red-500">Critical</td>
                                <td className="p-3 font-mono">0 - 49</td>
                                <td className="p-3 text-muted-foreground">0.0x (No Reward)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mt-4">
                    <h3 className="text-sm font-bold text-red-500 mb-1">Slashing Contitions (Penalties)</h3>
                    <p className="text-sm text-muted-foreground">
                        If a node produces invalid blocks (malicious behavior) or stays offline for &gt; 50% of an epoch, it may be <strong>Jailed</strong> (removed from validator set) and lose a portion of its staked SOL/XAND.
                    </p>
                </div>
            </section>

            {/* Next Steps */}
            <section className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/20">
                <h3 className="text-lg font-bold text-foreground mb-2">Score Too Low?</h3>
                <p className="text-muted-foreground mb-4">
                    Use the troubleshooting guide to identify which component is dragging your score down.
                </p>
                <Link
                    href="/docs/troubleshooting"
                    className="inline-flex items-center gap-2 text-primary hover:text-orange-500 font-medium transition-colors"
                >
                    Diagnose Node Issues <ArrowRight className="h-4 w-4" />
                </Link>
            </section>
        </div>
    );
}
