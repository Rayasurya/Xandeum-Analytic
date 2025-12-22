"use client";

interface Segment {
    label: string;
    value: number;
    color: string;
}

interface AnalyticsBarProps {
    title: string;
    segments: Segment[]; // Expects data to sum to 100% or close
    tooltip?: string;
}

/**
 * AnalyticsBar
 * A "GitHub Languages" style stacked progress bar.
 * Features: Fully rounded pill shape, specific neon palette, minimalist legend.
 */
export function AnalyticsBar({ title, segments, tooltip }: AnalyticsBarProps) {
    const total = segments.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="p-6 rounded-xl border border-gray-800 bg-[#0d1117]/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-200 tracking-wide flex items-center gap-2">
                    {title}
                    {/* Internal import to avoid circular dep if needed, or pass component */}
                </h3>
                {/* Optional header stat */}
                <span className="text-xs font-mono text-gray-500">Total: {total}</span>
            </div>

            {/* The Bar */}
            <div className="h-3 w-full flex rounded-full overflow-hidden bg-gray-800/50">
                {segments.map((seg, idx) => {
                    if (seg.value === 0) return null;
                    const percent = (seg.value / total) * 100;
                    return (
                        <div
                            key={idx}
                            style={{ width: `${percent}%`, backgroundColor: seg.color }}
                            className="h-full first:rounded-l-full last:rounded-r-full hover:brightness-110 transition-all duration-300 relative group"
                        >
                            {/* Tooltip on hover over segment */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                {seg.label}: {seg.value} ({percent.toFixed(1)}%)
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4">
                {segments.map((seg, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: seg.color }}
                        />
                        <span className="text-xs font-medium text-gray-400">
                            {seg.label}
                            <span className="ml-1.5 opacity-60 normal-case font-mono text-[10px]">
                                {((seg.value / total) * 100).toFixed(1)}%
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
