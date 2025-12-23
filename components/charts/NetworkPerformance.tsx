"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"

interface NetworkPerformanceProps {
    data: { time: string; tps: number }[]
}

export function NetworkPerformance({ data }: NetworkPerformanceProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="bg-card/50 border-primary/20 shadow-sm col-span-1 lg:col-span-2 relative overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500/20" />
                        Network Performance
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground font-mono text-xs">
                    WAITING_FOR_METRICS...
                </CardContent>
            </Card>
        )
    }

    // Calculate exactly 8 evenly spaced ticks to prevent shifting/jumping
    const customTicks = data.length > 0 ? Array.from({ length: 8 }, (_, i) => {
        const index = Math.floor(i * (data.length - 1) / 7);
        return data[index]?.time;
    }).filter(Boolean) : [];

    return (
        <Card className="bg-card/50 border-primary/20 shadow-sm col-span-1 lg:col-span-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent skew-x-12 translate-x-[-150%] animate-shimmer group-hover:animate-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    Real-Time Network Performance
                    <InfoTooltip content="Real-time Transactions Per Second (TPS) processed by the network." />
                </CardTitle>
                <div className="text-xs font-mono text-cyan-500">Live TPS History</div>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
                            <defs>
                                <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <XAxis
                                dataKey="time"
                                ticks={customTicks}
                                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                                tickLine={false}
                                axisLine={false}
                                interval={0}
                                tickFormatter={(time: string) => {
                                    // Show only HH:MM
                                    const parts = time.split(':');
                                    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
                                }}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                                tickLine={false}
                                axisLine={false}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc' }}
                                itemStyle={{ color: '#06b6d4', fontFamily: 'monospace' }}
                                labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                                labelFormatter={(label) => `Time: ${label}`}
                                formatter={(value: number) => [value.toFixed(1), "TPS"]}
                            />
                            <Area
                                type="monotone"
                                dataKey="tps"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorTps)"
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
