"use client";

import { useEffect, useState } from "react";
import { XandeumClient, PNodeInfo } from "./lib/xandeum";
import {
  Users,
  Activity,
  Server,
  Search,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  LayoutDashboard,
  Settings,
  MoreHorizontal,
  Wifi,
  WifiOff,
  Database,
  Copy,
  Download,
  Filter
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [nodes, setNodes] = useState<PNodeInfo[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, delinquent: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
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

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "Copied to Clipboard",
      description: `Node ID ${id.substring(0, 8)}... copied.`,
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Dowloading node_list.csv...",
    });
    // Mock export logic for demo
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "The CSV file has been saved.",
      });
    }, 1000);
  };

  const handleFilter = () => {
    toast({
      title: "Filters",
      description: "Advanced filtering modal would open here. (Demo)",
    });
  };


  const filteredNodes = nodes.filter(node =>
    node.pubkey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (node.gossip && node.gossip.includes(searchTerm))
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans transition-colors duration-300">

      {/* Sidebar */}
      <aside className="w-64 border-r bg-card/50 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Database className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Xandeum</span>
          </div>

          <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start font-medium">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src="/avatar-placeholder.png" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">Admin User</p>
              <p className="text-muted-foreground text-xs">View Profile</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background/50">

        {/* Top Navigation / Mobile Header */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-10 transition-colors duration-300">
          <div className="md:hidden flex items-center gap-2">
            <Database className="text-primary h-6 w-6" />
            <span className="font-bold">Xandeum</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-xs text-muted-foreground font-mono hidden sm:inline-block" suppressHydrationWarning>
              Last Synced: {lastUpdated.toLocaleTimeString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <ModeToggle />
          </div>
        </header>

        <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">

          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Network Overview</h2>
            <p className="text-muted-foreground">Monitor the health and status of storage provider nodes (pNodes).</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Nodes"
              value={stats.total}
              icon={<Server className="h-5 w-5 text-primary" />}
              desc="Devices in network"
              loading={loading}
            />
            <StatCard
              title="Active Nodes"
              value={stats.active}
              icon={<Activity className="h-5 w-5 text-secondary" />}
              desc="Online & Responsive"
              loading={loading}
            />
            <StatCard
              title="Software Version"
              value={nodes[0]?.version || "Unknown"}
              icon={<ShieldCheck className="h-5 w-5 text-primary" />}
              desc="Latest stable release"
              loading={loading}
            />
          </div>

          {/* Node Table Section */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-muted-foreground" onClick={handleFilter}>
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
                <Button variant="outline" size="sm" className="text-muted-foreground" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </div>
            </div>

            {/* Main Table Card */}
            <div className="rounded-xl border bg-card/50 overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[200px] font-medium">Node Identity</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium hidden md:table-cell">Network Address</TableHead>
                    <TableHead className="font-medium hidden sm:table-cell">Version</TableHead>
                    <TableHead className="text-right font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredNodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                        No nodes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNodes.map((node) => (
                      <TableRow key={node.pubkey} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border bg-primary/10 text-primary">
                              <AvatarFallback className="text-xs font-mono bg-transparent">
                                {node.pubkey.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground text-sm truncate max-w-[120px] sm:max-w-[180px]" title={node.pubkey}>
                                {node.pubkey}
                              </span>
                              <span className="text-xs text-muted-foreground">ID</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {node.rpc ? (
                              <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/20 shadow-none">
                                <Wifi className="w-3 h-3 mr-1" /> Online
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-muted-foreground">
                                <WifiOff className="w-3 h-3 mr-1" /> Offline
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono hidden md:table-cell">
                          {node.gossip || "N/A"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground border">
                            {node.version || "Unknown"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCopyId(node.pubkey)}>
                                <Copy className="mr-2 h-4 w-4" /> Copy ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {!loading && (
              <div className="text-xs text-muted-foreground text-center py-4">
                Showing {filteredNodes.length} of {nodes.length} storage nodes
              </div>
            )}
          </div>
        </div>
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
