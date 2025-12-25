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
    onSegmentClick?: (segment: Segment) => void;
}

/**
 * AnalyticsBar
 * A "GitHub Languages" style stacked progress bar.
 * Features: Fully rounded pill shape, specific neon palette, minimalist legend.
 */
export function AnalyticsBar({ title, segments, tooltip, onSegmentClick }: AnalyticsBarProps) {
    const total = segments.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                    {title}
                    {/* Internal import to avoid circular dep if needed, or pass component */}
                </h3>
                {/* Optional header stat */}
                <span className="text-xs font-mono text-muted-foreground">Total: {total}</span>
            </div>

            {/* The Bar Container - Centered nicely */}
            <div className="flex-1 flex flex-col justify-center gap-6">
                {/* The Bar */}
                <div className="h-4 w-full flex rounded-full overflow-hidden bg-muted/50">
                    {segments.map((seg, idx) => {
                        if (seg.value === 0) return null;
                        const percent = (seg.value / total) * 100;
                        return (
                            <div
                                key={idx}
                                style={{ width: `${percent}%`, backgroundColor: seg.color }}
                                className={`h-full first:rounded-l-full last:rounded-r-full hover:brightness-110 transition-all duration-300 relative group ${onSegmentClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onSegmentClick && onSegmentClick(seg)}
                            >
                                {/* Tooltip on hover over segment */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover border border-border text-xs text-popover-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-md">
                                    {seg.label}: {seg.value} ({percent.toFixed(1)}%)
                                    {onSegmentClick && <span className="block text-primary text-[10px] mt-1">(Click to View Nodes)</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4">
                    {segments.map((seg, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-2 ${onSegmentClick ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
                            onClick={() => onSegmentClick && onSegmentClick(seg)}
                        >
                            <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: seg.color }}
                            />
                            <span className="text-xs font-medium text-foreground">
                                {seg.label}
                                <span className="ml-1.5 opacity-60 normal-case font-mono text-[10px]">
                                    {((seg.value / total) * 100).toFixed(1)}%
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
