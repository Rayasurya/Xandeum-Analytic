"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NodeLeaderboardProps {
    data: { name: string; value: number; fullPubkey: string }[]
}

export function NodeLeaderboard({ data }: NodeLeaderboardProps) {
    return (
        <Card className="bg-card/50 border-primary/20 shadow-sm relative overflow-hidden group col-span-1 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Top Nodes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#888888"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                width={80}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', fontSize: '12px', zIndex: 100 }}
                                itemStyle={{ color: '#10b981' }}
                                formatter={(value: number) => [`${(value / 1000).toFixed(1)}k Credits`, 'Credits']}
                                labelFormatter={(label) => label}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#10b981" fillOpacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
