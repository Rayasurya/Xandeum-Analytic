
import React from 'react';
import { Map, Globe, Network, Shield } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function GeoDocs() {
    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-widest">
                    <Map className="w-4 h-4" />
                    Infrastructure
                </div>
                <h1 className="text-4xl font-bold text-foreground">Network Topology</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    The Xandeum network relies on a mesh of globally distributed nodes using the <span className="text-foreground font-bold">GOSSIP Protocol</span>.
                    Your geographic location affects latency and propagation speed.
                </p>
            </div>

            {/* Protocol Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border p-6 rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded">
                            <Network className="w-5 h-5 text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Gossip Protocol</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        Nodes constantly share ledger updates with their neighbors. To participate effectively, your node must be discoverable and reachable.
                    </p>
                    <div className="p-4 bg-background/50 rounded-lg border border-border font-mono text-xs text-purple-400">
                        Port 8000 (TCP/UDP)
                    </div>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded">
                            <Shield className="w-5 h-5 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">TPU (Transactions)</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        The Transaction Processing Unit (TPU) handles valid incoming transactions. This requires high-speed UDP connectivity.
                    </p>
                    <div className="p-4 bg-background/50 rounded-lg border border-border font-mono text-xs text-blue-400">
                        Port 8001 (UDP)
                    </div>
                </div>
            </section>

            {/* Geo Distribution */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Geographic Distribution</h2>
                <div className="bg-card border border-border rounded-xl p-8 text-center space-y-6 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #a855f7 0%, transparent 70%)' }} />

                    <Globe className="w-16 h-16 text-purple-400 mx-auto" />
                    <h3 className="text-xl font-bold text-foreground">We Need Nodes Everywhere</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Concentration in one datacenter (like AWS us-east-1) is a security risk.
                        We actively boost rewards for nodes in under-represented regions.
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">South America (High Need)</Badge>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">Africa (High Need)</Badge>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">Southeast Asia (High Need)</Badge>
                        <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">North America (Saturated)</Badge>
                    </div>
                </div>
            </section>
        </div>
    );
}
