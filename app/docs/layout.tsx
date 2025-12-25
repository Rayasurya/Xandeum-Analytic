"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Book, ChevronRight, Menu, X, Home, Activity, BarChart3, Wrench, HelpCircle, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
    { name: "Getting Started", href: "/docs/getting-started", icon: Home },
    { name: "Health Score", href: "/docs/health-score", icon: Activity },
    { name: "Metrics Guide", href: "/docs/metrics", icon: BarChart3 },
    { name: "Troubleshooting", href: "/docs/troubleshooting", icon: Wrench },
    { name: "FAQ", href: "/docs/faq", icon: HelpCircle },
];

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile menu button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="bg-card border-border"
                >
                    {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform duration-300",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                            <Book className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-foreground">Xandeum Docs</h1>
                            <p className="text-[10px] text-muted-foreground">pNode Analytics Guide</p>
                        </div>
                    </div>

                    {/* Back to Dashboard */}
                    <div className="px-4 py-3 border-b border-border">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                        isActive
                                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.name}
                                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="px-4 py-4 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                            <p>Xandeum Scope v1.0</p>
                            <p className="mt-1">© 2025 Xandeum Network</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="md:ml-64 min-h-screen">
                <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
                    {children}
                </div>
            </main>
        </div>
    );
}
