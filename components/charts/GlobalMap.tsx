"use client"

import React, { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

// Standard World Atlas TopoJSON
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GlobalMapProps {
    data: { name: string; value: number; code: string }[];
}

export function GlobalMap({ data }: GlobalMapProps) {
    const [tooltipContent, setTooltipContent] = useState("");
    const [hoverPosition, setHoverPosition] = useState<{ x: number, y: number } | null>(null);

    // Normalize data for easy lookup by country name
    const dataMap = useMemo(() => {
        return data.reduce((acc, cur) => {
            acc[cur.name] = cur.value;
            return acc;
        }, {} as Record<string, number>);
    }, [data]);

    // Color Scale for Choropleth
    const colorScale = scaleLinear<string>()
        .domain([0, Math.max(...data.map(d => d.value), 5)]) // Ensure some range
        .range(["#ea580c", "#fdba74"]); // Visible Orange to Bright Orange

    return (
        <Card className="bg-card/40 border-border p-4 relative overflow-hidden group h-[750px] flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <CardHeader className="pb-2 z-10">
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Geographic Distribution
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 w-full relative z-0">
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        scale: 100,
                    }}
                    className="w-full h-full"
                >
                    <ZoomableGroup center={[0, 0]} zoom={1}>
                        <Geographies geography={GEO_URL}>
                            {({ geographies }: { geographies: any[] }) =>
                                geographies.map((geo) => {
                                    const countryName = geo.properties.name;
                                    const nodeCount = dataMap[countryName] || 0;

                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            onMouseEnter={(evt: any) => { // evt is SyntheticEvent but we just need side effects
                                                const { name } = geo.properties;
                                                setTooltipContent(`${name}: ${dataMap[name] || 0} Nodes`);
                                                // Basic positioning - could be improved with refs
                                            }}
                                            onMouseLeave={() => {
                                                setTooltipContent("");
                                            }}
                                            onMouseMove={(event: React.MouseEvent) => {
                                                // Native event positioning relative to viewport
                                                setHoverPosition({ x: event.clientX, y: event.clientY });
                                            }}
                                            style={{
                                                default: {
                                                    fill: nodeCount > 0 ? colorScale(nodeCount) : "#334155", // Active vs Empty
                                                    stroke: "#0f172a",
                                                    strokeWidth: 0.5,
                                                    outline: "none",
                                                },
                                                hover: {
                                                    fill: "#06b6d4", // Cyan on Hover
                                                    stroke: "#fff",
                                                    strokeWidth: 1,
                                                    outline: "none",
                                                    cursor: "pointer"
                                                },
                                                pressed: {
                                                    fill: "#E42",
                                                    outline: "none",
                                                },
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap>

                {/* Custom Floating Tooltip */}
                {tooltipContent && hoverPosition && (
                    <div
                        className="fixed pointer-events-none bg-popover text-popover-foreground text-xs font-mono py-1 px-2 rounded border border-border shadow-xl z-50 flex items-center gap-2"
                        style={{
                            left: hoverPosition.x + 10,
                            top: hoverPosition.y + 10,
                        }}
                    >
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        {tooltipContent}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
