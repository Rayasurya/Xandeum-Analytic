"use client";

import { Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * A "Zero-Knowledge" Tooltip component.
 * Provides a gentle popup explanation for technical terms.
 * Design: Dark mode specific, custom arrow, unobtrusive.
 */
export function InfoTooltip({ content }: { content: string }) {
    if (!content) return null;

    return (
        <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
                <button type="button" className="inline-flex items-center ml-1.5 cursor-help align-middle focus:outline-none">
                    <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-[#3178c6] transition-colors duration-300" />
                </button>
            </TooltipTrigger>
            <TooltipContent
                className="bg-[#0d1117] text-gray-200 text-[12px] normal-case rounded-lg shadow-xl shadow-black/50 border border-gray-800 break-words max-w-[250px]"
                side="top"
            >
                <p>{content}</p>
            </TooltipContent>
        </Tooltip>
    );
}
