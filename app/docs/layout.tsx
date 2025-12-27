
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Book, ShieldCheck, Zap, Database, Map as MapIcon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { usePathname } from "next/navigation";

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">

            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-card/50 backdrop-blur-xl hidden md:flex flex-col z-40">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="text-sm font-bold text-foreground">Neural Core Docs</div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="sm"><Menu className="w-5 h-5" /></Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 border-r border-border bg-card/95 backdrop-blur-xl">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content Area */}
            <main className="md:pl-64 min-h-screen relative z-0">
                {/* Simple background pattern */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.1) 0%, transparent 50%)' }} />

                <div className="relative z-10 max-w-4xl mx-auto p-6 md:p-12 lg:p-16">
                    {children}
                </div>
            </main>
        </div>
    );
}

function SidebarContent() {
    const pathname = usePathname();

    // Exact match for root docs, startsWith for others
    const isActive = (path: string) => {
        if (path === "/docs") return pathname === "/docs";
        return pathname?.startsWith(path);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-border">
                <Link href="/" className="flex items-center gap-2 text-foreground font-bold tracking-tight mb-1">
                    <ArrowLeft className="w-4 h-4 text-primary" />
                    Back to App
                </Link>
                <div className="text-xs text-muted-foreground font-mono mt-2">NEURAL CORE MANUAL v1.0</div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <NavItem href="/docs" icon={<Book className="w-4 h-4" />} label="Introduction" active={pathname === "/docs"} />

                <div className="pt-4 pb-2 px-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">The Core Algorithms</div>
                <NavItem href="/docs/health-score" icon={<ShieldCheck className="w-4 h-4" />} label="Validator Consensus" active={isActive("/docs/health-score")} />
                <NavItem href="/docs/rewards" icon={<Zap className="w-4 h-4" />} label="Yield & Rewards" active={isActive("/docs/rewards")} />

                <div className="pt-4 pb-2 px-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Infrastructure</div>
                <NavItem href="/docs/storage" icon={<Database className="w-4 h-4" />} label="Storage Metrics" active={isActive("/docs/storage")} />
                <NavItem href="/docs/geo" icon={<MapIcon className="w-4 h-4" />} label="Network Map" active={isActive("/docs/geo")} />
                <NavItem href="/docs/hardware" icon={<Zap className="w-4 h-4" />} label="Hardware Specs" active={isActive("/docs/hardware")} />

                <div className="pt-4 pb-2 px-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Support</div>
                <NavItem href="/docs/metrics" icon={<Book className="w-4 h-4" />} label="Metrics Definitions" active={isActive("/docs/metrics")} />
                <NavItem href="/docs/troubleshooting" icon={<ShieldCheck className="w-4 h-4" />} label="Troubleshooting" active={isActive("/docs/troubleshooting")} />
                <NavItem href="/docs/faq" icon={<Book className="w-4 h-4" />} label="FAQ" active={isActive("/docs/faq")} />
            </nav>

            <div className="p-4 border-t border-border bg-muted/50">
                <div className="text-xs text-muted-foreground">
                    Need help? <br />
                    <span className="text-secondary cursor-pointer hover:underline">Chat with AI Assistant</span>
                </div>
            </div>
        </div>
    )
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`
        flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 group
        ${active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
      `}
        >
            <span className={`opacity-70 group-hover:opacity-100 transition-opacity ${active ? 'text-primary' : ''}`}>
                {icon}
            </span>
            {label}
        </Link>
    );
}

