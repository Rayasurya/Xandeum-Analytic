"use client"

import { ResponsiveContainer, Tooltip, Treemap } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"

interface NodeLeaderboardProps {
    data: { name: string; value: number; fullPubkey: string }[];
    onDrillDown?: (nodeId: string) => void;
}

const COLORS = [
    '#047857', // Emerald 700 (Darkest - Top)
    '#059669', // Emerald 600
    '#10b981', // Emerald 500
    '#34d399', // Emerald 400
    '#6ee7b7', // Emerald 300 (Lightest - Last)
];

const CustomTooltip = ({ active, payload, onDrillDown }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-xl z-50">
                <p className="font-bold text-popover-foreground mb-1">{data.name}</p>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-emerald-400">
                        {data.value} GB Storage
                    </span>
                </div>
                {onDrillDown && (
                    <p className="text-[10px] text-primary font-bold mt-1 text-center">
                        (Click to View Nodes)
                    </p>
                )}
            </div>
        );
    }
    return null;
};

export function NodeLeaderboard({ data, onDrillDown }: NodeLeaderboardProps) {

    // Moved inside to access onDrillDown
    const CustomizedContent = (props: any) => {
        const { x, y, width, height, index, value, name } = props;

        // Recharts passes standard props. We need to lookup the item for fullPubkey via index
        // assuming data order is preserved by Recharts (usually is)
        const item = data[index];
        const pubkey = item ? item.fullPubkey : "";

        return (
            <g
                onClick={() => {
                    if (onDrillDown && pubkey) {
                        onDrillDown(pubkey);
                    }
                }}
                style={{ cursor: onDrillDown ? 'pointer' : 'default' }}
            >
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: COLORS[index % COLORS.length] || COLORS[0],
                        stroke: 'transparent',
                        strokeWidth: 0,
                    }}
                    rx={6}
                    ry={6}
                />
                {width > 60 && height > 30 && (
                    <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={12}
                        fontWeight="bold"
                        style={{ pointerEvents: 'none' }}
                    >
                        {name}
                    </text>
                )}
                {width > 60 && height > 30 && (
                    <text
                        x={x + width / 2}
                        y={y + height / 2 + 14}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={10}
                        fillOpacity={0.8}
                        style={{ pointerEvents: 'none' }}
                    >
                        {value} GB
                    </text>
                )}
            </g>
        );
    };

    return (
        <Card className="bg-card/50 border-border shadow-sm relative overflow-hidden group h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Top Nodes
                    <InfoTooltip content="Top performing nodes ranked by their committed storage contribution." />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={data}
                            dataKey="value"
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomizedContent />}
                        >
                            <Tooltip content={<CustomTooltip onDrillDown={onDrillDown} />} />
                        </Treemap>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
