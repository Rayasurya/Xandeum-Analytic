import { ArrowRight, Zap, Server, Shield, Terminal, Network, Cpu } from "lucide-react";
import Link from "next/link";

export default function GettingStartedPage() {
    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <div className="text-sm text-primary font-medium mb-2">Technical Documentation</div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Getting Started with pNodes</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Complete technical guide for deploying, configuring, and maintaining a high-performance Xandeum Provider Node (pNode).
                </p>
            </div>

            {/* Architecture Overview */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Network className="h-6 w-6 text-primary" />
                    System Architecture
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                    The Xandeum Network operates on a hybrid consensus model combining <strong>Proof of History (PoH)</strong> for transaction ordering and <strong>Proof of Physical Storage (PoPS)</strong> for storage verification. A pNode consists of two primary subsystems:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-emerald-500" /> Validator Layer
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Participates in the consensus protocol, votes on blocks, and processes transactions. Requires high single-core CPU performance and low latency.
                        </p>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                            <Server className="h-4 w-4 text-blue-500" /> Storage Layer
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Manages "pDisks" - cryptographically verifiable storage sectors. Requires high I/O throughput (IOPS) and massive capacity (TB/PB scale).
                        </p>
                    </div>
                </div>
            </section>

            {/* Hardware Requirements */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Cpu className="h-6 w-6 text-primary" />
                    Hardware Requirements
                </h2>
                <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-3 text-left font-bold text-foreground">Component</th>
                                <th className="p-3 text-left font-bold text-foreground">Minimum Spec</th>
                                <th className="p-3 text-left font-bold text-foreground">Recommended (High Yield)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <tr className="bg-card">
                                <td className="p-3 font-medium">CPU</td>
                                <td className="p-3 text-muted-foreground">12 Cores / 24 Threads @ 2.8GHz</td>
                                <td className="p-3 text-muted-foreground">32 Cores / 64 Threads (AMD EPYC / Threadripper)</td>
                            </tr>
                            <tr className="bg-card/50">
                                <td className="p-3 font-medium">RAM</td>
                                <td className="p-3 text-muted-foreground">128 GB DDR4 ECC</td>
                                <td className="p-3 text-muted-foreground">512 GB+ DDR5 ECC</td>
                            </tr>
                            <tr className="bg-card">
                                <td className="p-3 font-medium">System Disk</td>
                                <td className="p-3 text-muted-foreground">500 GB NVMe (OS + Logs)</td>
                                <td className="p-3 text-muted-foreground">2 TB NVMe RAID 1</td>
                            </tr>
                            <tr className="bg-card/50">
                                <td className="p-3 font-medium">Storage (Ledger)</td>
                                <td className="p-3 text-muted-foreground">2 TB NVMe (High TBW)</td>
                                <td className="p-3 text-muted-foreground">4 TB+ Enterprise NVMe</td>
                            </tr>
                            <tr className="bg-card/50">
                                <td className="p-3 font-medium">Network</td>
                                <td className="p-3 text-muted-foreground">1 Gbps Symmetric</td>
                                <td className="p-3 text-muted-foreground">10 Gbps / 25 Gbps Fiber</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Installation Guide */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Terminal className="h-6 w-6 text-primary" />
                    Installation & Setup
                </h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">1. Prepare Environment</h3>
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto border border-border font-mono text-sm">
                            {`# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Install dependencies
sudo apt-get install -y curl git ufw jq build-essential`}
                        </pre>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">2. Install Xandeum CLI</h3>
                        <p className="text-sm text-muted-foreground mb-2">Use the official bootstrap script to install the binary and systemd services.</p>
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto border border-border font-mono text-sm">
                            {`sh -c "$(curl -sSfL https://sh.xandeum.network/install.sh)"`}
                        </pre>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">3. Configure Firewall</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            Xandeum requires specific ports for Gossip (Transaction propagation) and TPU (Transaction Processing).
                        </p>
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto border border-border font-mono text-sm">
                            {`# Open RPC Port
sudo ufw allow 8899/tcp

# Open TPU Port (UDP required for QUIC)
sudo ufw allow 8001/udp
sudo ufw allow 8001/tcp

# Open Gossip Port
sudo ufw allow 8000/tcp
sudo ufw allow 8000/udp

# Enable Firewall
sudo ufw enable`}
                        </pre>
                    </div>
                </div>
            </section>

            {/* Next Steps */}
            <section className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/20">
                <h3 className="text-lg font-bold text-foreground mb-2">Configure Your Node</h3>
                <p className="text-muted-foreground mb-4">
                    Once installed, you must optimize your node for the Health Score algorithm to maximize rewards.
                </p>
                <div className="flex gap-4">
                    <Link
                        href="/docs/health-score"
                        className="inline-flex items-center gap-2 text-primary hover:text-orange-500 font-medium transition-colors"
                    >
                        Master the Health Score <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href="/docs/troubleshooting"
                        className="inline-flex items-center gap-2 text-primary hover:text-orange-500 font-medium transition-colors"
                    >
                        View Installation Logs <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
