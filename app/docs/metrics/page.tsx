import { ArrowRight, HardDrive, Clock, Wifi, Code, Globe } from "lucide-react";
import Link from "next/link";

export default function MetricsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="text-sm text-primary font-medium mb-2">Documentation</div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Metrics Guide</h1>
                <p className="text-muted-foreground mt-2">
                    A comprehensive guide to all metrics tracked in Xandeum Scope.
                </p>
            </div>

            {/* Storage Committed */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <HardDrive className="h-5 w-5 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Storage Committed</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                    Storage Committed represents the amount of disk space a pNode has <strong className="text-foreground">cryptographically pledged</strong> to the Xandeum network. This is the storage capacity the node operator guarantees to make available for the network's decentralized storage system.
                </p>
                <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                    <h4 className="font-bold text-foreground">Key Points:</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>Measured in bytes (displayed as GB, TB, or PB)</li>
                        <li>Higher committed storage = more potential rewards</li>
                        <li>Must be backed by actual available disk space</li>
                        <li>Affects the storage component of health score (30%)</li>
                    </ul>
                </div>
            </section>

            {/* Uptime */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Uptime</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                    Uptime measures how long a node has been <strong className="text-foreground">continuously online</strong> and responsive. It's the single most important factor in the health score calculation, accounting for 40% of the total.
                </p>
                <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                    <h4 className="font-bold text-foreground">Key Points:</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>Displayed in days (d) or hours (h)</li>
                        <li>Resets to zero after any restart or disconnection</li>
                        <li>Target: 30+ days continuous uptime for maximum score</li>
                        <li>Use UPS and stable internet to maintain uptime</li>
                    </ul>
                </div>
            </section>

            {/* RPC/TPU Status */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Wifi className="h-5 w-5 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">RPC/TPU Status</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                    RPC (Remote Procedure Call) and TPU (Transaction Processing Unit) are network endpoints that must be accessible for a node to be considered <strong className="text-foreground">"Active"</strong>.
                </p>
                <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                    <h4 className="font-bold text-foreground">Required Ports:</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li><code className="bg-muted px-1 rounded">8899</code> — RPC port for API requests</li>
                        <li><code className="bg-muted px-1 rounded">8001</code> — TPU port for transaction processing</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                        If these ports are blocked (by firewall or router), the node will show as "Inactive" even if running.
                    </p>
                </div>
            </section>

            {/* Software Version */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <Code className="h-5 w-5 text-cyan-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Software Version</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                    The software version indicates which release of the Xandeum validator your node is running. Running the <strong className="text-foreground">latest version</strong> ensures compatibility, security patches, and optimal performance.
                </p>
                <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                    <h4 className="font-bold text-foreground">Version Format:</h4>
                    <p className="text-sm text-muted-foreground">
                        Versions follow semantic versioning: <code className="bg-muted px-1 rounded">MAJOR.MINOR.PATCH</code>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Example: <code className="bg-muted px-1 rounded">2.1.15</code> — Major version 2, Minor version 1, Patch 15
                    </p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-sm text-foreground">
                        <strong>⚠️ Important:</strong> Outdated versions may have reduced health scores and could become incompatible with the network after protocol upgrades.
                    </p>
                </div>
            </section>

            {/* Geolocation */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Geolocation</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                    The dashboard shows geographic location of each node based on <strong className="text-foreground">IP address geolocation</strong>. This helps visualize the global distribution of the network.
                </p>
                <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                    <h4 className="font-bold text-foreground">Data Includes:</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>Country and city</li>
                        <li>Region/state</li>
                        <li>Timezone</li>
                        <li>ISP/Organization</li>
                        <li>ASN (Autonomous System Number)</li>
                    </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Location is determined from the node's public IP address and may not reflect physical location if using a VPN or proxy.
                </p>
            </section>

            {/* Next Steps */}
            <section className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/20">
                <h3 className="text-lg font-bold text-foreground mb-2">Having Issues?</h3>
                <p className="text-muted-foreground mb-4">
                    Check out common problems and how to fix them.
                </p>
                <Link
                    href="/docs/troubleshooting"
                    className="inline-flex items-center gap-2 text-primary hover:text-orange-500 font-medium transition-colors"
                >
                    Troubleshooting Guide <ArrowRight className="h-4 w-4" />
                </Link>
            </section>
        </div>
    );
}
