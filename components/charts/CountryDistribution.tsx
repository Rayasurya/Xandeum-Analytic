"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CountryChartProps {
    data: { name: string; value: number; code: string }[]
}

const COLORS = ["#f97316", "#06b6d4", "#8b5cf6", "#ec4899", "#10b981"];

export function CountryChart({ data }: CountryChartProps) {
    return (
        <Card className="col-span-1 lg:col-span-2 bg-card/50 border-primary/20 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent skew-x-12 translate-x-[-150%] animate-shimmer group-hover:animate-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    Global Node Distribution
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" opacity={0.5} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#1e293b' }}
                                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f97316', fontFamily: 'monospace' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    <LabelList dataKey="value" position="right" fill="#94a3b8" fontSize={10} fontFamily="monospace" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-mono flex-col gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                            <span>SYNCING_GEO_DATABASE...</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
