"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
    {
        question: "What is a pNode?",
        answer: "A pNode (Provider Node) is a server that participates in the Xandeum decentralized storage network. Node operators pledge storage capacity and earn rewards for maintaining reliable, high-performance nodes that serve the network's storage needs."
    },
    {
        question: "How is the Health Score calculated?",
        answer: "Health Score is a composite metric (0-100) based on four factors: Uptime (40%), Storage Consistency (30%), RPC Status (20%), and Version Freshness (10%). A score of 75+ is considered Healthy, 50-74 is Warning, and below 50 is Critical."
    },
    {
        question: "Why does my node show as 'Inactive'?",
        answer: "A node shows as Inactive when its RPC endpoint (port 8899) is unreachable. Common causes include: firewall blocking the port, router not forwarding the port, the validator service not running, or internet connectivity issues. Check port accessibility with: nc -zv YOUR_IP 8899"
    },
    {
        question: "What are the minimum hardware requirements?",
        answer: "Recommended specs: CPU with 12+ cores (24 threads), 128GB RAM (ECC preferred), 500GB NVMe for system, 2TB+ NVMe for ledger storage (high TBW rating), and 1 Gbps symmetric internet connection."
    },
    {
        question: "How do I check my node's version?",
        answer: "Run the command: xandeum-validator --version. To see all running validators on the network, you can use: xandeum-validator gossip"
    },
    {
        question: "What ports need to be open?",
        answer: "Two essential ports: Port 8899 (RPC - for API requests) and Port 8001 (TPU - for transaction processing). Both must be accessible from the internet for your node to be considered Active."
    },
    {
        question: "How do I update my node software?",
        answer: "1) Check current version: xandeum-validator --version, 2) Download the latest release from official sources, 3) Stop the validator: sudo systemctl stop xandeum-validator, 4) Replace the binary, 5) Restart: sudo systemctl start xandeum-validator"
    },
    {
        question: "Why is my uptime score low?",
        answer: "Uptime score is based on continuous online time. It resets to zero after any restart or disconnection. To maintain high uptime: use a UPS for power stability, ensure stable internet, avoid unnecessary restarts, and schedule maintenance during low-activity periods."
    },
    {
        question: "How is geolocation determined?",
        answer: "The dashboard determines node location by looking up the public IP address using geolocation services. This provides approximate location based on IP registration data. If you're using a VPN or proxy, the shown location may not reflect the physical server location."
    },
    {
        question: "What does 'Storage Committed' mean?",
        answer: "Storage Committed is the amount of disk space your pNode has cryptographically pledged to the network. This storage is reserved for the network's use and must be backed by actual available disk space. Higher committed storage can lead to more rewards."
    },
    {
        question: "How often does the dashboard update?",
        answer: "The dashboard fetches fresh data from the Xandeum network when you load the page or click the refresh button. Data shown represents a near real-time snapshot of network state. Some metrics like geolocation are cached for performance."
    },
    {
        question: "Can I export my node data?",
        answer: "Yes! Click the 'Export CSV' button in the dashboard to download an enriched CSV file containing all node data including pubkeys, versions, storage metrics, uptime, and location information."
    },
    {
        question: "What is the AI Assistant?",
        answer: "The AI Assistant is a chatbot (accessible via the chat bubble in the bottom-right corner) that can answer questions about the network using current dashboard data. Ask things like 'How many nodes are active?' or 'What is a health score?' for instant answers."
    },
    {
        question: "Why is my node's health score different from what I expected?",
        answer: "The health score is calculated based on available data from the network. Factors include: your current uptime (resets after any restart), whether you're running the latest version, storage amount pledged, and RPC accessibility. Check the Node Details panel for a breakdown."
    },
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="text-sm text-primary font-medium mb-2">Documentation</div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Frequently Asked Questions</h1>
                <p className="text-muted-foreground mt-2">
                    Quick answers to common questions about Xandeum pNodes and the analytics dashboard.
                </p>
            </div>

            {/* FAQ List */}
            <div className="space-y-3">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="rounded-lg border border-border bg-card overflow-hidden"
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                        >
                            <span className="font-medium text-foreground pr-4">{faq.question}</span>
                            <ChevronDown
                                className={cn(
                                    "h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform",
                                    openIndex === index && "rotate-180"
                                )}
                            />
                        </button>
                        {openIndex === index && (
                            <div className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed border-t border-border pt-3">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Back to Docs */}
            <section className="pt-4">
                <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Documentation
                </Link>
            </section>
        </div>
    );
}
