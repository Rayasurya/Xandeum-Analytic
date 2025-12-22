"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CountryChartProps {
    data: { name: string; value: number }[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function CountryChart({ data }: CountryChartProps) {
    // Sort and take top 5 if not already
    const chartData = [...data].sort((a, b) => b.value - a.value).slice(0, 5);

    return (
        <Card className="bg-card/50 border-primary/20 shadow-sm overflow-hidden hover:bg-card/60 transition-colors">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500/50" />
                    Global Distribution
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
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc' }}
                                itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                                formatter={(value: number) => [value, "Nodes"]}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
