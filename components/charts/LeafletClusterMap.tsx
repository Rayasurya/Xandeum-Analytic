"use client";

import React, { useMemo, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
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

// Format storage for display
const formatStorageShort = (bytes: number): string => {
    if (!bytes) return "0 GB";
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1000) return `${(gb / 1024).toFixed(1)} TB`;
    return `${gb.toFixed(1)} GB`;
};

// Create custom marker icon based on health
const createMarkerIcon = (node: NodeLocation, size: number = 24) => {
    const color = getHealthColor(node.healthScore, node.isOnline);

    return L.divIcon({
        className: "custom-marker",
        html: `<div style="
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            cursor: pointer;
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

// Create cluster icon with count - uses WORST health to highlight problem areas
const createClusterIcon = (cluster: any) => {
    const markers = cluster.getAllChildMarkers();
    const count = markers.length;

    // Count nodes by health category and sum storage
    let excellentCount = 0;  // >= 85
    let goodCount = 0;       // 60-84
    let poorCount = 0;       // < 60
    let offlineCount = 0;
    let totalStorage = 0;

    markers.forEach((marker: any) => {
        const node = marker.options.nodeData;
        if (node) {
            totalStorage += node.storageCommitted || 0;
            if (!node.isOnline) {
                offlineCount++;
            } else if (node.healthScore >= 85) {
                excellentCount++;
            } else if (node.healthScore >= 60) {
                goodCount++;
            } else {
                poorCount++;
            }
        }
    });

    // Determine cluster color based on worst case
    let color: string;
    let borderColor: string;

    if (offlineCount > 0 && excellentCount + goodCount + poorCount === 0) {
        color = "#6b7280";
        borderColor = "#374151";
    } else if (poorCount > 0) {
        color = "#ef4444";
        borderColor = "#dc2626";
    } else if (goodCount > 0 || offlineCount > 0) {
        color = "#f59e0b";
        borderColor = "#d97706";
    } else {
        color = "#22c55e";
        borderColor = "#16a34a";
    }

    // Size based on count
    const size = Math.min(55, 35 + Math.log(count) * 8);

    // Build tooltip content - only show non-zero categories + storage
    const tooltipLines: string[] = [];
    if (excellentCount > 0) tooltipLines.push(`<div>🟢 ${excellentCount} Excellent</div>`);
    if (goodCount > 0) tooltipLines.push(`<div>🟠 ${goodCount} Good</div>`);
    if (poorCount > 0) tooltipLines.push(`<div>🔴 ${poorCount} Poor</div>`);
    if (offlineCount > 0) tooltipLines.push(`<div>⚪ ${offlineCount} Offline</div>`);
    tooltipLines.push(`<div>💾 ${formatStorageShort(totalStorage)}</div>`);
    const tooltipHtml = tooltipLines.join('');

    // Add indicator ring if there are issues
    const hasIssues = offlineCount > 0 || poorCount > 0 || goodCount > 0;
    const ringStyle = hasIssues ? `
        box-shadow: 0 0 0 4px ${borderColor}40, 0 3px 12px rgba(0,0,0,0.5);
    ` : `
        box-shadow: 0 3px 12px rgba(0,0,0,0.5);
    `;

    return L.divIcon({
        className: "custom-cluster",
        html: `
            <div class="cluster-marker" style="
                position: relative;
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border: 3px solid white;
                border-radius: 50%;
                ${ringStyle}
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: ${size > 45 ? 14 : 12}px;
                font-family: system-ui, sans-serif;
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                cursor: pointer;
            ">
                ${count}
                <div class="cluster-tooltip">
                    ${tooltipHtml}
                </div>
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

// Legend Component
function MapLegend() {
    return (
        <div className="absolute bottom-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
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

// Filter Panel Component
interface FilterState {
    statusOnline: boolean;
    statusOffline: boolean;
    excellent: boolean;
    good: boolean;
    poor: boolean;
    clustering: boolean;
    // Storage filters
    storageSmall: boolean;   // < 100 GB
    storageMedium: boolean;  // 100 GB - 1 TB
    storageLarge: boolean;   // > 1 TB
}

function MapFilters({
    filters,
    setFilters,
    isOpen,
    setIsOpen,
    nodeCount,
    totalCount
}: {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    nodeCount: number;
    totalCount: number;
}) {
    return (
        <>
            {/* Filter Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute top-4 right-4 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg flex items-center gap-2 hover:bg-muted transition-colors"
            >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-xs font-medium text-foreground">Filters</span>
            </button>

            {/* Filter Panel */}
            {isOpen && (
                <div className="absolute top-4 right-4 z-[1001] bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl w-56">
                    <div className="flex items-center justify-between p-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span className="text-sm font-semibold text-foreground">Filters</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-3 space-y-4">                        {/* Node Count Display */}
                        <div className="text-xs text-muted-foreground border-b border-border pb-2 mb-1">
                            Showing <span className="font-semibold text-foreground">{nodeCount}</span> of {totalCount} nodes
                        </div>

                        {/* Status Section */}
                        <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">Status</span>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.statusOnline}
                                        onChange={() => setFilters(f => ({ ...f, statusOnline: !f.statusOnline }))}
                                        className="w-4 h-4 rounded border-border bg-muted text-primary accent-primary cursor-pointer"
                                    />
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                    <span className="text-xs text-foreground">Online</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.statusOffline}
                                        onChange={() => setFilters(f => ({ ...f, statusOffline: !f.statusOffline }))}
                                        className="w-4 h-4 rounded border-border bg-muted text-primary accent-[#6b7280] cursor-pointer"
                                    />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#6b7280]" />
                                    <span className="text-xs text-foreground">Offline</span>
                                </label>
                            </div>
                        </div>

                        {/* Health Tier */}
                        <div className="space-y-2 pt-2 border-t border-border">
                            <span className="text-xs text-muted-foreground">Health Tier</span>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.excellent}
                                        onChange={() => setFilters(f => ({ ...f, excellent: !f.excellent }))}
                                        className="w-4 h-4 rounded border-border bg-muted text-primary accent-[#22c55e] cursor-pointer"
                                    />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                                    <span className="text-[11px] text-foreground">Excellent (≥85)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.good}
                                        onChange={() => setFilters(f => ({ ...f, good: !f.good }))}
                                        className="w-4 h-4 rounded border-border bg-muted text-primary accent-[#f59e0b] cursor-pointer"
                                    />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                                    <span className="text-[11px] text-foreground">Good (60-84)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.poor}
                                        onChange={() => setFilters(f => ({ ...f, poor: !f.poor }))}
                                        className="w-4 h-4 rounded border-border bg-muted text-primary accent-[#ef4444] cursor-pointer"
                                    />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                                    <span className="text-[11px] text-foreground">Poor (&lt;60)</span>
                                </label>
                            </div>
                        </div>

                        {/* Storage Capacity */}
                        <div className="space-y-2 pt-2 border-t border-border">
                            <span className="text-xs text-muted-foreground">Storage Capacity</span>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.storageSmall}
                                        onChange={() => setFilters(f => ({ ...f, storageSmall: !f.storageSmall }))}
                                        className="w-4 h-4 rounded border-border bg-muted text-primary accent-primary cursor-pointer"
                                    />
                                    <span className="text-[11px] text-foreground">💾 Small (&lt;100 GB)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.storageMedium}
                                        onChange={() => setFilters(f => ({ ...f, storageMedium: !f.storageMedium }))}
                                        className="w-4 h-4 rounded border-border bg-muted text-primary accent-primary cursor-pointer"
                                    />
                                    <span className="text-[11px] text-foreground">💾 Medium (100GB - 1TB)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.storageLarge}
                                        onChange={() => setFilters(f => ({ ...f, storageLarge: !f.storageLarge }))}
                                        className="w-4 h-4 rounded border-border bg-muted text-primary accent-primary cursor-pointer"
                                    />
                                    <span className="text-[11px] text-foreground">💾 Large (&gt;1 TB)</span>
                                </label>
                            </div>
                        </div>

                        {/* Clustering Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-border">
                            <input
                                type="checkbox"
                                checked={filters.clustering}
                                onChange={() => setFilters(f => ({ ...f, clustering: !f.clustering }))}
                                className="w-4 h-4 rounded border-border bg-muted text-primary accent-primary cursor-pointer"
                            />
                            <span className="text-xs text-foreground">Enable Clustering</span>
                        </label>
                    </div>
                </div>
            )}
        </>
    );
}

export function LeafletClusterMap({ nodes, onNodeClick }: LeafletClusterMapProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        statusOnline: true,
        statusOffline: true,
        excellent: true,
        good: true,
        poor: true,
        clustering: true,
        storageSmall: true,
        storageMedium: true,
        storageLarge: true,
    });

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
        return 24 + normalized * 24; // 24px to 48px
    };

    // Apply filters to nodes
    const filteredNodes = useMemo(() => {
        return nodes.filter(node => {
            // Status filters
            if (node.isOnline && !filters.statusOnline) return false;
            if (!node.isOnline && !filters.statusOffline) return false;

            // Health tier filters (only for online nodes)
            if (node.isOnline) {
                if (node.healthScore >= 85 && !filters.excellent) return false;
                if (node.healthScore >= 60 && node.healthScore < 85 && !filters.good) return false;
                if (node.healthScore < 60 && !filters.poor) return false;
            }

            // Storage size filters
            const storageGB = node.storageCommitted / (1024 * 1024 * 1024);
            if (storageGB < 100 && !filters.storageSmall) return false;
            if (storageGB >= 100 && storageGB < 1000 && !filters.storageMedium) return false;
            if (storageGB >= 1000 && !filters.storageLarge) return false;

            return true;
        });
    }, [nodes, filters]);

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
                maxBounds={[[-85, -180], [85, 180]] as L.LatLngBoundsExpression}
                maxBoundsViscosity={1.0}
            >
                {/* Dark map tiles - CartoDB Dark Matter */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {filters.clustering ? (
                    <MarkerClusterGroup
                        key="cluster-group"
                        chunkedLoading
                        iconCreateFunction={createClusterIcon}
                        maxClusterRadius={80}
                        showCoverageOnHover={false}
                        zoomToBoundsOnClick={true}
                        spiderfyOnMaxZoom={true}
                        spiderLegPolylineOptions={{ weight: 0 }}
                    >
                        {filteredNodes.map((node) => (
                            <Marker
                                key={node.pubkey}
                                position={[node.lat, node.lng] as LatLngExpression}
                                icon={createMarkerIcon(node, getMarkerSize(node.storageCommitted))}
                                // @ts-ignore - Custom property for cluster calculations
                                nodeData={node}
                                eventHandlers={{
                                    click: () => onNodeClick?.(node.pubkey),
                                }}
                            >
                                <Tooltip
                                    direction="top"
                                    offset={[0, -10]}
                                    opacity={1}
                                    className="custom-tooltip"
                                >
                                    <div className="text-xs whitespace-nowrap">
                                        <div>{node.isOnline ? "🟢 Online" : "⚪ Offline"}</div>
                                        <div>❤️ Health: {Math.round(node.healthScore)}%</div>
                                        <div>💾 Storage: {formatStorageShort(node.storageCommitted)}</div>
                                    </div>
                                </Tooltip>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>
                ) : (
                    // No clustering - render markers directly
                    filteredNodes.map((node) => (
                        <Marker
                            key={node.pubkey}
                            position={[node.lat, node.lng] as LatLngExpression}
                            icon={createMarkerIcon(node, getMarkerSize(node.storageCommitted))}
                            eventHandlers={{
                                click: () => onNodeClick?.(node.pubkey),
                            }}
                        >
                            <Tooltip
                                direction="top"
                                offset={[0, -10]}
                                opacity={1}
                            >
                                <div className="text-xs whitespace-nowrap">
                                    <div>{node.isOnline ? "🟢 Online" : "⚪ Offline"}</div>
                                    <div>❤️ Health: {Math.round(node.healthScore)}%</div>
                                    <div>💾 Storage: {formatStorageShort(node.storageCommitted)}</div>
                                </div>
                            </Tooltip>
                        </Marker>
                    ))
                )}
            </MapContainer>

            {/* Legend Overlay */}
            <MapLegend />

            {/* Filters Panel */}
            <MapFilters
                filters={filters}
                setFilters={setFilters}
                isOpen={filtersOpen}
                setIsOpen={setFiltersOpen}
                nodeCount={filteredNodes.length}
                totalCount={nodes.length}
            />
        </div>
    );
}
