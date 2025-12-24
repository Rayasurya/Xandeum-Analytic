"use client";

import React, { useMemo, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface NodeLocation {
    pubkey: string;
    lat: number;
    lng: number;
    healthScore: number;
    storageCommitted: number;
    city?: string;
    country?: string;
    isOnline: boolean;
}

interface LeafletClusterMapProps {
    nodes: NodeLocation[];
    onNodeClick?: (pubkey: string) => void;
}

// Health score color thresholds
const getHealthColor = (health: number, isOnline: boolean): string => {
    if (!isOnline) return "#6b7280"; // Gray - Offline
    if (health >= 85) return "#22c55e"; // Green - Excellent
    if (health >= 60) return "#f59e0b"; // Orange - Good
    return "#ef4444"; // Red - Poor
};

// Create custom marker icon based on health
const createMarkerIcon = (health: number, isOnline: boolean, size: number = 24) => {
    const color = getHealthColor(health, isOnline);
    return L.divIcon({
        className: "custom-marker",
        html: `<div style="
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

// Create cluster icon with count and average health color
const createClusterIcon = (cluster: any) => {
    const markers = cluster.getAllChildMarkers();
    const count = markers.length;

    // Calculate average health
    let totalHealth = 0;
    let onlineCount = 0;
    markers.forEach((marker: any) => {
        const node = marker.options.nodeData;
        if (node?.isOnline) {
            totalHealth += node.healthScore || 0;
            onlineCount++;
        }
    });
    const avgHealth = onlineCount > 0 ? totalHealth / onlineCount : 0;
    const color = getHealthColor(avgHealth, onlineCount > 0);

    // Size based on count
    const size = Math.min(50, 30 + Math.log(count) * 8);

    return L.divIcon({
        className: "custom-cluster",
        html: `<div style="
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 3px 12px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${size > 40 ? 14 : 12}px;
            font-family: system-ui, sans-serif;
        ">${count}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

// Legend Component
function MapLegend() {
    return (
        <div className="absolute bottom-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
            <h4 className="text-xs font-semibold text-foreground mb-2">Legend</h4>
            <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                    <span className="text-[10px] text-muted-foreground">Health ≥85 (Excellent)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                    <span className="text-[10px] text-muted-foreground">Health 60-84 (Good)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                    <span className="text-[10px] text-muted-foreground">Health &lt;60 (Poor)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#6b7280]" />
                    <span className="text-[10px] text-muted-foreground">Offline</span>
                </div>
            </div>
            <div className="mt-2 pt-2 border-t border-border">
                <span className="text-[9px] text-muted-foreground italic">Marker size = Storage</span>
            </div>
        </div>
    );
}

export function LeafletClusterMap({ nodes, onNodeClick }: LeafletClusterMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    // Fix for Next.js SSR - Leaflet needs window
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fix default marker icons (Leaflet issue with bundlers)
    useEffect(() => {
        if (typeof window !== "undefined") {
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });
        }
    }, []);

    // Calculate marker size based on storage (normalized)
    const maxStorage = useMemo(() => {
        return Math.max(...nodes.map(n => n.storageCommitted || 0), 1);
    }, [nodes]);

    const getMarkerSize = (storage: number) => {
        const normalized = storage / maxStorage;
        return 16 + normalized * 24; // 16px to 40px
    };

    if (!isMounted) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={[30, 0] as LatLngExpression}
                zoom={2}
                minZoom={2}
                maxZoom={18}
                scrollWheelZoom={true}
                className="w-full h-full rounded-lg"
                style={{ background: "#0d1117" }}
            >
                {/* Dark map tiles - CartoDB Dark Matter */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterIcon}
                    maxClusterRadius={60}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    zoomToBoundsOnClick={true}
                >
                    {nodes.map((node) => (
                        <Marker
                            key={node.pubkey}
                            position={[node.lat, node.lng] as LatLngExpression}
                            icon={createMarkerIcon(node.healthScore, node.isOnline, getMarkerSize(node.storageCommitted))}
                            eventHandlers={{
                                click: () => onNodeClick?.(node.pubkey),
                            }}
                            // @ts-ignore - Custom property for cluster calculations
                            nodeData={node}
                        >
                            <Popup className="custom-popup">
                                <div className="p-2 min-w-[200px]">
                                    <p className="font-mono text-xs font-bold text-foreground mb-2">
                                        {node.pubkey.slice(0, 8)}...{node.pubkey.slice(-6)}
                                    </p>
                                    <div className="space-y-1 text-xs text-muted-foreground">
                                        {node.city && node.country && (
                                            <p>📍 {node.city}, {node.country}</p>
                                        )}
                                        <p>❤️ Health: <span className="font-semibold" style={{ color: getHealthColor(node.healthScore, node.isOnline) }}>
                                            {node.healthScore}%
                                        </span></p>
                                        <p>💾 Storage: {(node.storageCommitted / (1024 * 1024 * 1024)).toFixed(2)} GB</p>
                                        <p>Status: {node.isOnline ? "🟢 Online" : "⚪ Offline"}</p>
                                    </div>
                                    {onNodeClick && (
                                        <button
                                            onClick={() => onNodeClick(node.pubkey)}
                                            className="mt-2 w-full text-xs text-primary hover:underline"
                                        >
                                            View Details →
                                        </button>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            {/* Legend Overlay */}
            <MapLegend />
        </div>
    );
}
