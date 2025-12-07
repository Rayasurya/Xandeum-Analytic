"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface VersionChartProps {
    data: { name: string; value: number }[]
}

const COLORS = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"]

export function VersionChart({ data }: VersionChartProps) {
    return (
        <Card className="col-span-1 bg-card/50 border shadow-sm">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Software Version Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[240px] w-full">
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }: { name?: string | number; percent?: number }) => `${name || "Unknown"} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                            No version data available
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
