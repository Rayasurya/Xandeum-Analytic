import Link from "next/link";
import { Book, Activity, BarChart3, Wrench, HelpCircle, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const sections = [
    {
        title: "Getting Started",
        description: "Learn the basics of Xandeum Scope and how to navigate the dashboard",
        href: "/docs/getting-started",
        icon: Book,
        color: "from-blue-500 to-cyan-500",
    },
    {
        title: "Health Score",
        description: "Understand how node health is calculated and what affects it",
        href: "/docs/health-score",
        icon: Activity,
        color: "from-emerald-500 to-green-500",
    },
    {
        title: "Metrics Guide",
        description: "Deep dive into all metrics: storage, uptime, versions, and more",
        href: "/docs/metrics",
        icon: BarChart3,
        color: "from-purple-500 to-pink-500",
    },
    {
        title: "Troubleshooting",
        description: "Fix common issues: offline nodes, low health, connectivity problems",
        href: "/docs/troubleshooting",
        icon: Wrench,
        color: "from-orange-500 to-red-500",
    },
    {
        title: "FAQ",
        description: "Answers to frequently asked questions about pNodes and the network",
        href: "/docs/faq",
        icon: HelpCircle,
        color: "from-primary to-orange-600",
    },
];

export default function DocsPage() {
    return (
        <div className="space-y-8">
            {/* Hero */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    Documentation
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                    Xandeum Scope
                    <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent"> Docs</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Everything you need to know about Xandeum pNode analytics, health monitoring, and network insights.
                </p>
            </div>

            {/* Quick Links Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sections.map((section) => (
                    <Link key={section.title} href={section.href}>
                        <Card className="h-full bg-card/50 border-border hover:border-primary/50 hover:bg-card transition-all duration-300 group cursor-pointer">
                            <CardHeader>
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                    <section.icon className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-foreground group-hover:text-primary transition-colors">
                                    {section.title}
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    {section.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* AI Assistant Callout */}
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/20">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Need Quick Answers?</h3>
                        <p className="text-muted-foreground mt-1">
                            Use the <strong>AI Assistant</strong> on the dashboard! Click the chat bubble in the bottom-right corner to ask questions about your nodes, health scores, or network stats.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-primary hover:text-orange-500 transition-colors"
                        >
                            Go to Dashboard →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
