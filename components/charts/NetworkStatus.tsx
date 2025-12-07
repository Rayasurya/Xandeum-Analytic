"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatusChartProps {
    data: { name: string; value: number }[]
}

const COLORS = {
    "Active": "#10B981", // Emerald-500
    "Inactive": "#64748B" // Slate-500
}

export function StatusChart({ data }: StatusChartProps) {
    return (
        <Card className="col-span-1 bg-card/50 border shadow-sm">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Network Activity Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    {data.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    width={80}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === "Active" ? COLORS.Active : COLORS.Inactive} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                            No status data available
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
