"use client"

import React, { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Standard World Atlas TopoJSON
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GlobalMapProps {
    data: { name: string; value: number; code: string }[];
}

export function GlobalMap({ data }: GlobalMapProps) {
    const [position, setPosition] = useState<{
        coordinates: [number, number];
        zoom: number;
    }>({
        coordinates: [0, 0],
        zoom: 1
    });

    const minZoom = 1;
    const maxZoom = 4;

    function handleZoomIn() {
        setPosition((pos) => ({
            ...pos,
            zoom: Math.min(maxZoom, pos.zoom * 1.5)
        }));
    }

    function handleZoomOut() {
        setPosition((pos) => {
            const newZoom = Math.max(minZoom, pos.zoom / 1.5);
            // Reset to center when zooming back to minimum
            if (newZoom <= 1) {
                return { coordinates: [0, 0], zoom: newZoom };
            }
            return { ...pos, zoom: newZoom };
        });
    }

    function handleMove(position: { coordinates: [number, number]; zoom: number }) {
        if (!position || !position.coordinates) return;

        // Strict center lock at low zoom
        if (position.zoom < 1.1) {
            setPosition({ coordinates: [0, 0], zoom: 1 });
            return;
        }

        const newPosition = position;

        // Tighter pan limits to keep map in frame
        const panLimit = Math.max(0, (newPosition.zoom - 1) * 30);
        const latLimit = Math.max(0, (newPosition.zoom - 1) * 20);

        const constrainedCoords: [number, number] = [
            Math.max(-panLimit, Math.min(panLimit, newPosition.coordinates[0])),
            Math.max(-latLimit, Math.min(latLimit, newPosition.coordinates[1]))
        ];

        setPosition({
            coordinates: constrainedCoords,
            zoom: Math.max(minZoom, Math.min(maxZoom, newPosition.zoom))
        });
    }

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
        .domain([0, Math.max(...data.map(d => d.value), 5)])
        .range(["#ea580c", "#fdba74"]);

    return (
        <div className="relative overflow-hidden flex-1 w-full h-full bg-background">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            {/* Zoom Controls */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-row items-center gap-3 z-20 bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
                <Button variant="outline" size="icon" onClick={handleZoomOut} className="h-8 w-8 bg-card border-primary/20 hover:border-primary">
                    <Minus className="h-4 w-4" />
                </Button>
                <div className="relative w-32 h-8 flex items-center justify-center">
                    <input
                        type="range"
                        min={minZoom}
                        max={maxZoom}
                        step="0.1"
                        value={position.zoom}
                        onChange={(e) => setPosition((pos) => ({ ...pos, zoom: parseFloat(e.target.value) }))}
                        className="w-24 h-2 appearance-none bg-muted rounded-full cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md
                            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
                    />
                </div>
                <Button variant="outline" size="icon" onClick={handleZoomIn} className="h-8 w-8 bg-card border-primary/20 hover:border-primary">
                    <Plus className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground font-mono">{position.zoom.toFixed(1)}x</span>
            </div>

            {/* Map with Zoomable/Draggable Group */}
            <div className="w-full h-full relative z-0">
                <ComposableMap
                    projection="geoEqualEarth"
                    projectionConfig={{
                        scale: 150,
                        center: [0, 0],
                    }}
                    className="w-full h-full"
                >
                    <ZoomableGroup
                        zoom={position.zoom}
                        center={position.coordinates}
                        onMove={handleMove}
                        minZoom={minZoom}
                        maxZoom={maxZoom}
                        filterZoomEvent={(evt: { type: string }) => !evt.type.includes('wheel')}
                    >
                        <Geographies geography={GEO_URL}>
                            {({ geographies }: { geographies: any[] }) =>
                                geographies.map((geo) => {
                                    const countryName = geo.properties.name;
                                    const nodeCount = dataMap[countryName] || 0;

                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            onMouseEnter={() => {
                                                const { name } = geo.properties;
                                                setTooltipContent(`${name}: ${dataMap[name] || 0} Nodes`);
                                            }}
                                            onMouseLeave={() => {
                                                setTooltipContent("");
                                            }}
                                            onMouseMove={(event: React.MouseEvent) => {
                                                setHoverPosition({ x: event.clientX, y: event.clientY });
                                            }}
                                            style={{
                                                default: {
                                                    fill: nodeCount > 0 ? colorScale(nodeCount) : "#334155",
                                                    stroke: "#0f172a",
                                                    strokeWidth: 0.5,
                                                    outline: "none",
                                                },
                                                hover: {
                                                    fill: "#06b6d4",
                                                    stroke: "#fff",
                                                    strokeWidth: 1,
                                                    outline: "none",
                                                    cursor: "grab"
                                                },
                                                pressed: {
                                                    fill: "#E42",
                                                    outline: "none",
                                                    cursor: "grabbing"
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
            </div>
        </div>
    );
}
