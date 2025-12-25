import { ArrowRight, Zap, BarChart3, Map, Bot } from "lucide-react";
import Link from "next/link";

export default function GettingStartedPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="text-sm text-primary font-medium mb-2">Documentation</div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Getting Started</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome to Xandeum Scope — your real-time analytics dashboard for the Xandeum pNode network.
                </p>
            </div>

            {/* What is Xandeum Scope? */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">What is Xandeum Scope?</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Xandeum Scope is a comprehensive analytics platform that provides real-time insights into the Xandeum decentralized storage network. It monitors pNodes (Provider Nodes) across the globe, tracking their health, performance, and contribution to the network.
                </p>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-foreground">
                        <strong>Key Insight:</strong> Xandeum is a blockchain-based decentralized storage network where pNode operators pledge storage capacity and earn rewards for maintaining reliable nodes.
                    </p>
                </div>
            </section>

            {/* Dashboard Views */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Dashboard Views</h2>
                <p className="text-muted-foreground">
                    The dashboard offers multiple views to analyze the network:
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Zap className="h-4 w-4 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-foreground">Overview</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Summary cards showing total nodes, active nodes, storage committed, and network health distribution.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <BarChart3 className="h-4 w-4 text-purple-500" />
                            </div>
                            <h3 className="font-bold text-foreground">Analytics</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Detailed charts including version distribution, storage breakdown, country distribution, and node performance rankings.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <Map className="h-4 w-4 text-emerald-500" />
                            </div>
                            <h3 className="font-bold text-foreground">Map View</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Interactive world map showing node locations with clustering. Click any cluster or marker to see node details.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-orange-500" />
                            </div>
                            <h3 className="font-bold text-foreground">AI Assistant</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Ask questions about the network in natural language. Get instant insights about node health, statistics, and troubleshooting tips.
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick Tour */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Quick Tour</h2>

                <ol className="space-y-4 list-decimal list-inside text-muted-foreground">
                    <li>
                        <strong className="text-foreground">Check Network Status</strong> — The top cards show total nodes, active count, and total storage pledged to the network.
                    </li>
                    <li>
                        <strong className="text-foreground">Browse Nodes</strong> — Use the node table to search, filter, and sort nodes by various criteria.
                    </li>
                    <li>
                        <strong className="text-foreground">View Node Details</strong> — Click any node row to see detailed health breakdown, geolocation, and raw data.
                    </li>
                    <li>
                        <strong className="text-foreground">Export Data</strong> — Use the "Export CSV" button to download enriched node data for analysis.
                    </li>
                    <li>
                        <strong className="text-foreground">Ask the AI</strong> — Click the chat bubble to ask questions like "Which nodes have low health?" or "What's the total storage?"
                    </li>
                </ol>
            </section>

            {/* Next Steps */}
            <section className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/20">
                <h3 className="text-lg font-bold text-foreground mb-2">Next Steps</h3>
                <p className="text-muted-foreground mb-4">
                    Learn how node health is calculated and what affects your score.
                </p>
                <Link
                    href="/docs/health-score"
                    className="inline-flex items-center gap-2 text-primary hover:text-orange-500 font-medium transition-colors"
                >
                    Learn about Health Scores <ArrowRight className="h-4 w-4" />
                </Link>
            </section>
        </div>
    );
}
