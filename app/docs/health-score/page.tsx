import { ArrowRight, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";

export default function HealthScorePage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="text-sm text-primary font-medium mb-2">Documentation</div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Health Score</h1>
                <p className="text-muted-foreground mt-2">
                    Understanding how node health is calculated and what it means for your pNode.
                </p>
            </div>

            {/* What is Health Score? */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">What is Health Score?</h2>
                <p className="text-muted-foreground leading-relaxed">
                    The Health Score is a <strong className="text-foreground">composite metric from 0 to 100</strong> that indicates the overall reliability and performance of a pNode. It's calculated based on multiple factors that together represent how well the node is serving the network.
                </p>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-sm text-foreground">
                        <strong>Why it matters:</strong> Nodes with higher health scores are more likely to be selected for storage tasks and earn better rewards. Maintaining a high health score is essential for maximizing your pNode's earning potential.
                    </p>
                </div>
            </section>

            {/* Status Thresholds */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Status Thresholds</h2>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                            <h3 className="font-bold text-emerald-400">Healthy</h3>
                        </div>
                        <div className="text-2xl font-bold text-foreground mb-1">≥ 75</div>
                        <p className="text-sm text-muted-foreground">
                            Node is performing well. All metrics are within acceptable ranges.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <h3 className="font-bold text-amber-400">Warning</h3>
                        </div>
                        <div className="text-2xl font-bold text-foreground mb-1">50 - 74</div>
                        <p className="text-sm text-muted-foreground">
                            Some metrics are degrading. Review and address issues soon.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            <h3 className="font-bold text-red-400">Critical</h3>
                        </div>
                        <div className="text-2xl font-bold text-foreground mb-1">&lt; 50</div>
                        <p className="text-sm text-muted-foreground">
                            Immediate action required. Node may be at risk of penalties.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It's Calculated */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">How It's Calculated</h2>
                <p className="text-muted-foreground">
                    The health score is a weighted sum of four key metrics:
                </p>

                <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                        <div className="w-16 text-center">
                            <div className="text-2xl font-bold text-primary">40%</div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-foreground">Uptime</h3>
                            <p className="text-sm text-muted-foreground">
                                How long the node has been continuously online. Longer uptime = higher score.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                        <div className="w-16 text-center">
                            <div className="text-2xl font-bold text-primary">30%</div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-foreground">Storage Consistency</h3>
                            <p className="text-sm text-muted-foreground">
                                Whether the pledged storage is available and responsive. Based on storage committed amount.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                        <div className="w-16 text-center">
                            <div className="text-2xl font-bold text-primary">20%</div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-foreground">RPC Status</h3>
                            <p className="text-sm text-muted-foreground">
                                Whether the node's RPC endpoint is reachable. Nodes must have open RPC/TPU ports.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                        <div className="w-16 text-center">
                            <div className="text-2xl font-bold text-primary">10%</div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-foreground">Version Freshness</h3>
                            <p className="text-sm text-muted-foreground">
                                Running the latest software version. Outdated nodes receive lower scores.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How to Improve */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">How to Improve Your Score</h2>

                <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Keep your node online</strong> — Avoid unnecessary restarts. Use a UPS for power stability.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Update regularly</strong> — Run the latest validator version to maximize version score.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Ensure port accessibility</strong> — Keep RPC (8899) and TPU (8001) ports open.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Monitor storage</strong> — Ensure pledged storage volume is mounted and healthy.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Stable internet</strong> — Use at least 1 Gbps symmetric connection for best performance.</span>
                    </li>
                </ul>
            </section>

            {/* Next Steps */}
            <section className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/20">
                <h3 className="text-lg font-bold text-foreground mb-2">Next Steps</h3>
                <p className="text-muted-foreground mb-4">
                    Dive deeper into individual metrics and what they mean.
                </p>
                <Link
                    href="/docs/metrics"
                    className="inline-flex items-center gap-2 text-primary hover:text-orange-500 font-medium transition-colors"
                >
                    Explore All Metrics <ArrowRight className="h-4 w-4" />
                </Link>
            </section>
        </div>
    );
}
