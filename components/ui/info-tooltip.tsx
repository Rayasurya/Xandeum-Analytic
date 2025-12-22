"use client";

import { Info } from "lucide-react";

/**
 * A "Zero-Knowledge" Tooltip component.
 * Provides a gentle popup explanation for technical terms.
 * Design: Dark mode specific, custom arrow, unobtrusive.
 */
export function InfoTooltip({ content }: { content: string }) {
    if (!content) return null;

    return (
        <div className="relative inline-flex items-center ml-1.5 cursor-help align-middle">
            {/* Trigger Icon - Subtle by default, brands on hover */}
            <Info className="peer w-3.5 h-3.5 text-muted-foreground/50 hover:text-[#3178c6] transition-colors duration-300" />

            {/* Tooltip Body */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 
                      bg-[#0d1117] text-gray-200 text-[12px] rounded-lg shadow-xl shadow-black/50 border border-gray-800
                      opacity-0 invisible peer-hover:opacity-100 peer-hover:visible 
                      transition-all duration-200 z-[100] pointer-events-none transform origin-top scale-95 peer-hover:scale-100">
                <div className="relative z-10 font-sans leading-relaxed">
                    {content}
                </div>

                {/* Decorative Arrow */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[-1px] border-4 border-transparent border-b-[#0d1117]" />
            </div>
        </div>
    );
}
