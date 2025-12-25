import { ArrowRight, AlertCircle, WifiOff, Activity, HardDrive, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function TroubleshootingPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="text-sm text-primary font-medium mb-2">Documentation</div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Troubleshooting</h1>
                <p className="text-muted-foreground mt-2">
                    Solutions to common pNode issues and how to diagnose problems.
                </p>
            </div>

            {/* Node Offline/Inactive */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <WifiOff className="h-5 w-5 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Node Showing "Inactive" or "Offline"</h2>
                </div>

                <p className="text-muted-foreground">
                    If your node appears inactive in the dashboard, it usually means the RPC endpoint is unreachable. Follow these steps:
                </p>

                <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h4 className="font-bold text-foreground mb-2">1. Check Internet Connectivity</h4>
                        <p className="text-sm text-muted-foreground mb-2">Ensure your server has stable internet:</p>
                        <code className="block bg-muted p-2 rounded text-sm text-foreground">
                            ping google.com
                        </code>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h4 className="font-bold text-foreground mb-2">2. Verify Ports Are Open</h4>
                        <p className="text-sm text-muted-foreground mb-2">Check that RPC and TPU ports are accessible:</p>
                        <code className="block bg-muted p-2 rounded text-sm text-foreground mb-2">
                            nc -zv YOUR_IP 8899
                        </code>
                        <code className="block bg-muted p-2 rounded text-sm text-foreground">
                            nc -zv YOUR_IP 8001
                        </code>
                        <p className="text-xs text-muted-foreground mt-2">
                            Replace YOUR_IP with your server's public IP address.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h4 className="font-bold text-foreground mb-2">3. Check Validator Service Status</h4>
                        <p className="text-sm text-muted-foreground mb-2">Verify the validator is running:</p>
                        <code className="block bg-muted p-2 rounded text-sm text-foreground">
                            systemctl status xandeum-validator
                        </code>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h4 className="font-bold text-foreground mb-2">4. Review Logs</h4>
                        <p className="text-sm text-muted-foreground mb-2">Check for errors in the validator logs:</p>
                        <code className="block bg-muted p-2 rounded text-sm text-foreground">
                            tail -f /var/log/xandeum.log
                        </code>
                    </div>
                </div>
            </section>

            {/* Low Health Score */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Low Health Score (&lt; 75)</h2>
                </div>

                <p className="text-muted-foreground">
                    A low health score can be caused by one or more degraded metrics:
                </p>

                <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h4 className="font-bold text-foreground mb-2">Low Uptime Score</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            <li>Recent restart or power outage</li>
                            <li>Use a UPS (Uninterruptible Power Supply)</li>
                            <li>Avoid unnecessary restarts — schedule maintenance</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h4 className="font-bold text-foreground mb-2">Storage Issues</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            <li>Check disk space: <code className="bg-muted px-1 rounded">df -h</code></li>
                            <li>Verify the pledged storage volume is mounted</li>
                            <li>Check for disk errors: <code className="bg-muted px-1 rounded">dmesg | grep -i error</code></li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h4 className="font-bold text-foreground mb-2">Outdated Version</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            <li>Check current version: <code className="bg-muted px-1 rounded">xandeum-validator --version</code></li>
                            <li>Update to the latest release</li>
                            <li>Restart the validator after updating</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h4 className="font-bold text-foreground mb-2">Network Latency</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            <li>Minimum recommended: 1 Gbps symmetric fiber</li>
                            <li>Check bandwidth: <code className="bg-muted px-1 rounded">speedtest-cli</code></li>
                            <li>Reduce network congestion on the host</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Storage Problems */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <HardDrive className="h-5 w-5 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Storage Problems</h2>
                </div>

                <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h4 className="font-bold text-foreground mb-2">Check Disk Space</h4>
                        <code className="block bg-muted p-2 rounded text-sm text-foreground">
                            df -h
                        </code>
                        <p className="text-xs text-muted-foreground mt-2">
                            Ensure you have sufficient free space on the pledged storage volume.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h4 className="font-bold text-foreground mb-2">Verify Mount Points</h4>
                        <code className="block bg-muted p-2 rounded text-sm text-foreground">
                            lsblk
                        </code>
                        <p className="text-xs text-muted-foreground mt-2">
                            Confirm your storage drives are properly mounted.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h4 className="font-bold text-foreground mb-2">Check Disk Health</h4>
                        <code className="block bg-muted p-2 rounded text-sm text-foreground">
                            smartctl -a /dev/sda
                        </code>
                        <p className="text-xs text-muted-foreground mt-2">
                            Use SMART data to check for failing drives (replace /dev/sda with your device).
                        </p>
                    </div>
                </div>
            </section>

            {/* Version Update */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 text-cyan-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Updating Your Node</h2>
                </div>

                <div className="p-4 rounded-lg bg-card border border-border space-y-3">
                    <div>
                        <h4 className="font-bold text-foreground mb-2">1. Check Current Version</h4>
                        <code className="block bg-muted p-2 rounded text-sm text-foreground">
                            xandeum-validator --version
                        </code>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground mb-2">2. Download Latest Release</h4>
                        <p className="text-sm text-muted-foreground">
                            Follow the official update instructions from the Xandeum documentation.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground mb-2">3. Restart the Validator</h4>
                        <code className="block bg-muted p-2 rounded text-sm text-foreground">
                            sudo systemctl restart xandeum-validator
                        </code>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground mb-2">4. Verify the Update</h4>
                        <code className="block bg-muted p-2 rounded text-sm text-foreground">
                            xandeum-validator --version
                        </code>
                    </div>
                </div>
            </section>

            {/* Still Having Issues */}
            <section className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/20">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Still Having Issues?</h3>
                        <p className="text-muted-foreground mb-4">
                            Check the FAQ or use the AI Assistant on the dashboard for real-time help.
                        </p>
                        <Link
                            href="/docs/faq"
                            className="inline-flex items-center gap-2 text-primary hover:text-orange-500 font-medium transition-colors"
                        >
                            View FAQ <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
