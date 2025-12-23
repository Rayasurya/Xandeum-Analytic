"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { XandeumClient, PNodeInfo } from "./lib/xandeum";
import { XANDEUM_CONFIG } from "./config";
import {
  Activity,
  Server,
  Search,
  RefreshCw,
  LayoutDashboard,
  Database,
  Download,
  Filter,
  Globe,
  Zap,
  BookOpen,
  Map as MapIcon,
  CreditCard,
  FileText,
  Wifi,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { AnalyticsBar } from "@/components/charts/AnalyticsBar";
import { CountryChart } from "@/components/charts/CountryChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { ModeToggle } from "@/components/mode-toggle";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { VersionChart } from "@/components/charts/VersionDistribution";
import { StatusChart } from "@/components/charts/NetworkStatus";
import { NetworkPerformance } from "@/components/charts/NetworkPerformance";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { GlobalMap } from "@/components/charts/GlobalMap";
import { StorageDistribution } from "@/components/charts/StorageDistribution";
import { NodeLeaderboard } from "@/components/charts/NodeLeaderboard";


type ViewState = "dashboard" | "pnodes" | "analytics" | "map";

const formatStorage = (bytes: number) => {
  if (!bytes) return "0 GB";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1000) return `${(gb / 1024).toFixed(1)} TB`;
  return `${gb.toFixed(4)} GB`;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatPubkey = (key: string) => {
  if (!key) return "Unknown";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
};

export default function Home() {
  // Navigation State
  const [activeView, setActiveView] = useState<ViewState>("dashboard");

  // Data State
  const [nodes, setNodes] = useState<PNodeInfo[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, delinquent: 0 });
  const [metrics, setMetrics] = useState<any>(null);

  // Geo Cache State
  const [geoCache, setGeoCache] = useState<Record<string, any>>({});
  const [isGeoSyncing, setIsGeoSyncing] = useState(false);

  // UI State
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState<PNodeInfo | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterVersion, setFilterVersion] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const { toast } = useToast();
  const client = new XandeumClient();

  const fetchGeoBatch = async (nodeList: PNodeInfo[]) => {
    if (Object.keys(geoCache).length > 0) return; // Already cached
    setIsGeoSyncing(true);

    try {
      // 1. Extract Unique IPs from Gossip Addresses (e.g. "23.83.67.172:8000" -> "23.83.67.172")
      const uniqueIps = Array.from(new Set(
        nodeList
          .map(n => n.gossip?.split(':')[0])
          .filter(ip => ip && ip !== "127.0.0.1" && !ip.startsWith("0."))
      )).slice(0, 95); // Limit to 95 to be safe with 100 limit

      if (uniqueIps.length === 0) return;

      // 2. Batch Request (via internal proxy to avoid Mixed Content / HTTPS issues)
      const response = await fetch("/api/geo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Body is already the array of objects { query: ip } expected by the proxy/ip-api
        body: JSON.stringify(uniqueIps.map(ip => ({ query: ip })))
      });

      const data = await response.json();

      // 3. Map Results
      const newCache: Record<string, any> = {};
      data.forEach((item: any) => {
        if (item.status === "success") {
          newCache[item.query] = item;
        }
      });

      setGeoCache(newCache);
    } catch (err) {
      console.error("Geo Batch Sync Failed", err);
    } finally {
      setIsGeoSyncing(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [nodeList, statsData, networkMetrics] = await Promise.all([
        client.getPNodes(),
        client.getStats(),
        client.getNetworkMetrics()
      ]);

      setNodes(nodeList);
      setStats(statsData);
      setMetrics(networkMetrics);

      // Trigger Background Geo Sync
      fetchGeoBatch(nodeList);

      toast({
        title: "System Synced",
        description: `Connected to Epoch ${networkMetrics?.epoch || 'Unknown'}`,
      })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: err.message || "Could not connect to Xandeum pRPC.",
      })
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial Fetch
    fetchData();

    // Poll for live metrics every 5 seconds
    const interval = setInterval(async () => {
      try {
        const metrics = await client.getNetworkMetrics();
        if (metrics) {
          setMetrics(metrics);
        }
      } catch (err) {
        console.error("Metric Polling Failed", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);


  // Compute Chart Data
  const versionData = useMemo(() => {
    const counts = nodes.reduce((acc, node) => {
      const v = XandeumClient.formatVersion(node.version || null);
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [nodes]);

  const storageDistributionData = useMemo(() => {
    const bins = {
      "< 100 GB": 0,
      "100 GB - 1 TB": 0,
      "1 TB - 10 TB": 0,
      "> 10 TB": 0
    };
    nodes.forEach(node => {
      const gb = (node.storage_committed || 0) / (1024 * 1024 * 1024);
      if (gb < 100) bins["< 100 GB"]++;
      else if (gb < 1000) bins["100 GB - 1 TB"]++;
      else if (gb < 10000) bins["1 TB - 10 TB"]++;
      else bins["> 10 TB"]++;
    });
    return Object.entries(bins).map(([name, value]) => ({ name, value }));
  }, [nodes]);

  const leaderboardData = useMemo(() => {
    // Sort by Storage Committed (Real Data) instead of empty Credits
    return nodes
      .sort((a, b) => (b.storage_committed || 0) - (a.storage_committed || 0))
      .slice(0, 5)
      .map(node => ({
        name: `${node.pubkey?.slice(0, 4)}...${node.pubkey?.slice(-4)}`,
        fullPubkey: node.pubkey || "Unknown",
        value: Number(((node.storage_committed || 0) / (1024 * 1024 * 1024)).toFixed(2)) // GB
      }));
  }, [nodes]);

  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(geoCache).forEach((geo: any) => {
      const country = geo.country || "Unknown";
      counts[country] = (counts[country] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, code: "XX" })) // Add code if needed
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [geoCache]);

  const statusData = useMemo(() => [
    { name: "Active", value: stats.active },
    { name: "Inactive", value: stats.total - stats.active }
  ], [stats]);

  const activeVersionsCount = useMemo(() => {
    return new Set(nodes.map(n => n.version?.split(' ')[0])).size;
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    let result = nodes.filter(node => {
      // 1. Search Filter
      const matchesSearch = (node.pubkey?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (node.gossip && node.gossip.includes(searchTerm));

      // 2. Status Filter
      let matchesStatus = true;
      if (filterStatus === "active") matchesStatus = !!node.rpc || !!node.tpu;
      if (filterStatus === "inactive") matchesStatus = !node.rpc && !node.tpu;

      // 3. Country Filter
      let matchesCountry = true;
      if (filterCountry !== "all") {
        const ip = node.gossip?.split(':')[0] || "";
        const geo = geoCache[ip];
        if (!geo || geo.country !== filterCountry) matchesCountry = false;
      }

      // 4. Version Filter
      let matchesVersion = true;
      if (filterVersion !== "all") {
        const nodeVersion = node.version?.split(' ')[0] || "Unknown";
        if (nodeVersion !== filterVersion) matchesVersion = false;
      }

      return matchesSearch && matchesStatus && matchesCountry && matchesVersion;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any = "";
        let bValue: any = "";

        if (sortConfig.key === "pubkey") {
          aValue = a.pubkey;
          bValue = b.pubkey;
        } else if (sortConfig.key === "status") {
          aValue = a.rpc ? 1 : 0;
          bValue = b.rpc ? 1 : 0;
        } else if (sortConfig.key === "version") {
          aValue = a.version || "";
          bValue = b.version || "";
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [nodes, searchTerm, filterStatus, filterCountry, filterVersion, sortConfig, geoCache]);

  // Handle viewing a specific node (load Geo from cache)
  const handleNodeClick = (node: PNodeInfo) => {
    setSelectedNode(node);
    // If we don't have this one in cache (maybe added recently), fetch it individually
    const ip = node.gossip?.split(':')[0];
    if (ip && !geoCache[ip]) {
      fetch(`http://ip-api.com/json/${ip}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            setGeoCache(prev => ({ ...prev, [ip]: data }));
          }
        });
    }
  };


  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    if (filteredNodes.length === 0) return;
    const headers = ["Node Identity (Pubkey)", "Status", "Gossip Address", "Version", "RPC Endpoint", "Country", "City", "ISP"];
    const csvContent = [
      headers.join(","),
      ...filteredNodes.map(node => {
        const ip = node.gossip?.split(':')[0] || "";
        const geo = geoCache[ip] || {};
        return [
          node.pubkey,
          node.rpc ? "Active" : "Inactive",
          node.gossip || "N/A",
          node.version || "Unknown",
          node.rpc || "N/A",
          geo.country || "Unknown",
          geo.city || "Unknown",
          geo.isp || "Unknown"
        ].map(field => `"${field}"`).join(",")
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `xandeum_nodes_enriched.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportHtml = () => {
    if (!selectedNode) return;
    const ip = selectedNode.gossip?.split(':')[0] || "";
    const geo = geoCache[ip];

    // ... basic HTML generation ...
  };



  // Right Sidebar State - for pNodes detail panel
  const [rightSidebarWidth, setRightSidebarWidth] = useState(420);
  const [isRightDragging, setIsRightDragging] = useState(false);
  const rightMinWidth = 300;
  const rightMaxWidth = 600;

  const handleRightMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRightDragging(true);
  };

  useEffect(() => {
    const handleRightMouseMove = (e: MouseEvent) => {
      if (!isRightDragging) return;
      const windowWidth = window.innerWidth;
      const newWidth = Math.max(rightMinWidth, Math.min(rightMaxWidth, windowWidth - e.clientX));
      setRightSidebarWidth(newWidth);
    };

    const handleRightMouseUp = () => {
      setIsRightDragging(false);
    };

    if (isRightDragging) {
      document.addEventListener('mousemove', handleRightMouseMove);
      document.addEventListener('mouseup', handleRightMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleRightMouseMove);
      document.removeEventListener('mouseup', handleRightMouseUp);
    };
  }, [isRightDragging]);

  // Show right panel only when in pNodes view and a node is selected
  const showRightPanel = activeView === "pnodes" && !!selectedNode;

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans transition-colors duration-300 h-screen overflow-hidden">



      {/* Main Content + Right Panel Container */}
      <div className="flex-1 flex min-w-0 h-full overflow-hidden">
        <main className={cn("flex-1 flex flex-col min-w-0 min-h-0 bg-background relative overflow-x-hidden h-full", (activeView === "pnodes" || activeView === "map") ? "overflow-hidden" : "overflow-y-auto")}>
          {/* Background */}
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <header className="h-16 flex-shrink-0 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-6">
              {/* Branding */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                  <Database className="text-primary h-5 w-5" />
                </div>
                <div className="flex flex-row items-baseline gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-foreground leading-none">XANDEUM</span>
                  <span className="text-[10px] font-mono text-cyan-500 tracking-[0.2em] uppercase">Scope</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-border/60" />

              {/* Navigation Tabs */}
              <nav className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  onClick={() => setActiveView("dashboard")}
                  className={cn(
                    "h-9 px-4 text-sm font-medium transition-all relative",
                    activeView === "dashboard" ? "text-foreground bg-secondary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  Dashboard
                  {activeView === "dashboard" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-sm" />}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveView("pnodes")}
                  className={cn(
                    "h-9 px-4 text-sm font-medium transition-all relative",
                    activeView === "pnodes" ? "text-foreground bg-secondary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  Node Registry
                  {activeView === "pnodes" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-sm" />}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveView("map")}
                  className={cn(
                    "h-9 px-4 text-sm font-medium transition-all relative",
                    activeView === "map" ? "text-foreground bg-secondary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  Storage Map
                  {activeView === "map" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-sm" />}
                </Button>
              </nav>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <div className="hidden lg:flex items-center gap-4 mr-3 border-r border-border pr-3">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Total Supply</p>
                  <p className="text-sm font-mono text-secondary font-bold">{metrics?.totalSupply || "Loading..."}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Epoch</p>
                  <p className="text-sm font-mono text-foreground font-bold">{metrics?.epoch || "Syncing"}</p>
                </div>
              </div>
              <ModeToggle />
            </div>
          </header>

          <div className={cn("w-full relative z-10", activeView === "dashboard" ? "px-8 py-6 space-y-8" : "hidden")}>

            {/* VIEW: DASHBOARD */}
            {activeView === "dashboard" && (
              <>
                {/* Hero Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <DashboardCard
                    icon={<Server className="w-3 h-3 text-secondary" />}
                    title="Total Nodes"
                    value={stats.total}
                    subtext="Global Network"
                    subtextClassName="text-secondary/80"
                    tooltip="Total number of nodes discovered in the network gossip mesh."
                  />
                  <DashboardCard
                    icon={<Zap className="w-3 h-3 text-primary" />}
                    title="Online Nodes"
                    value={stats.active}
                    subtext="RPC/TPU Responding"
                    subtextClassName="text-emerald-500"
                    tooltip="Nodes actively participating in consensus and responding to RPC requests."
                  />
                  <DashboardCard
                    icon={<Database className="w-3 h-3 text-blue-400" />}
                    title="Total Storage"
                    value={(() => {
                      const totalBytes = nodes.reduce((acc, node) => acc + (node.storage_committed || 0), 0);
                      const tb = totalBytes / (1024 * 1024 * 1024 * 1024);
                      return `${tb.toFixed(1)} TB`;
                    })()}
                    subtext="Network Capacity"
                    subtextClassName="text-blue-400"
                    tooltip="Aggregate storage capacity committed by all nodes securely."
                  />
                  <DashboardCard
                    icon={<Activity className="w-3 h-3 text-muted-foreground" />}
                    title="Active Versions"
                    value={activeVersionsCount}
                    subtext="Unique Versions"
                    subtextClassName="text-muted-foreground"
                    onClick={() => setActiveView("pnodes")}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                  />

                </div>

                {/* ... existing charts ... */}
                {/* ... existing charts ... */}
                {/* Row 1: Network Performance (2 cols) + Storage Distribution (1 col) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <NetworkPerformance data={metrics?.tpsHistory || []} />
                  </div>
                  <div className="lg:col-span-1">
                    <StorageDistribution data={storageDistributionData} />
                  </div>
                </div>

                {/* Row 2: Version Chart (2 cols) + Node Leaderboard (1 col) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <VersionChart data={versionData} />
                  </div>
                  <div className="lg:col-span-1">
                    <NodeLeaderboard data={leaderboardData} />
                  </div>
                </div>

                {/* Row 3: Global Distribution (Full Width) */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="w-full">
                    <CountryChart data={countryData} />
                  </div>
                </div>

                {/* Row 3: Node Leaderboard (full width) */}
                <div>
                  <AnalyticsBar
                    title="Network Node Status"
                    segments={[
                      { label: "Online (RPC Active)", value: stats.active, color: "#3178c6" },
                      { label: "Gossip Only", value: stats.total - stats.active, color: "#f1e05a" },
                    ]}
                  />
                </div>
              </>
            )}          </div>

          {/* VIEW: NODES - Full height layout with right panel sticking to edge */}
          {activeView === "pnodes" && (
            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Table Section with padding */}
              <div className={cn("flex-1 min-w-0 px-8 py-6 space-y-4 overflow-y-auto", selectedNode && "hidden md:block")}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/50 p-4 rounded-xl border border-border">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search Node ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background border-input focus:border-primary text-foreground placeholder:text-muted-foreground font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button className="bg-primary hover:bg-orange-600 text-primary-foreground font-bold" onClick={handleExport}>
                      <Download className="mr-2 h-4 w-4" /> EXPORT ENRICHED CSV
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-border bg-card text-muted-foreground hover:text-foreground overflow-hidden whitespace-nowrap flex-shrink-0">
                          <Filter className="h-4 w-4 mr-2" />
                          Filters
                          {(filterStatus !== "all" || filterCountry !== "all" || filterVersion !== "all") && (
                            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                              {(filterStatus !== "all" ? 1 : 0) + (filterCountry !== "all" ? 1 : 0) + (filterVersion !== "all" ? 1 : 0)}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-popover border-border text-popover-foreground">
                        {/* Status Section */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Status
                        </div>
                        <DropdownMenuItem onClick={() => setFilterStatus("all")} className="flex items-center justify-between cursor-pointer">
                          All Nodes
                          {filterStatus === "all" && <Check className="h-4 w-4 text-primary" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("active")} className="flex items-center justify-between cursor-pointer">
                          Active Only
                          {filterStatus === "active" && <Check className="h-4 w-4 text-emerald-500" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("inactive")} className="flex items-center justify-between cursor-pointer">
                          Inactive Only
                          {filterStatus === "inactive" && <Check className="h-4 w-4 text-red-500" />}
                        </DropdownMenuItem>

                        <Separator className="my-1 bg-border" />

                        {/* Country Section */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Country
                        </div>
                        <DropdownMenuItem onClick={() => setFilterCountry("all")} className="flex items-center justify-between cursor-pointer">
                          All Countries
                          {filterCountry === "all" && <Check className="h-4 w-4 text-primary" />}
                        </DropdownMenuItem>
                        {/* Dynamically list top countries found in cache */}
                        {Array.from(new Set(Object.values(geoCache).map((g: any) => g.country))).slice(0, 5).map((country: any) => (
                          <DropdownMenuItem key={country} onClick={() => setFilterCountry(country)} className="flex items-center justify-between cursor-pointer">
                            <span className="truncate max-w-[150px]">{country}</span>
                            {filterCountry === country && <Check className="h-4 w-4 text-primary" />}
                          </DropdownMenuItem>
                        ))}

                        <Separator className="my-1 bg-border" />

                        {/* Version Section */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Version
                        </div>
                        <DropdownMenuItem onClick={() => setFilterVersion("all")} className="flex items-center justify-between cursor-pointer">
                          All Versions
                          {filterVersion === "all" && <Check className="h-4 w-4 text-primary" />}
                        </DropdownMenuItem>
                        {versionData.map((v) => (
                          <DropdownMenuItem key={v.name} onClick={() => setFilterVersion(v.name)} className="flex items-center justify-between cursor-pointer">
                            <span className="truncate max-w-[150px]">{v.name}</span>
                            {filterVersion === v.name && <Check className="h-4 w-4 text-primary" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Card className="flex-1 min-h-0 bg-background/50 backdrop-blur-sm border-border overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-auto rounded-md custom-scrollbar">
                    <Table className="w-full table-fixed">
                      <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent border-border">
                          <TableHead className="w-[5%]"></TableHead>
                          <TableHead className="w-[25%] font-bold text-secondary cursor-pointer" onClick={() => handleSort("pubkey")}>
                            Node Identity {sortConfig?.key === "pubkey" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                          </TableHead>
                          <TableHead className="w-[25%] font-bold text-secondary hidden md:table-cell">Gossip Address</TableHead>
                          <TableHead className="w-[15%] font-bold text-secondary hidden md:table-cell">Version</TableHead>
                          <TableHead className="w-[10%] font-bold text-secondary text-right">Uptime</TableHead>
                          <TableHead className="w-[20%] font-bold text-secondary text-right">Storage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNodes.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="h-24 text-center">No nodes found...</TableCell></TableRow>
                        ) : (
                          filteredNodes.map((node) => {
                            const ip = node.gossip?.split(':')[0] || "";
                            const geo = geoCache[ip];

                            // Format Uptime
                            let uptimeString = "0s";
                            if (node.uptime) {
                              const days = node.uptime / 86400;
                              if (days > 1) uptimeString = `${days.toFixed(1)}d`;
                              else {
                                const hours = node.uptime / 3600;
                                uptimeString = `${hours.toFixed(1)}h`;
                              }
                            }

                            // Format Storage
                            const committed = formatStorage(node.storage_committed || 0);
                            const used = formatBytes(node.storage_used || 0);

                            return (
                              <TableRow
                                key={node.pubkey}
                                className={cn(
                                  "cursor-pointer border-border transition-colors",
                                  selectedNode?.pubkey === node.pubkey
                                    ? "bg-primary/10 border-l-2 border-l-primary hover:bg-primary/20"
                                    : "hover:bg-muted/50"
                                )}
                                onClick={() => handleNodeClick(node)}
                              >
                                <TableCell className="text-center"><div className={`mx-auto h-2.5 w-2.5 rounded-full shadow-sm ${node.rpc ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50"}`} /></TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-mono text-foreground text-sm truncate max-w-[150px] font-bold">{formatPubkey(node.pubkey)}</span>
                                    <span className="text-[10px] text-muted-foreground">{geo ? geo.country : "Unknown Region"}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground break-all">
                                  {node.gossip}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <Badge variant="outline" className="bg-cyan-950/30 text-cyan-400 border-cyan-800/50 font-mono text-xs max-w-[180px] truncate inline-block">
                                    {XandeumClient.formatVersion(node.version || null)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm text-foreground">{uptimeString}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex flex-col items-end">
                                    <span className="font-bold text-sm text-foreground">{committed}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {((node.storage_committed || 0) / (1024 * 1024)).toFixed(0)} MB Cached
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>

              {/* Right Panel - Node Details (sticks to edge) */}
              {selectedNode && (
                <>
                  {/* Resize Handle */}
                  {/* Resize Handle */}
                  <div
                    onMouseDown={handleRightMouseDown}
                    className="w-1.5 h-full cursor-col-resize bg-background border-l border-border hover:bg-primary/20 flex-shrink-0 transition-colors z-50 hidden md:flex items-center justify-center"
                  >
                    <div className="h-8 w-1 bg-muted-foreground/30 rounded-full" />
                  </div>
                  <aside
                    className="hidden md:flex flex-shrink-0 h-full min-h-0 flex-col overflow-hidden shadow-sm"
                    style={{ width: rightSidebarWidth, backgroundColor: '#020617' }}
                  >

                    {/* Header */}
                    <div className="flex-shrink-0 border-b border-border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Server className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-bold tracking-tight text-foreground">Node Details</h2>
                        </div>
                        <button
                          onClick={() => setSelectedNode(null)}
                          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          aria-label="Close panel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-muted-foreground font-mono text-xs mt-1 truncate">
                        {selectedNode?.pubkey}
                      </p>
                    </div>

                    {/* Content */}
                    {(() => {
                      const ip = selectedNode?.gossip?.split(':')[0] || "";
                      const geoData = geoCache[ip];

                      return (
                        <ScrollArea className="flex-1" style={{ height: 'calc(100vh - 180px)' }}>
                          <div className="p-4 space-y-4">
                            {/* Status & Version */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1 flex-shrink-0">
                                <Label className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                                  <Wifi className="inline w-3 h-3 mr-1" /> Status
                                </Label>
                                <div className="flex items-center gap-2">
                                  {selectedNode?.rpc ? (
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none">
                                      Online
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive">Offline</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-1 text-right min-w-0 flex-1">
                                <Label className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                                  Version
                                </Label>
                                <div className="font-mono text-sm text-foreground break-all">
                                  {XandeumClient.formatVersion(selectedNode?.version || "Unknown")}
                                </div>
                              </div>
                            </div>

                            <Separator className="bg-border" />

                            {/* Addresses */}
                            <div className="space-y-3">
                              <div>
                                <Label className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                                  Gossip
                                </Label>
                                <div className="font-mono text-xs bg-muted p-2 rounded border border-border mt-1 break-all text-foreground">
                                  {selectedNode?.gossip || "N/A"}
                                </div>
                              </div>
                              <div>
                                <Label className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                                  RPC
                                </Label>
                                <div className="font-mono text-xs bg-muted p-2 rounded border border-border mt-1 break-all text-foreground">
                                  {selectedNode?.rpc || "N/A"}
                                </div>
                              </div>
                            </div>

                            <Separator className="bg-border" />

                            {/* Geolocation */}
                            <div>
                              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                <Globe className="h-4 w-4 text-primary" /> Geolocation
                              </h4>
                              {!geoData && isGeoSyncing ? (
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-full bg-muted" />
                                  <Skeleton className="h-4 w-3/4 bg-muted" />
                                </div>
                              ) : geoData ? (
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Country</p>
                                    <p className="font-medium text-foreground flex items-center gap-1">
                                      <span>
                                        {geoData.countryCode
                                          ? geoData.countryCode.toUpperCase().replace(/./g, (char: string) => String.fromCodePoint(char.charCodeAt(0) + 127397))
                                          : "🌐"}
                                      </span>
                                      <span className="truncate">{geoData.country}</span>
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">City</p>
                                    <p className="font-medium text-foreground truncate">{geoData.city}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Region</p>
                                    <p className="font-medium text-foreground truncate">{geoData.regionName || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Timezone</p>
                                    <p className="font-medium text-foreground truncate">{geoData.timezone || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">ASN</p>
                                    <p className="font-medium text-foreground truncate">{geoData.as || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Organization</p>
                                    <p className="font-medium text-foreground truncate">{geoData.org || geoData.isp || "N/A"}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-muted-foreground text-xs">No Geo Data</div>
                              )}
                            </div>

                            <Button
                              onClick={handleExportHtml}
                              className="w-full bg-primary hover:bg-orange-600 text-primary-foreground font-bold h-10 mt-4"
                              size="sm"
                            >
                              <Download className="mr-2 h-4 w-4" /> Export as HTML
                            </Button>

                            <Separator className="bg-border my-4" />

                            {/* Raw JSON Stream */}
                            <div>
                              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" /> RAW_JSON_STREAM
                              </h4>
                              <div className="bg-muted/50 rounded-lg border border-border p-3 font-mono text-[10px] text-muted-foreground overflow-x-auto max-h-40 overflow-y-auto">
                                <pre className="whitespace-pre-wrap break-all">
                                  {JSON.stringify({
                                    pubkey: selectedNode?.pubkey,
                                    gossip: selectedNode?.gossip,
                                    rpc: selectedNode?.rpc,
                                    version: selectedNode?.version,
                                    storage_committed: selectedNode?.storage_committed,
                                    storage_used: selectedNode?.storage_used,
                                    storage_usage_percent: selectedNode?.storage_usage_percent,
                                    uptime: selectedNode?.uptime,
                                    credits: selectedNode?.credits,
                                  }, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      )
                    })()}

                  </aside>
                </>
              )}
            </div>
          )}



          {/* VIEW: MAP */}
          {activeView === "map" && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <GlobalMap data={countryData} />
            </div>
          )}

          <Toaster />
        </main>
      </div>
    </div>
  );
}

// Subcomponents
function DashboardCard({ icon, title, value, subtext, subtextClassName, tooltip }: any) {
  return (
    <Card className="bg-card/40 border-border shadow-sm hover:bg-muted/50 transition-colors duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          {icon} {title}
          {tooltip && <InfoTooltip content={tooltip} />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground font-mono">{value}</div>
        <p className={`text-[10px] mt-1 font-mono ${subtextClassName}`}>{subtext}</p>
      </CardContent>
    </Card>
  );
}

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

function SidebarButton({ icon, label, active, onClick, collapsed }: SidebarButtonProps) {
  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={onClick}
              className={cn(
                "w-8 h-8 p-0 justify-center transition-all",
                active ? "bg-primary/10 text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#0d1117] border-slate-800 text-slate-300 text-[12px] z-[100]">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full justify-start font-medium transition-all",
        active ? "text-primary-foreground bg-primary/10 border-l-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {icon}
      {label}
    </Button>
  );
}
