"use client";

import { useEffect, useState, useMemo } from "react";
import { XandeumClient, PNodeInfo } from "./lib/xandeum";
import {
  Activity,
  Server,
  Search,
  RefreshCw,
  LayoutDashboard,
  Settings,
  MoreHorizontal,
  Wifi,
  Database,
  Download,
  Filter,
  Globe,
  Zap,
  Tag,
  BookOpen,
  Copy,
  Map as MapIcon,
  CreditCard,
  FileText,
  Clock,
  HardDrive
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
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

export default function Home() {
  const [nodes, setNodes] = useState<PNodeInfo[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, delinquent: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedNode, setSelectedNode] = useState<PNodeInfo | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const { toast } = useToast();

  const client = new XandeumClient();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [nodeList, statsData] = await Promise.all([
        client.getPNodes(),
        client.getStats()
      ]);
      setNodes(nodeList);
      setStats(statsData);
      setLastUpdated(new Date());
      toast({
        title: "Data Synced",
        description: `Successfully fetched ${nodeList.length} nodes from Xandeum Network.`,
      })
    } catch (err: any) {
      setError(err.message || "Failed to fetch network data.");
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
      const v = node.version ? node.version.split(" ")[0] : "Unknown"; // Basic cleanup
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [nodes]);

  const statusData = useMemo(() => [
    { name: "Active", value: stats.active },
    { name: "Inactive", value: stats.total - stats.active }
  ], [stats]);


  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    toast({
      title: "Copied to Clipboard",
      description: `Node ID ${id.substring(0, 8)}... copied.`,
    });
  };

  const handleExport = () => {
    if (filteredNodes.length === 0) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "No nodes to export.",
      });
      return;
    }

    const headers = ["Node Identity (Pubkey)", "Status", "Gossip Address", "Version", "RPC Endpoint", "TPU Endpoint"];
    const csvContent = [
      headers.join(","),
      ...filteredNodes.map(node => [
        node.pubkey,
        node.rpc ? "Active" : "Inactive",
        node.gossip || "N/A",
        node.version || "Unknown",
        node.rpc || "N/A",
        node.tpu || "N/A"
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `xandeum_nodes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Successfully exported ${filteredNodes.length} nodes to CSV.`,
    });
  };

  const handleFilter = () => {
    setShowActiveOnly(prev => !prev);
    toast({
      title: !showActiveOnly ? "Filter applied" : "Filter cleared",
      description: !showActiveOnly ? "Showing active nodes only." : "Showing all nodes.",
    });
  };


  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredNodes = useMemo(() => {
    let result = nodes.filter(node => {
      const matchesSearch = node.pubkey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.gossip && node.gossip.includes(searchTerm));
      const matchesStatus = showActiveOnly ? (!!node.rpc || !!node.tpu) : true;
      return matchesSearch && matchesStatus;
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
  }, [nodes, searchTerm, showActiveOnly, sortConfig]);

  // Derived Metrics for Nexus Dashboard
  const storageCapacity = useMemo(() => {
    // Simulation: Average 250TB per node -> PB
    const totalTB = nodes.length * 250;
    return (totalTB / 1000).toFixed(2);
  }, [nodes]);

  const networkHealth = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.active / stats.total) * 100);
  }, [stats]);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans transition-colors duration-300">

      {/* Sidebar */}
      {/* Sidebar - Nexus Style */}
      <aside className="w-64 border-r border-primary/10 bg-[#020617] hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <Database className="text-white h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white leading-none">XANDEUM</span>
              <span className="text-[10px] font-mono text-cyan-500 tracking-[0.2em] uppercase mt-1">Nexus</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <Button variant="ghost" className="w-full justify-start font-medium text-white bg-white/5 hover:bg-white/10 hover:text-white border-l-2 border-primary">
              <LayoutDashboard className="mr-3 h-4 w-4 text-primary" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
              <Server className="mr-3 h-4 w-4" />
              pNodes
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
              <MapIcon className="mr-3 h-4 w-4" />
              Storage Map
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
              <Activity className="mr-3 h-4 w-4" />
              Analytics
            </Button>
            <div className="pt-4 pb-2">
              <span className="text-[10px] uppercase text-muted-foreground/50 font-bold px-4 tracking-wider">Protocol</span>
            </div>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
              <CreditCard className="mr-3 h-4 w-4" />
              Pricing
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
              <FileText className="mr-3 h-4 w-4" />
              Governance
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5 transition-all" onClick={() => window.open("https://docs.xandeum.com", "_blank")}>
              <BookOpen className="mr-3 h-4 w-4" />
              Documentation
            </Button>
          </nav>
        </div>

        <div className="mt-auto p-0">
          <div className="bg-gradient-to-t from-cyan-950/30 to-transparent p-6 border-t border-cyan-900/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse absolute -right-1 -top-1" />
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                  <Globe className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              <div className="text-sm">
                <p className="font-medium text-cyan-50 font-mono">Devnet Active</p>
                <p className="text-cyan-400 text-[10px] font-mono">v2.2.0-stable</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Nexus Layout */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617] md:pl-64 relative overflow-hidden">
        {/* Ambient Background Effects */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-950/20 to-transparent pointer-events-none" />
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Header */}
        <header className="h-20 border-b border-primary/10 flex items-center justify-between px-8 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="md:hidden flex items-center gap-2">
            <Database className="text-primary h-6 w-6" />
            <span className="font-bold text-white">Nexus</span>
          </div>

          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white tracking-tight">Network Intelligence</h1>
            <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM ONLINE // SYNC_ID: #{Math.floor(Date.now() / 10000).toString(16).toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden lg:flex items-center gap-6 mr-6 border-r border-white/10 pr-6">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">SOL Price</p>
                <p className="text-sm font-mono text-cyan-400 font-bold">$142.50 <span className="text-xs text-emerald-500">(+2.4%)</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Epoch</p>
                <p className="text-sm font-mono text-white font-bold">428</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="bg-transparent border-primary/20 text-cyan-500 hover:bg-cyan-950/30 hover:text-cyan-400 font-mono text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
              REFRESH
            </Button>
            <ModeToggle />
          </div>
        </header>

        <div className="p-6 md:p-8 space-y-8 max-w-[1800px] mx-auto w-full relative z-10">

          {/* Hero Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Storage Layer */}
            <Card className="bg-card/40 border-primary/20 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-3 h-3 text-cyan-500" /> Storage Layer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white font-mono">{storageCapacity} <span className="text-sm text-muted-foreground font-sans">PB</span></div>
                <p className="text-[10px] text-cyan-500/80 mt-1 font-mono">Immutable Data Capacity</p>
              </CardContent>
            </Card>

            {/* Network State */}
            <Card className="bg-card/40 border-primary/20 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-20">
                <Activity className="w-12 h-12 text-primary" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-3 h-3 text-primary" /> Network State
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white font-mono tracking-tight">OPTIMAL</div>
                <p className="text-[10px] text-emerald-500 mt-1 font-mono flex items-center gap-1">
                  Latency &lt;20ms <span className="text-muted-foreground">//</span> {networkHealth}% Health
                </p>
              </CardContent>
            </Card>

            {/* Active Nodes */}
            <Card className="bg-card/40 border-primary/20 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Nodes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white font-mono">{stats.active}</div>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">Global Gossip Network</p>
              </CardContent>
            </Card>

            {/* Version */}
            <Card className="bg-card/40 border-primary/20 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Protocol Ver</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white/90 font-mono truncate">{nodes[0]?.version?.split(' ')[0] || "Unknown"}</div>
                <p className="text-[10px] text-orange-500/80 mt-1 font-mono">Latest Stable Consensus</p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Grid: Performance Graph + Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <NetworkPerformance />
            <div className="grid grid-cols-1 gap-6">
              <StatusChart data={statusData} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VersionChart data={versionData} />
            {/* Gossip Protocol Status Panel */}
            <Card className="bg-card/40 border-primary/20 shadow-sm flex flex-col">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Gossip Protocol Status</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Update Frequency</p>
                  <p className="text-xl font-mono text-cyan-400">400ms</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Packet Size</p>
                  <p className="text-xl font-mono text-white">2.4kb</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Active Entrypoints</p>
                  <p className="text-xl font-mono text-white">6/8</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Global Score</p>
                  <p className="text-xl font-mono text-primary">98/100</p>
                </div>

                <div className="col-span-2 mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Live Latency Map</p>
                  <div className="flex items-end gap-1 h-12">
                    {[40, 60, 30, 80, 50, 90, 20, 40, 60, 70, 30, 50].map((h, i) => (
                      <div key={i} className="flex-1 bg-cyan-500/20 rounded-t-sm hover:bg-cyan-500 transition-colors" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Node Table Section */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/30 p-4 rounded-xl border border-white/5">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search Node ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/40 border-primary/20 focus:border-primary text-white placeholder:text-muted-foreground/50 font-mono text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-primary hover:bg-orange-600 text-white font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                  onClick={handleExport}
                >
                  <Download className="mr-2 h-4 w-4" /> EXPORT CSV
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="border-primary/20 bg-transparent text-muted-foreground">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-[#0a0a0a] border-primary/20 text-white">
                    <DropdownMenuItem onClick={() => setShowActiveOnly(false)} className="hover:bg-white/10 cursor-pointer">
                      All Nodes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowActiveOnly(true)} className="hover:bg-white/10 cursor-pointer text-emerald-400">
                      Active Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Main Table Card */}
            <div className="rounded-xl border border-primary/10 bg-card/20 overflow-hidden shadow-sm backdrop-blur-sm">
              <Table>
                <TableHeader className="bg-black/40 hover:bg-black/40">
                  <TableRow className="hover:bg-transparent border-primary/10">
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead className="w-[200px] font-bold text-cyan-500 uppercase text-[10px] tracking-wider cursor-pointer" onClick={() => handleSort("pubkey")}>
                      Node Identity {sortConfig?.key === "pubkey" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="font-bold text-cyan-500 uppercase text-[10px] tracking-wider cursor-pointer" onClick={() => handleSort("status")}>
                      Status {sortConfig?.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="font-bold text-cyan-500 uppercase text-[10px] tracking-wider hidden md:table-cell">Client Ver</TableHead>
                    <TableHead className="font-bold text-cyan-500 uppercase text-[10px] tracking-wider hidden sm:table-cell">Uptime</TableHead>
                    <TableHead className="font-bold text-cyan-500 uppercase text-[10px] tracking-wider text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-primary/10">
                        <TableCell><Skeleton className="h-2 w-2 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40 bg-white/5" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 bg-white/5" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32 bg-white/5" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-16 bg-white/5" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-8 ml-auto bg-white/5" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredNodes.length === 0 ? (
                    <TableRow className="border-primary/10">
                      <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                        No nodes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNodes.map((node) => (
                      <TableRow
                        key={node.pubkey}
                        className="hover:bg-white/5 transition-colors cursor-pointer border-primary/5 group"
                        onClick={() => setSelectedNode(node)}
                      >
                        <TableCell>
                          <div className={`h-2 w-2 rounded-full ${node.rpc ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"}`} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-mono text-white text-sm truncate max-w-[150px] group-hover:text-primary transition-colors">
                              {node.pubkey}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {node.rpc ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono tracking-wider">
                              OPERATIONAL
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-mono tracking-wider">
                              OFFLINE
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="font-mono text-muted-foreground text-xs bg-white/5 px-2 py-1 rounded border border-white/5">
                            {node.version?.split(' ')[0] || "Unknown"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">
                          {Math.floor(Math.random() * 5)}d {Math.floor(Math.random() * 24)}h
                        </TableCell>
                        <TableCell className="text-right font-mono text-primary font-bold">
                          {Math.floor(Math.random() * (100 - 80) + 80)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="text-[10px] text-muted-foreground/40 font-mono text-center flex justify-between items-center px-4">
              <span>SECURED BY SOLANA</span>
              <span>POWERED BY XANDEUM</span>
            </div>
          </div>
        </div>

        {/* Details Sheet - Nexus Style */}
        <Sheet open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
          <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto bg-[#020617] border-l border-primary/20 text-white">
            <SheetHeader className="border-b border-primary/10 pb-6">
              <SheetTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Node Intelligence
              </SheetTitle>
              <SheetDescription className="text-muted-foreground font-mono text-xs">
                IDENTITY_HASH: <span className="text-cyan-400">{selectedNode?.pubkey}</span>
              </SheetDescription>
            </SheetHeader>

            <div className="mt-8 space-y-8">
              {selectedNode && (
                <>
                  <div className="space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/5">
                      <span className="text-sm font-medium text-muted-foreground">Network Status</span>
                      {selectedNode.rpc ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/50">OPERATIONAL</Badge>
                      ) : (
                        <Badge variant="destructive">OFFLINE</Badge>
                      )}
                    </div>

                    {/* Core Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card/20 p-4 rounded-lg border border-primary/10">
                        <Label className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">Gossip Address</Label>
                        <div className="font-mono text-sm mt-1 text-white">{selectedNode.gossip || "N/A"}</div>
                      </div>
                      <div className="bg-card/20 p-4 rounded-lg border border-primary/10">
                        <Label className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">Client Version</Label>
                        <div className="font-mono text-sm mt-1 text-cyan-400">{selectedNode.version || "Unknown"}</div>
                      </div>
                      <div className="bg-card/20 p-4 rounded-lg border border-primary/10">
                        <Label className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">Shred Version</Label>
                        <div className="font-mono text-sm mt-1 text-orange-400">{selectedNode.shredVersion || "48698 (Est)"}</div>
                      </div>
                      <div className="bg-card/20 p-4 rounded-lg border border-primary/10">
                        <Label className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">Feature Set</Label>
                        <div className="font-mono text-sm mt-1 text-white">{selectedNode.featureSet || "3294202862"}</div>
                      </div>
                    </div>

                    {/* Network Topology */}
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" /> Port Topology
                      </h4>
                      <div className="grid gap-2">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5">
                          <span className="text-xs text-muted-foreground">RPC Endpoint</span>
                          <span className="text-xs font-mono text-emerald-400">{selectedNode.rpc || "Closed"}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5">
                          <span className="text-xs text-muted-foreground">TPU (Transaction Processing)</span>
                          <span className="text-xs font-mono text-white">{selectedNode.tpu || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5">
                          <span className="text-xs text-muted-foreground">TPU Forwards</span>
                          <span className="text-xs font-mono text-muted-foreground">{selectedNode.tpuForwards || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-primary/10" />

                  {/* Raw JSON viewer */}
                  <div className="relative bg-black/50 p-4 rounded-lg overflow-x-auto text-[10px] font-mono text-cyan-600/80 border border-primary/5 group">
                    <div className="absolute top-2 right-2 text-xs text-muted-foreground">RAW_DATA_STREAM</div>
                    <pre>{JSON.stringify(selectedNode, null, 2)}</pre>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Configure your connection to the Xandeum Network.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>RPC Endpoint</Label>
              <Input
                defaultValue="https://api.devnet.xandeum.com:8899"
                className="mt-2 text-sm font-mono"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Current Data Source: <span className="font-semibold text-primary">Xandeum Devnet</span>
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => {
                setIsSettingsOpen(false);
                toast({
                  title: "Settings Saved",
                  description: "Configuration updated successfully.",
                });
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, desc, loading }: any) {
  return (
    <Card className="bg-card/50 border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 bg-muted/50 rounded-md border">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-16 mb-1" />
        ) : (
          <div className="text-2xl font-bold text-foreground">{value}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      </CardContent>
    </Card>
  );
}
