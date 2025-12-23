"use client"

import { ResponsiveContainer, Tooltip, Treemap } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"

interface NodeLeaderboardProps {
    data: { name: string; value: number; fullPubkey: string }[]
}

const COLORS = [
    '#047857', // Emerald 700 (Darkest - Top)
    '#059669', // Emerald 600
    '#10b981', // Emerald 500
    '#34d399', // Emerald 400
    '#6ee7b7', // Emerald 300 (Lightest - Last)
];

const CustomizedContent = (props: any) => {
    const { x, y, width, height, index, value, name } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: COLORS[index % COLORS.length] || COLORS[0],
                    stroke: '#0d1117',
                    strokeWidth: 2,
                    strokeOpacity: 1,
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

export function NodeLeaderboard({ data }: NodeLeaderboardProps) {
    // Process data for Treemap (Recharts Treemap likes a single root content for animations usually, but flat array works too)
    // We pass the flat data directly.

    return (
        <Card className="bg-card/50 border-primary/20 shadow-sm relative overflow-hidden group h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
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
                            scroll={{ x: 0, y: 0 }}
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomizedContent />}
                        >
                            <Tooltip
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', fontSize: '12px' }}
                                itemStyle={{ color: '#10b981' }}
                                formatter={(value: number) => [`${value} GB`, 'Storage']}
                            />
                        </Treemap>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
