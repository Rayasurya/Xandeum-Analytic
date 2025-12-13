"use client";

import { useEffect, useState, useMemo } from "react";
import { XandeumClient, PNodeInfo } from "./lib/xandeum";
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
  FileText
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

type ViewState = "dashboard" | "pnodes" | "analytics" | "map";

export default function Home() {
  // Navigation State
  const [activeView, setActiveView] = useState<ViewState>("dashboard");

  // Data State
  const [nodes, setNodes] = useState<PNodeInfo[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, delinquent: 0 });
  const [metrics, setMetrics] = useState<any>(null);

  // UI State
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState<PNodeInfo | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const { toast } = useToast();
  const client = new XandeumClient();

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
      const v = node.version ? node.version.split(" ")[0] : "Unknown";
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [nodes]);

  const statusData = useMemo(() => [
    { name: "Active", value: stats.active },
    { name: "Inactive", value: stats.total - stats.active }
  ], [stats]);

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

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    if (filteredNodes.length === 0) return;
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
    link.setAttribute("download", `xandeum_nodes.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans transition-colors duration-300">

      {/* Sidebar */}
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

            <div className="pt-4 pb-2">
              <span className="text-[10px] uppercase text-muted-foreground/50 font-bold px-4 tracking-wider">Protocol</span>
            </div>
            <SidebarButton icon={<CreditCard className="mr-3 h-4 w-4" />} label="Pricing" />
            <SidebarButton icon={<FileText className="mr-3 h-4 w-4" />} label="Governance" />
            <SidebarButton icon={<BookOpen className="mr-3 h-4 w-4" />} label="Documentation" onClick={() => window.open("https://docs.xandeum.com", "_blank")} />
          </nav>
        </div>

        <div className="mt-auto p-0">
          <div className="bg-gradient-to-t from-cyan-950/30 to-transparent p-6 border-t border-cyan-900/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`h-2 w-2 rounded-full absolute -right-1 -top-1 ${stats.active > 0 ? "bg-cyan-500 animate-pulse" : "bg-red-500"}`} />
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                  <Globe className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              <div className="text-sm">
                <p className="font-medium text-cyan-50 font-mono">Devnet {stats.active > 0 ? "Active" : "Offline"}</p>
                <p className="text-cyan-400 text-[10px] font-mono">v2.2.0-stable</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617] md:pl-64 relative overflow-hidden">
        {/* Background */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-950/20 to-transparent pointer-events-none" />
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="h-20 border-b border-primary/10 flex items-center justify-between px-8 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {activeView === "dashboard" && "Network Intelligence"}
              {activeView === "pnodes" && "Node Registry"}
              {activeView === "analytics" && "Deep Analytics"}
              {activeView === "map" && "Geographic Distribution"}
            </h1>
            <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${metrics?.epoch ? "bg-emerald-500 animate-pulse" : "bg-yellow-500"}`} />
              SYSTEM ONLINE // SYNC_ID: #{Math.floor(Date.now() / 10000).toString(16).toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden lg:flex items-center gap-6 mr-6 border-r border-white/10 pr-6">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Total Supply</p>
                <p className="text-sm font-mono text-cyan-400 font-bold">{metrics?.totalSupply || "Loading..."}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Epoch</p>
                <p className="text-sm font-mono text-white font-bold">{metrics?.epoch || "Syncing"}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <DashboardCard
                  icon={<Database className="w-3 h-3 text-cyan-500" />}
                  title="Storage Layer"
                  value={metrics?.totalSupply ? metrics.totalSupply.split(" ")[0] : "---"}
                  subtext="Total Supply (SOL)"
                  subtextClassName="text-cyan-500/80"
                />
                <DashboardCard
                  icon={<Zap className="w-3 h-3 text-primary" />}
                  title="Network State"
                  value="OPTIMAL"
                  subtext={`Latency <20ms // ${Math.round((stats.active / (stats.total || 1)) * 100)}% Health`}
                  subtextClassName="text-emerald-500"
                />
                <DashboardCard
                  icon={<Server className="w-3 h-3 text-muted-foreground" />}
                  title="Active Nodes"
                  value={stats.active}
                  subtext="Global Gossip Network"
                  subtextClassName="text-muted-foreground"
                />
                <DashboardCard
                  icon={<Activity className="w-3 h-3 text-muted-foreground" />}
                  title="Protocol Ver"
                  value={nodes[0]?.version?.split(' ')[0] || "Unknown"}
                  subtext="Latest Stable Consensus"
                  subtextClassName="text-orange-500/80"
                />
              </div>

              {/* Main Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <NetworkPerformance data={metrics?.tpsHistory || []} />
                <div className="grid grid-cols-1 gap-6">
                  <StatusChart data={statusData} />
                </div>
              </div>
            </>
          )}

          {/* VIEW: NODES */}
          {activeView === "pnodes" && (
            <div className="space-y-4">
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
                  <Button className="bg-primary hover:bg-orange-600 text-white font-bold" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> EXPORT CSV
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="border-primary/20 bg-transparent text-muted-foreground">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-[#0a0a0a] border-primary/20 text-white">
                      <DropdownMenuItem onClick={() => setShowActiveOnly(false)}>All Nodes</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowActiveOnly(true)} className="text-emerald-400">Active Only</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="rounded-xl border border-primary/10 bg-card/20 overflow-hidden shadow-sm backdrop-blur-sm">
                <Table>
                  <TableHeader className="bg-black/40">
                    <TableRow className="hover:bg-transparent border-primary/10">
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead className="w-[200px] font-bold text-cyan-500 cursor-pointer" onClick={() => handleSort("pubkey")}>
                        Node Identity {sortConfig?.key === "pubkey" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="font-bold text-cyan-500 cursor-pointer" onClick={() => handleSort("status")}>
                        Status {sortConfig?.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="font-bold text-cyan-500 hidden md:table-cell">Client Ver</TableHead>
                      <TableHead className="font-bold text-cyan-500 hidden sm:table-cell">Gossip Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNodes.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="h-24 text-center">No nodes found...</TableCell></TableRow>
                    ) : (
                      filteredNodes.map((node) => (
                        <TableRow key={node.pubkey} className="hover:bg-white/5 cursor-pointer border-primary/5" onClick={() => setSelectedNode(node)}>
                          <TableCell><div className={`h-2 w-2 rounded-full ${node.rpc ? "bg-emerald-500" : "bg-red-500"}`} /></TableCell>
                          <TableCell><span className="font-mono text-white text-sm truncate max-w-[150px]">{node.pubkey}</span></TableCell>
                          <TableCell>{node.rpc ? <Badge className="bg-emerald-500/20 text-emerald-400">OPERATIONAL</Badge> : <Badge variant="destructive">OFFLINE</Badge>}</TableCell>
                          <TableCell className="hidden md:table-cell"><span className="font-mono text-muted-foreground text-xs">{node.version?.split(' ')[0] || "Unknown"}</span></TableCell>
                          <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">{node.gossip}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* VIEW: ANALYTICS */}
          {activeView === "analytics" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/40 border-primary/20 p-4"><VersionChart data={versionData} /></Card>
              <Card className="bg-card/40 border-primary/20 p-4"><StatusChart data={statusData} /></Card>
              <div className="col-span-1 md:col-span-2">
                <NetworkPerformance data={metrics?.tpsHistory || []} />
              </div>
            </div>
          )}

          {/* VIEW: MAP */}
          {activeView === "map" && (
            <div className="flex flex-col items-center justify-center h-[500px] border border-dashed border-primary/30 rounded-xl bg-card/10">
              <MapIcon className="h-16 w-16 text-primary/40 mb-4" />
              <h3 className="text-xl font-bold text-white">Geographic Map Unavailable</h3>
              <p className="text-muted-foreground text-sm max-w-md text-center mt-2">
                Real-time IP geolocation requires an external API key (e.g., MaxMind or IPinfo), which is not currently configured for this Devnet instance.
              </p>
            </div>
          )}

        </div>

        {/* Node Details Sheet (Global) */}
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
            <div className="mt-8 space-y-6">
              <div className="bg-card/20 p-4 rounded-lg border border-primary/10">
                <pre className="text-[10px] text-cyan-500 font-mono whitespace-pre-wrap">{JSON.stringify(selectedNode, null, 2)}</pre>
              </div>
            </div>
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
    <Card className="bg-card/40 border-primary/20 shadow-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white font-mono">{value}</div>
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
      className={`w-full justify-start font-medium transition-all ${active ? "text-white bg-white/10 border-l-2 border-primary" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
    >
      {icon}
      {label}
    </Button>
  );
}
