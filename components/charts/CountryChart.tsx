"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"

interface CountryChartProps {
    data: { name: string; value: number }[];
    onDrillDown?: (country: string) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, onDrillDown }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-xl z-50">
                <p className="font-bold text-popover-foreground mb-1">{payload[0].payload.name}</p>
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

export function CountryChart({ data, onDrillDown }: CountryChartProps) {
    // Sort and take top 5 if not already
    const chartData = [...data].sort((a, b) => b.value - a.value).slice(0, 5);

    return (
        <Card className="bg-card/50 border-border shadow-sm overflow-hidden hover:bg-card/60 transition-colors h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Global Distribution
                    <InfoTooltip content="Geographic location of active nodes based on their IP addresses." />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                                width={80}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                content={<CustomTooltip onDrillDown={onDrillDown} />}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        className={onDrillDown ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                                        onClick={() => onDrillDown && onDrillDown(entry.name)}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
