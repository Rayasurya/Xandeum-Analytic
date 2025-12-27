
import React from 'react';
import { Cpu, MemoryStick, HardDrive, Zap } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function HardwareDocs() {
    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-pink-500 font-mono text-xs uppercase tracking-widest">
                    <Cpu className="w-4 h-4" />
                    Infrastructure
                </div>
                <h1 className="text-4xl font-bold text-foreground">Hardware Requirements</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Xandeum is a high-performance network. Your hardware directly impacts your ability to keep up with the global state and earn rewards.
                </p>
            </div>

            {/* Tiers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Excellent Tier */}
                <div className="bg-gradient-to-br from-card to-background border border-pink-500/30 rounded-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4">
                        <Badge className="bg-pink-500 hover:bg-pink-600 text-white border-none">Recommended</Badge>
                    </div>
                    <div className="p-8 space-y-6">
                        <h2 className="text-2xl font-bold text-foreground">Excellent Grade</h2>
                        <p className="text-sm text-muted-foreground">For serious operators maximizing yield.</p>

                        <Separator className="bg-border" />

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-pink-500/10 rounded"><Cpu className="w-5 h-5 text-pink-500" /></div>
                                <div>
                                    <div className="font-bold text-foreground">32 Cores / 64 Threads</div>
                                    <div className="text-xs text-muted-foreground">AMD EPYC or Threadripper</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-pink-500/10 rounded"><MemoryStick className="w-5 h-5 text-pink-500" /></div>
                                <div>
                                    <div className="font-bold text-foreground">512 GB DDR5 ECC</div>
                                    <div className="text-xs text-muted-foreground">High bandwidth required</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-pink-500/10 rounded"><HardDrive className="w-5 h-5 text-pink-500" /></div>
                                <div>
                                    <div className="font-bold text-foreground">4 TB NVMe Gen4</div>
                                    <div className="text-xs text-muted-foreground">RAID 1 for redundancy</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-pink-500/10 rounded"><Zap className="w-5 h-5 text-pink-500" /></div>
                                <div>
                                    <div className="font-bold text-foreground">10 Gbps Uplink</div>
                                    <div className="text-xs text-muted-foreground">Fiber connection</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Minimal Tier */}
                <div className="bg-card border border-border rounded-xl overflow-hidden relative opacity-75 hover:opacity-100 transition-opacity">
                    <div className="absolute top-0 right-0 p-4">
                        <Badge variant="outline" className="border-muted-foreground text-muted-foreground">Minimum</Badge>
                    </div>
                    <div className="p-8 space-y-6">
                        <h2 className="text-2xl font-bold text-foreground">Entry Grade</h2>
                        <p className="text-sm text-muted-foreground">Sufficient to join, but rewards may be lower.</p>

                        <Separator className="bg-border" />

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-muted rounded"><Cpu className="w-5 h-5 text-muted-foreground" /></div>
                                <div>
                                    <div className="font-bold text-foreground">12 Cores / 24 Threads</div>
                                    <div className="text-xs text-muted-foreground">3.0GHz+ Base Clock</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-muted rounded"><MemoryStick className="w-5 h-5 text-muted-foreground" /></div>
                                <div>
                                    <div className="font-bold text-foreground">128 GB DDR4</div>
                                    <div className="text-xs text-muted-foreground">ECC Preferred</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-muted rounded"><HardDrive className="w-5 h-5 text-muted-foreground" /></div>
                                <div>
                                    <div className="font-bold text-foreground">1 TB NVMe</div>
                                    <div className="text-xs text-muted-foreground">OS + Ledger</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-muted rounded"><Zap className="w-5 h-5 text-muted-foreground" /></div>
                                <div>
                                    <div className="font-bold text-foreground">1 Gbps Uplink</div>
                                    <div className="text-xs text-muted-foreground">Stable connection</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
