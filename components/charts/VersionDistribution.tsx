"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"

interface VersionChartProps {
    data: { name: string; value: number }[];
    onDrillDown?: (version: string) => void;
}

const COLORS = [
    "#f97316", // Electric Orange
    "#06b6d4", // Neon Cyan
    "#c2410c", // Dark Orange
    "#0891b2", // Dark Cyan
    "#334155"  // Slate-700
];

const CustomTooltip = ({ active, payload, onDrillDown }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#020617] border border-border p-3 rounded-lg shadow-xl z-50">
                <p className="font-bold text-foreground mb-1">{payload[0].name}</p>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill }} />
                    <span className="text-sm font-mono text-muted-foreground">
                        {payload[0].value} Nodes
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

export function VersionChart({ data, onDrillDown }: VersionChartProps) {
    return (
        <Card className="col-span-1 bg-card/50 border shadow-sm">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    Software Distribution
                    <InfoTooltip content="Breakdown of Xandeum software versions running across the network." />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    {data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                            {/* Chart Section */}
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            stroke="none"
                                            data={data}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={85}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                    strokeWidth={0}
                                                    className={onDrillDown ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                                                    onClick={() => onDrillDown && onDrillDown(entry.name)}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={(props: any) => <CustomTooltip {...props} onDrillDown={onDrillDown} />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Custom Legend Section */}
                            <div className="flex flex-col gap-6 justify-center">
                                {data.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <span
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-sm text-gray-300 font-mono truncate" title={entry.name}>
                                            {entry.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                            No version data available
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
