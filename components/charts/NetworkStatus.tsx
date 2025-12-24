"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatusChartProps {
    data: { name: string; value: number }[]
}

const COLORS = {
    "Active": "#06b6d4", // Cyan-500 (Neon Cyber)
    "Inactive": "#1e293b" // Slate-800 (Dark background)
}

export function StatusChart({ data }: StatusChartProps) {
    return (
        <Card className="col-span-1 bg-card/50 border-border shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Network Activity Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    {data.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" opacity={0.5} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
                                    width={80}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#1e293b' }}
                                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc' }}
                                    itemStyle={{ color: '#06b6d4', fontFamily: 'monospace' }}
                                    labelStyle={{ color: '#94a3b8' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                    {data.map((entry, index) => (
                                        // Active gets Neon Cyan, Inactive gets dark Slate
                                        <Cell key={`cell-${index}`} fill={entry.name === "Active" ? COLORS.Active : COLORS.Inactive} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-mono">
                            // NO_DATA_STREAM
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
