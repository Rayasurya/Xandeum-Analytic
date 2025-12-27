"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface StorageDistributionProps {
    data: { name: string; value: number }[];
    onDrillDown?: (range: string) => void;
    onAskAI?: (prompt: string) => void;
}

const CustomTooltip = ({ active, payload, onDrillDown }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-xl z-50">
                <p className="font-bold text-popover-foreground mb-1">{payload[0].payload.name}</p>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill }} />
                    <span className="text-sm font-mono text-orange-600 dark:text-orange-400">
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

export function StorageDistribution({ data, onDrillDown, onAskAI }: StorageDistributionProps) {
    return (
        <Card className="bg-card/50 border-border shadow-sm relative overflow-hidden group h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Storage Capacity
                    <InfoTooltip content="Categorization of nodes based on their committed storage capacity to the network." />
                    {onAskAI && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-muted-foreground hover:text-primary ml-1"
                            onClick={() => onAskAI("Analyze the 'Storage Capacity' distribution of the network tiers.")}
                        >
                            <Sparkles className="h-3 w-3" />
                        </Button>
                    )}
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
                                content={<CustomTooltip onDrillDown={onDrillDown} />}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill="#f97316"
                                        fillOpacity={0.6 + (index * 0.1)}
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
