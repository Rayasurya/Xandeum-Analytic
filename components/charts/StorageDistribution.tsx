"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"

interface StorageDistributionProps {
    data: { name: string; value: number }[]
}

export function StorageDistribution({ data }: StorageDistributionProps) {
    return (
        <Card className="bg-card/50 border-primary/20 shadow-sm relative overflow-hidden group h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    Storage Capacity
                    <InfoTooltip content="Categorization of nodes based on their committed storage capacity to the network." />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, bottom: 0, left: -25, right: 10 }}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                interval={0}
                                tick={{ fill: '#64748b' }}
                                dy={10}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc' }}
                                itemStyle={{ color: '#06b6d4' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#06b6d4" fillOpacity={0.6 + (index * 0.1)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
