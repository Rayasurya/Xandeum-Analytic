"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo, useState, useEffect } from "react"

export function NetworkPerformance() {
    // Simulated real-time data
    const [data, setData] = useState<{ time: string; latency: number }[]>([])

    useEffect(() => {
        // Init data
        const initialData = Array.from({ length: 20 }, (_, i) => ({
            time: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            latency: 15 + Math.random() * 15 // 15-30ms baseline
        }))
        setData(initialData)

        const interval = setInterval(() => {
            setData(prev => {
                const now = new Date();
                const newPoint = {
                    time: now.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                    latency: 15 + Math.random() * 15 + (Math.random() > 0.9 ? 50 : 0) // Occasional spike
                }
                return [...prev.slice(1), newPoint]
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <Card className="bg-card/50 border-primary/20 shadow-sm col-span-1 lg:col-span-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent skew-x-12 translate-x-[-150%] animate-shimmer group-hover:animate-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    Real-Time Network Performance
                </CardTitle>
                <div className="text-xs font-mono text-cyan-500">Live Gossip Latency</div>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <XAxis
                                dataKey="time"
                                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                                tickLine={false}
                                axisLine={false}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc' }}
                                itemStyle={{ color: '#06b6d4', fontFamily: 'monospace' }}
                                labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="latency"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorLatency)"
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
