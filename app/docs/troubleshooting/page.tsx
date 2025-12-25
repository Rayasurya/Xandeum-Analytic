import { AlertTriangle, Terminal, FileText, CheckCircle, Search, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TroubleshootingPage() {
    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <div className="text-sm text-primary font-medium mb-2">Technical Documentation</div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Troubleshooting & Error Codes</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Diagnostic framework for resolving common pNode failures, interpreting logs, and debugging network issues.
                </p>
            </div>

            {/* Error Codes */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-primary" />
                    Error Code Reference
                </h2>
                <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-3 text-left font-bold text-foreground">Code</th>
                                <th className="p-3 text-left font-bold text-foreground">Message</th>
                                <th className="p-3 text-left font-bold text-foreground">Resolution</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <tr className="bg-card">
                                <td className="p-3 font-mono text-red-500">0x1001</td>
                                <td className="p-3 text-muted-foreground">Socket Bind Failed</td>
                                <td className="p-3 text-muted-foreground">Port 8899/8001 is already in use. Check `sudo lsof -i :8899`.</td>
                            </tr>
                            <tr className="bg-card/50">
                                <td className="p-3 font-mono text-red-500">0x2004</td>
                                <td className="p-3 text-muted-foreground">PoPS Proof Timeout</td>
                                <td className="p-3 text-muted-foreground">Disk too slow (&gt;400ms read latency). Migrate to NVMe.</td>
                            </tr>
                            <tr className="bg-card">
                                <td className="p-3 font-mono text-red-500">0x3012</td>
                                <td className="p-3 text-muted-foreground">Gossip Lag Detected</td>
                                <td className="p-3 text-muted-foreground">Network congested. Ensure 1Gbps connection and check firewall Rules.</td>
                            </tr>
                            <tr className="bg-card/50">
                                <td className="p-3 font-mono text-red-500">0x4000</td>
                                <td className="p-3 text-muted-foreground">Version mismatch</td>
                                <td className="p-3 text-muted-foreground">Validator binary is deprecated. Update immediately.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Log Analysis */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Log Analysis
                </h2>
                <p className="text-muted-foreground">
                    Xandeum logs are managed by `systemd`. Use `journalctl` to inspect runtime behavior.
                </p>

                <div className="grid gap-4">
                    <div className="p-4 bg-slate-950 rounded-lg border border-border">
                        <h3 className="font-semibold text-slate-50 mb-2">Monitor Live Logs</h3>
                        <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
                            sudo journalctl -u xandeum-validator -f -o cat
                        </pre>
                        <p className="text-xs text-slate-400 mt-2">
                            Shows real-time output. Look for <span className="text-red-400">ERROR</span> or <span className="text-yellow-400">WARN</span> flags.
                        </p>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-lg border border-border">
                        <h3 className="font-semibold text-slate-50 mb-2">Grep for Specific Errors</h3>
                        <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
                            # Check for panic events
                            sudo journalctl -u xandeum-validator | grep "panic"

                            # Check for PoPS failures
                            sudo journalctl -u xandeum-validator | grep "proof_failed"
                        </pre>
                    </div>
                </div>
            </section>

            {/* Connectivity Tests */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Terminal className="h-6 w-6 text-primary" />
                    Network Diagnostics
                </h2>
                <p className="text-muted-foreground">
                    Verify that your node is visible to the rest of the cluster.
                </p>
                <div className="space-y-2">
                    <div className="p-3 bg-muted/50 rounded flex items-center justify-between border border-border">
                        <div>
                            <h4 className="font-bold text-foreground text-sm">Check RPC Port Visibility</h4>
                            <code className="text-xs text-muted-foreground">nc -zv &lt;YOUR_IP&gt; 8899</code>
                        </div>
                        <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">Expected: Succeeded</span>
                    </div>
                    <div className="p-3 bg-muted/50 rounded flex items-center justify-between border border-border">
                        <div>
                            <h4 className="font-bold text-foreground text-sm">Check Gossip Throughput</h4>
                            <code className="text-xs text-muted-foreground">xandeum-validator gossip --monitor</code>
                        </div>
                        <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">Target: &gt; 2Mbps</span>
                    </div>
                </div>
            </section>

            {/* Support */}
            <section className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/20">
                <h3 className="text-lg font-bold text-foreground mb-2">Still Stuck?</h3>
                <p className="text-muted-foreground mb-4">
                    If diagnostics fail, ask our AI assistant or join the Discord developer channel.
                </p>
                <div className="flex gap-4">
                    <button className="inline-flex items-center gap-2 text-primary hover:text-orange-500 font-medium transition-colors">
                        Ask Xandeum AI <Search className="h-4 w-4" />
                    </button>
                    <Link
                        href="https://discord.gg/xandeum"
                        target="_blank"
                        className="inline-flex items-center gap-2 text-primary hover:text-orange-500 font-medium transition-colors"
                    >
                        Join Discord <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
