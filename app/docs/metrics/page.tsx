import { HardDrive, Clock, Wifi, Code, Globe, Database, Hash, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MetricsPage() {
    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <div className="text-sm text-primary font-medium mb-2">Technical Documentation</div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Core Metrics & Definitions</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    In-depth breakdown of the signals, mathematics, and consensus mechanisms driving the Xandeum Network analytics.
                </p>
            </div>

            {/* Proof of Physical Storage (PoPS) */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Database className="h-6 w-6 text-primary" />
                    Proof of Physical Storage (PoPS)
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                    PoPS is the core consensus innovation of Xandeum. Unlike Proof of Work (CPU burning) or Proof of Stake (Wealth locking), PoPS proves that a node is physically dedicating storage capacity to the network.
                </p>
                <div className="p-4 rounded-lg bg-card border border-border space-y-3">
                    <h3 className="font-bold text-foreground">The Verification Cycle:</h3>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                        <li>
                            <strong className="text-foreground">Pledging</strong>: Node allocates a <code>pDisk</code> sector on its NVMe drive.
                        </li>
                        <li>
                            <strong className="text-foreground">Sealing</strong>: The sector is filled with cryptographically unique data derived from the node's Identity Key. This process is I/O intensive.
                        </li>
                        <li>
                            <strong className="text-foreground">Challenging</strong>: The network (Validators) randomly queries a specific <code>Chunk</code> within the sealed sector.
                        </li>
                        <li>
                            <strong className="text-foreground">Proving</strong>: The node must read the requested chunk and return a Hash Proof within <strong>400ms</strong>. Failure to respond implies the data was deleted or the disk is too slow (e.g., HDD instead of NVMe).
                        </li>
                    </ol>
                </div>
            </section>

            {/* Storage Committed */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <HardDrive className="h-6 w-6 text-primary" />
                    Storage Metrics
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h3 className="font-bold text-foreground mb-2">Committed Storage</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            Total capacity of all "Sealed Sectors" on the node.
                        </p>
                        <ul className="text-xs text-muted-foreground list-disc list-inside">
                            <li>1 Sector = <strong>64 GiB</strong> (Standard)</li>
                            <li>Min Pledge = 1 Sector</li>
                            <li>Max Pledge = Hardware Limit</li>
                        </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h3 className="font-bold text-foreground mb-2">Sector States</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            Lifecycle of a storage unit:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            <li><span className="text-emerald-500 font-mono">Active</span>: Earning rewards, responding to proofs.</li>
                            <li><span className="text-yellow-500 font-mono">Sealing</span>: Currently generating cryptographic data.</li>
                            <li><span className="text-red-500 font-mono">Faulty</span>: Failed a Proof of Storage challenge.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Network Performance */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Activity className="h-6 w-6 text-primary" />
                    Network Performance
                </h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-500" /> Block Propagation (Gossip)
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Time taken for a block produced by the leader to reach 80% of the cluster. Ideally <strong>&lt; 800ms</strong>. High propagation time indicates poor peering or network congestion.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <Hash className="w-4 h-4 text-blue-500" /> Skip Rate
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Percentage of blocks a validator failed to vote on.
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 bg-muted p-2 rounded">
                            <li><strong>Good</strong>: &lt; 5%</li>
                            <li><strong>Warning</strong>: 5% - 25% (Check CPU/Network)</li>
                            <li><strong>Critical</strong>: &gt; 25% (Risk of Delinquency)</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Next Steps */}
            <section className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/20">
                <h3 className="text-lg font-bold text-foreground mb-2">Understand the Impact</h3>
                <p className="text-muted-foreground mb-4">
                    See how these metrics directly influence your Node Health Score and ultimate APY.
                </p>
                <Link
                    href="/docs/health-score"
                    className="inline-flex items-center gap-2 text-primary hover:text-orange-500 font-medium transition-colors"
                >
                    View Health Score Algorithm <ArrowRight className="h-4 w-4" />
                </Link>
            </section>
        </div>
    );
}
