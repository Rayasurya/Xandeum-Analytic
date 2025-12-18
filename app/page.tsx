"use client";

import { useEffect, useState, useMemo } from "react";
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
  Wifi, // Added Wifi icon
  Copy, // Added Copy icon
  Check // Added Check icon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { CountryChart } from "@/components/charts/CountryDistribution";
import { GlobalMap } from "@/components/charts/GlobalMap";

type ViewState = "dashboard" | "pnodes" | "analytics" | "map";

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

      // 2. Batch Request
      const response = await fetch("http://ip-api.com/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    fetchData();
  }, []);

  // Compute Chart Data
  const versionData = useMemo(() => {
    const counts = nodes.reduce((acc, node) => {
      const v = XandeumClient.formatVersion(node.version);
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
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
      const matchesSearch = node.pubkey.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  // ... handleExport ...
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

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans transition-colors duration-300">

      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Database className="text-primary h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-foreground leading-none">XANDEUM</span>
              <span className="text-[10px] font-mono text-cyan-500 tracking-[0.2em] uppercase mt-1">Nexus</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <SidebarButton
              icon={<LayoutDashboard className="mr-3 h-4 w-4" />}
              label="Dashboard"
              active={activeView === "dashboard"}
              onClick={() => setActiveView("dashboard")}
            />
            <SidebarButton
              icon={<Server className="mr-3 h-4 w-4" />}
              label="pNodes"
              active={activeView === "pnodes"}
              onClick={() => setActiveView("pnodes")}
            />
            <SidebarButton
              icon={<MapIcon className="mr-3 h-4 w-4" />}
              label="Storage Map"
              active={activeView === "map"}
              onClick={() => setActiveView("map")}
            />
            <SidebarButton
              icon={<Activity className="mr-3 h-4 w-4" />}
              label="Analytics"
              active={activeView === "analytics"}
              onClick={() => setActiveView("analytics")}
            />


          </nav>
        </div>

        <div className="mt-auto p-0">
          <div className="bg-gradient-to-t from-cyan-950/10 to-transparent p-6 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`h-2 w-2 rounded-full absolute -right-1 -top-1 ${stats.active > 0 ? "bg-cyan-500 animate-pulse" : "bg-red-500"}`} />
                <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/30">
                  <Globe className="h-4 w-4 text-secondary" />
                </div>
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground font-mono">{XANDEUM_CONFIG.NETWORK} {stats.active > 0 ? "Active" : "Offline"}</p>
                <p className="text-secondary text-[10px] font-mono whitespace-nowrap">{XANDEUM_CONFIG.PROTOCOL_VERSION} ({XANDEUM_CONFIG.PROTOCOL_NAME})</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background md:pl-64 relative overflow-hidden">
        {/* Background */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="h-20 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {activeView === "dashboard" && "Network Intelligence"}
              {activeView === "pnodes" && "Node Registry"}
              {activeView === "analytics" && "Global Analytics"}
              {activeView === "map" && "Geographic Distribution"}
            </h1>
            <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${metrics?.epoch ? "bg-emerald-500 animate-pulse" : "bg-yellow-500"}`} />
              SYSTEM ONLINE // SYNC_ID: #{Math.floor(Date.now() / 10000).toString(16).toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden lg:flex items-center gap-6 mr-6 border-r border-border pr-6">
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

        <div className="p-6 md:p-8 space-y-8 max-w-[1800px] mx-auto w-full relative z-10">

          {/* VIEW: DASHBOARD */}
          {activeView === "dashboard" && (
            <>
              {/* Hero Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DashboardCard
                  icon={<Server className="w-3 h-3 text-secondary" />}
                  title="Total Nodes"
                  value={stats.total}
                  subtext="Global Network"
                  subtextClassName="text-secondary/80"
                />
                <DashboardCard
                  icon={<Zap className="w-3 h-3 text-primary" />}
                  title="Online Nodes"
                  value={stats.active}
                  subtext="RPC/TPU Responding"
                  subtextClassName="text-emerald-500"
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

              {/* Main Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <NetworkPerformance data={metrics?.tpsHistory || []} />
                <div className="grid grid-cols-1 gap-6">
                  <StatusChart data={statusData} />
                </div>
              </div>

              {/* Quick Geo Insight */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CountryChart data={countryData} />
              </div>
            </>
          )}

          {/* VIEW: NODES */}
          {activeView === "pnodes" && (
            <div className="space-y-4">
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
                      <Button variant="outline" className="border-border bg-card text-muted-foreground hover:text-foreground">
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

              <div className="rounded-xl border border-border bg-card/50 overflow-hidden shadow-sm backdrop-blur-sm">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead className="w-[200px] font-bold text-secondary cursor-pointer" onClick={() => handleSort("pubkey")}>
                        Node Identity {sortConfig?.key === "pubkey" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="font-bold text-secondary">Country</TableHead>
                      <TableHead className="font-bold text-secondary cursor-pointer" onClick={() => handleSort("status")}>
                        Status {sortConfig?.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="font-bold text-secondary hidden md:table-cell">Client Ver</TableHead>
                      <TableHead className="font-bold text-secondary hidden sm:table-cell">Gossip Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNodes.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center">No nodes found...</TableCell></TableRow>
                    ) : (
                      filteredNodes.map((node) => {
                        const ip = node.gossip?.split(':')[0] || "";
                        const geo = geoCache[ip];
                        return (
                          <TableRow key={node.pubkey} className="hover:bg-muted/50 cursor-pointer border-border" onClick={() => handleNodeClick(node)}>
                            <TableCell><div className={`h-2 w-2 rounded-full ${node.rpc ? "bg-emerald-500" : "bg-red-500"}`} /></TableCell>
                            <TableCell><span className="font-mono text-foreground text-sm truncate max-w-[150px]">{node.pubkey}</span></TableCell>
                            <TableCell className="font-mono text-xs text-foreground">
                              {geo ? (
                                <span className="flex items-center gap-1">
                                  {geo.countryCode}
                                </span>
                              ) : <span className="text-muted-foreground/50 animate-pulse">...</span>}
                            </TableCell>
                            <TableCell>{node.rpc ? <Badge className="bg-emerald-500/20 text-emerald-400">OPERATIONAL</Badge> : <Badge variant="destructive">OFFLINE</Badge>}</TableCell>
                            <TableCell className="hidden md:table-cell"><span className="font-mono text-muted-foreground text-xs">{XandeumClient.formatVersion(node.version)}</span></TableCell>
                            <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">{node.gossip}</TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* VIEW: ANALYTICS */}
          {activeView === "analytics" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/40 border-border p-4"><VersionChart data={versionData} /></Card>
              <Card className="bg-card/40 border-border p-4 col-span-1"><StatusChart data={statusData} /></Card>

              {/* New Country Distribution Panel */}
              <div className="col-span-1 md:col-span-2">
                <CountryChart data={countryData} />
              </div>

              <div className="col-span-1 md:col-span-2">
                <NetworkPerformance data={metrics?.tpsHistory || []} />
              </div>
            </div>
          )}

          {/* VIEW: MAP */}
          {activeView === "map" && (
            <div className="flex flex-col h-[750px] w-full">
              <GlobalMap data={countryData} />
            </div>
          )}



        </div>

        {/* Node Details Sheet (Global) */}
        <Sheet open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
          <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto bg-background border-l border-border text-foreground">
            <SheetHeader className="border-b border-border pb-6">
              <SheetTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Node Intelligence
              </SheetTitle>
              <SheetDescription className="text-muted-foreground font-mono text-xs">
                IDENTITY_HASH:{" "}
                <span className="text-secondary">{selectedNode?.pubkey}</span>
              </SheetDescription>
            </SheetHeader>

            {(() => {
              const ip = selectedNode?.gossip?.split(':')[0] || "";
              const geoData = geoCache[ip];

              return (
                <div className="mt-8 space-y-6">
                  {/* Status & Version */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
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
                    <div className="space-y-1 text-right">
                      <Label className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                        <Server className="inline w-3 h-3 mr-1" /> Version
                      </Label>
                      <div className="font-mono text-sm text-foreground">
                        {XandeumClient.formatVersion(selectedNode?.version || "Unknown")}
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  {/* Addresses */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                        Gossip Address
                      </Label>
                      <div className="font-mono text-sm bg-muted p-2 rounded border border-border mt-1 flex justify-between items-center text-foreground">
                        {selectedNode?.gossip || "N/A"}
                        <Copy
                          className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground"
                          onClick={() =>
                            navigator.clipboard.writeText(selectedNode?.gossip || "")
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                        RPC Endpoint
                      </Label>
                      <div className="font-mono text-sm bg-muted p-2 rounded border border-border mt-1 flex justify-between items-center text-foreground">
                        {selectedNode?.rpc || "N/A"}
                        <Copy
                          className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground"
                          onClick={() =>
                            navigator.clipboard.writeText(selectedNode?.rpc || "")
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  {/* Geolocation Section - Enriched */}
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" /> Geolocation
                    </h4>
                    {!geoData && isGeoSyncing ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full bg-muted" />
                        <Skeleton className="h-4 w-3/4 bg-muted" />
                      </div>
                    ) : geoData ? (
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm">
                        <div className="overflow-hidden">
                          <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1 tracking-wider">
                            Country
                          </p>
                          <p className="font-medium text-foreground flex items-center gap-2 truncate">
                            <span className="text-xl">
                              {geoData.countryCode
                                ? geoData.countryCode.toUpperCase().replace(/./g, (char: string) => String.fromCodePoint(char.charCodeAt(0) + 127397))
                                : "🌐"}
                            </span>
                            <span className="truncate" title={geoData.country}>{geoData.country}</span>
                          </p>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1 tracking-wider">
                            City
                          </p>
                          <p className="font-medium text-foreground truncate" title={geoData.city}>{geoData.city}</p>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1 tracking-wider">
                            Region
                          </p>
                          <p className="font-medium text-foreground truncate" title={geoData.regionName}>
                            {geoData.regionName}
                          </p>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1 tracking-wider">
                            Timezone
                          </p>
                          <p className="font-medium text-foreground truncate" title={geoData.timezone}>
                            {geoData.timezone}
                          </p>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1 tracking-wider">
                            ASN
                          </p>
                          <p className="font-mono text-foreground text-xs truncate" title={geoData.as}>
                            {geoData.as}
                          </p>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1 tracking-wider">
                            Organization
                          </p>
                          <p className="font-medium text-foreground truncate" title={geoData.org}>{geoData.org}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-xs">No Geo Data</div>
                    )}
                  </div>

                  <Button
                    onClick={handleExportHtml}
                    className="w-full bg-primary hover:bg-orange-600 text-primary-foreground font-bold h-12 mt-6"
                  >
                    <Download className="mr-2 h-4 w-4" /> Export as HTML
                  </Button>

                  {/* Raw Data Toggle */}
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto text-[10px] font-mono text-secondary/80 border border-border group mt-8 relative">
                    <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                      RAW_JSON_STREAM
                    </div>
                    <pre>{JSON.stringify(selectedNode, null, 2)}</pre>
                  </div>
                </div>
              )
            })()}
          </SheetContent>
        </Sheet>

        <Toaster />
      </main>
    </div>
  );
}

// Subcomponents
function DashboardCard({ icon, title, value, subtext, subtextClassName }: any) {
  return (
    <Card className="bg-card/40 border-border shadow-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground font-mono">{value}</div>
        <p className={`text-[10px] mt-1 font-mono ${subtextClassName}`}>{subtext}</p>
      </CardContent>
    </Card>
  );
}

function SidebarButton({ icon, label, active, onClick }: any) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`w-full justify-start font-medium transition-all ${active ? "text-primary-foreground bg-primary/10 border-l-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
    >
      {icon}
      {label}
    </Button>
  );
}
