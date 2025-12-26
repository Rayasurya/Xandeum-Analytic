"use client";

import Image from "next/image";
import { useEffect, useState, useMemo, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XandeumClient, PNodeInfo } from "./lib/xandeum";
import { XANDEUM_CONFIG } from "./config";
import {
  Activity,
  SearchX,
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
  X,
  Trophy,
  Sparkles,
  Star,
  Trash2,
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
  DropdownMenuCheckboxItem,
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
import { AIChatWidget } from "@/components/ui/ai-chat";

import { GlobalMap } from "@/components/charts/GlobalMap";
import { StorageDistribution } from "@/components/charts/StorageDistribution";
import { NodeLeaderboard } from "@/components/charts/NodeLeaderboard";
import dynamic from "next/dynamic";

// Dynamic import for Leaflet (SSR fix)
const LeafletClusterMap = dynamic(
  () => import("@/components/charts/LeafletClusterMap").then(mod => mod.LeafletClusterMap),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> }
);


type ViewState = "dashboard" | "pnodes" | "analytics" | "map" | "watchlist";

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

// Helper: Get the most common (majority) version - this is the "official" version
const getMostCommonVersion = (nodes: any[]): string => {
  const versionCounts: Record<string, number> = {};
  nodes.forEach(node => {
    const version = node.version?.split(' ')[0];
    if (version) {
      versionCounts[version] = (versionCounts[version] || 0) + 1;
    }
  });

  // Find the version with the highest count
  let maxCount = 0;
  let mostCommon = "";
  Object.entries(versionCounts).forEach(([version, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = version;
    }
  });
  return mostCommon;
};

// Health Score Calculation (0-100)
interface HealthScore {
  total: number;
  status: "HEALTHY" | "WARNING" | "CRITICAL";
  breakdown: {
    version: { score: number; max: number };
    uptime: { score: number; max: number };
    storage: { score: number; max: number };
    rpc: { score: number; max: number };
  };
}

const calculateHealthScore = (node: any): HealthScore => {
  let versionScore = 0;
  let uptimeScore = 0;
  let storageScore = 0;
  let rpcScore = 0;

  // Version Score (40 points max) - Latest version = full points
  const currentVersion = node?.version?.split(" ")[0] || "";
  if (currentVersion === "0.8.0") {
    versionScore = 40;
  } else if (currentVersion === "0.7.0") {
    versionScore = 30;
  } else if (currentVersion === "0.6.0") {
    versionScore = 20;
  } else if (currentVersion) {
    versionScore = 10;
  }

  // Uptime Score (30 points max) - Based on uptime duration
  const uptimeSeconds = node?.uptime || 0;
  const uptimeDays = uptimeSeconds / 86400;
  if (uptimeDays >= 30) {
    uptimeScore = 30;
  } else if (uptimeDays >= 14) {
    uptimeScore = 25;
  } else if (uptimeDays >= 7) {
    uptimeScore = 20;
  } else if (uptimeDays >= 1) {
    uptimeScore = 15;
  } else if (uptimeDays >= 0.5) {
    uptimeScore = 10;
  } else if (uptimeSeconds > 0) {
    uptimeScore = 5;
  }

  // Storage Score (20 points max) - Based on committed storage
  const storageGB = (node?.storage_committed || 0) / (1024 * 1024 * 1024);
  if (storageGB >= 1000) {
    storageScore = 20; // 1TB+
  } else if (storageGB >= 500) {
    storageScore = 18;
  } else if (storageGB >= 100) {
    storageScore = 15;
  } else if (storageGB >= 10) {
    storageScore = 10;
  } else if (storageGB > 0) {
    storageScore = 5;
  }

  // RPC Status Score (10 points max) - Online = full points
  if (node?.rpc) {
    rpcScore = 10;
  }

  const total = versionScore + uptimeScore + storageScore + rpcScore;

  let status: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
  if (total < 50) {
    status = "CRITICAL";
  } else if (total < 75) {
    status = "WARNING";
  }

  return {
    total,
    status,
    breakdown: {
      version: { score: versionScore, max: 40 },
      uptime: { score: uptimeScore, max: 30 },
      storage: { score: storageScore, max: 20 },
      rpc: { score: rpcScore, max: 10 },
    },
  };
};

function HomeContent() {
  // URL-based Navigation (enables browser back/forward)
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial view from URL or default to dashboard
  const getViewFromUrl = useCallback((): ViewState => {
    const view = searchParams.get('view');
    if (view === 'pnodes' || view === 'dashboard' || view === 'map' || view === 'analytics' || view === 'watchlist') {
      return view;
    }
    return 'dashboard';
  }, [searchParams]);

  const [activeView, setActiveViewState] = useState<ViewState>(getViewFromUrl());

  // Custom setActiveView that updates URL for browser history
  const setActiveView = useCallback((view: ViewState) => {
    setActiveViewState(view);
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Sync state when URL changes (browser back/forward)
  useEffect(() => {
    const viewFromUrl = getViewFromUrl();
    if (viewFromUrl !== activeView) {
      setActiveViewState(viewFromUrl);
    }
  }, [searchParams, getViewFromUrl]);

  // Data State
  const [nodes, setNodes] = useState<PNodeInfo[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, delinquent: 0 });
  const [metrics, setMetrics] = useState<any>(null);

  // Geo Cache State
  const [geoCache, setGeoCache] = useState<Record<string, any>>({});
  const [isGeoSyncing, setIsGeoSyncing] = useState(false);

  // UI State
  const [loading, setLoading] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [isManualSync, setIsManualSync] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [minLoadTimeElapsed, setMinLoadTimeElapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState<PNodeInfo | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterVersion, setFilterVersion] = useState<string>("all");
  const [filterStorage, setFilterStorage] = useState<string>("all");
  const [filterHealth, setFilterHealth] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [pendingToast, setPendingToast] = useState<{ title: string; description: string; variant?: "default" | "destructive" } | null>(null);

  // Copy Status State
  const [copyStatusLoading, setCopyStatusLoading] = useState(false);
  const [copyStatusError, setCopyStatusError] = useState(false);
  const [copyStatusSuccess, setCopyStatusSuccess] = useState(false);

  // AI Chat State (controlled from header)
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [showAiNudge, setShowAiNudge] = useState(false);

  // Watchlist State
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [newWatchlistNode, setNewWatchlistNode] = useState("");

  const { toast } = useToast();
  const client = new XandeumClient();

  // Load Watchlist from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("xandeum_watchlist");
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse watchlist", e);
      }
    }
  }, []);

  // Save Watchlist to LocalStorage
  useEffect(() => {
    localStorage.setItem("xandeum_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = () => {
    if (!newWatchlistNode) return;
    if (watchlist.includes(newWatchlistNode)) {
      toast({
        title: "Node Already Added",
        description: "This node is already in your watchlist.",
        variant: "destructive"
      });
      return;
    }
    setWatchlist([...watchlist, newWatchlistNode]);
    setNewWatchlistNode("");
    toast({
      title: "Node Added",
      description: "Node added to your watchlist.",
    });
  };

  const removeFromWatchlist = (pubkey: string) => {
    setWatchlist(watchlist.filter(p => p !== pubkey));
    toast({
      title: "Node Removed",
      description: "Node removed from your watchlist.",
    });
  };

  useEffect(() => {
    // Initial nudge after 3 seconds
    const initialTimeout = setTimeout(() => {
      if (!aiChatOpen) setShowAiNudge(true);
      setTimeout(() => setShowAiNudge(false), 8000); // Duration 8s
    }, 3000);

    // Periodic nudge every 60 seconds
    const interval = setInterval(() => {
      if (!aiChatOpen) { // Don't nudge if chat is open
        setShowAiNudge(true);
        setTimeout(() => setShowAiNudge(false), 8000);
      }
    }, 60000); // 60s interval

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [aiChatOpen]);

  // Minimum 5 second loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadTimeElapsed(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Animate out and hide loading screen when both data is loaded AND minimum time has elapsed
  useEffect(() => {
    if (!loading && minLoadTimeElapsed) {
      setIsAnimatingOut(true);
      // Wait for animation to complete before hiding
      const hideTimer = setTimeout(() => {
        setShowLoadingScreen(false);
        setIsManualSync(false); // Reset for next time
      }, 500);
      return () => clearTimeout(hideTimer);
    }
  }, [loading, minLoadTimeElapsed]);

  // Show pending toast after loading screen is hidden
  useEffect(() => {
    if (!showLoadingScreen && pendingToast) {
      toast(pendingToast);
      setPendingToast(null);
    }
  }, [showLoadingScreen, pendingToast, toast]);


  const fetchGeoBatch = async (nodeList: PNodeInfo[]) => {
    if (Object.keys(geoCache).length > 0) return; // Already cached
    setIsGeoSyncing(true);

    try {
      // 1. Extract Unique IPs from Gossip Addresses (e.g. "23.83.67.172:8000" -> "23.83.67.172")
      const uniqueIps = Array.from(new Set(
        nodeList
          .map(n => n.gossip?.split(':')[0])
          .filter(ip => ip && ip !== "127.0.0.1" && !ip.startsWith("0.") && ip !== "localhost")
      )) as string[];

      if (uniqueIps.length === 0) return;

      console.log(`Geo: Fetching location for ${uniqueIps.length} unique IPs`);

      // 2. Split into batches of 45 (ip-api free tier limit per request)
      const BATCH_SIZE = 45;
      const batches: string[][] = [];
      for (let i = 0; i < uniqueIps.length; i += BATCH_SIZE) {
        batches.push(uniqueIps.slice(i, i + BATCH_SIZE));
      }

      const newCache: Record<string, any> = {};

      // 3. Process batches with delay to respect rate limits
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        try {
          const response = await fetch("/api/geo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(batch.map(ip => ({ query: ip })))
          });

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              data.forEach((item: any) => {
                if (item.status === "success") {
                  newCache[item.query] = item;
                }
              });
            }
          } else {
            console.error(`Geo batch ${i + 1} failed:`, response.status);
          }
        } catch (batchErr) {
          console.error(`Geo batch ${i + 1} error:`, batchErr);
        }

        // Wait 1.5 seconds between batches to respect rate limits (45 req/min)
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Update cache progressively so UI shows results as they come in
        setGeoCache(prev => ({ ...prev, ...newCache }));
      }

      console.log(`Geo: Successfully fetched ${Object.keys(newCache).length} locations`);
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

      // Queue toast to show after loading screen hides
      setPendingToast({
        title: "Dashboard Synchronized",
        description: `Connected to latest epoch ${networkMetrics?.epoch || 'Unknown'}`,
      });
    } catch (err: any) {
      setPendingToast({
        variant: "destructive",
        title: "Sync Failed",
        description: err.message || "Could not connect to Xandeum pRPC.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Manual sync function
  const handleManualSync = () => {
    setLoading(true);
    setShowLoadingScreen(true);
    setIsManualSync(true); // Mark as manual sync for blurred overlay
    setIsAnimatingOut(false);
    setMinLoadTimeElapsed(false);
    // Refetch data
    fetchData();
    // Shorter wait for manual sync (2 seconds)
    setTimeout(() => {
      setMinLoadTimeElapsed(true);
    }, 2000);
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

    // Auto-refresh full data every 5 minutes (background sync, no loading screen)
    const autoRefreshInterval = setInterval(async () => {
      try {
        const [nodeList, statsData, networkMetrics] = await Promise.all([
          client.getPNodes(),
          client.getStats(),
          client.getNetworkMetrics()
        ]);

        setNodes(nodeList);
        setStats(statsData);
        setMetrics(networkMetrics);

        // Show subtle toast notification
        toast({
          title: "✓ Data Updated",
          description: `Synced at ${new Date().toLocaleTimeString()}`,
        });
      } catch (err) {
        console.error("Auto-refresh failed", err);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(interval);
      clearInterval(autoRefreshInterval);
    };
  }, []);

  // Deep linking: Sync selected node with URL
  useEffect(() => {
    const nodeId = searchParams.get('node');

    if (nodes.length > 0) {
      if (nodeId) {
        // URL has node: Set selectedNode if needed
        if (!selectedNode || !selectedNode.pubkey.startsWith(nodeId)) {
          const foundNode = nodes.find(n => n.pubkey.startsWith(nodeId));
          if (foundNode) setSelectedNode(foundNode);
        }
      } else {
        // URL has no node: Clear selectedNode if it's set
        if (selectedNode) {
          setSelectedNode(null);
        }
      }
    }
  }, [nodes, searchParams, selectedNode]);

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

  // Map node data for LeafletClusterMap
  const mapNodeData = useMemo(() => {
    return nodes.map(node => {
      const ip = node.gossip?.split(':')[0];
      const geo = ip ? geoCache[ip] : null;
      const health = calculateHealthScore(node);
      return {
        pubkey: node.pubkey,
        lat: geo?.lat || 0,
        lng: geo?.lon || 0,
        healthScore: health.total,
        storageCommitted: node.storage_committed || 0,
        city: geo?.city,
        country: geo?.country,
        isOnline: !!(node.rpc || node.tpu), // Fixed: OR instead of AND
      };
    }).filter(n => n.lat !== 0 && n.lng !== 0); // Only include nodes with valid geo
  }, [nodes, geoCache]);

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
        if (filterVersion === "outdated") {
          // Special filter: show nodes NOT on the most common (official) version
          const latestVersion = getMostCommonVersion(nodes);
          if (nodeVersion === latestVersion) matchesVersion = false;
        } else if (filterVersion === "latest") {
          // Special filter: show nodes on the most common (official) version
          const latestVersion = getMostCommonVersion(nodes);
          if (nodeVersion !== latestVersion) matchesVersion = false;
        } else if (nodeVersion !== filterVersion) {
          matchesVersion = false;
        }
      }

      // 5. Storage Filter
      let matchesStorage = true;
      if (filterStorage !== "all") {
        const gb = (node.storage_committed || 0) / (1024 * 1024 * 1024);
        let bin = "> 10 TB";
        if (gb < 100) bin = "< 100 GB";
        else if (gb < 1000) bin = "100 GB - 1 TB";
        else if (gb < 10000) bin = "1 TB - 10 TB";

        if (bin !== filterStorage) matchesStorage = false;
      }

      // 6. Health Filter
      let matchesHealth = true;
      if (filterHealth !== "all") {
        const health = calculateHealthScore(node);
        if (filterHealth === "healthy" && health.status !== "HEALTHY") matchesHealth = false;
        if (filterHealth === "warning" && health.status !== "WARNING") matchesHealth = false;
        if (filterHealth === "critical" && health.status !== "CRITICAL") matchesHealth = false;
        if (filterHealth === "at_risk" && health.status === "HEALTHY") matchesHealth = false; // at_risk = NOT healthy
      }

      return matchesSearch && matchesStatus && matchesCountry && matchesVersion && matchesStorage && matchesHealth;
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
  }, [nodes, searchTerm, filterStatus, filterCountry, filterVersion, filterStorage, filterHealth, sortConfig, geoCache]);

  // Handle viewing a specific node (load Geo from cache)
  const handleNodeClick = (node: PNodeInfo) => {
    setSelectedNode(node);
    // Switch to pnodes view to show the node intelligence panel
    setActiveView("pnodes");

    // Update URL with node pubkey for deep linking
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', 'pnodes');
    params.set('node', node.pubkey.slice(0, 8)); // Use first 8 chars as identifier
    router.push(`?${params.toString()}`, { scroll: false });

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

  // Clear node from URL when closing details panel
  const handleCloseNodeDetails = () => {
    // Only update URL - let useEffect handle state sync
    const params = new URLSearchParams(searchParams.toString());
    params.delete('node');
    router.push(`?${params.toString()}`, { scroll: false });
  };


  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Drill Down Handler (Interactive Visualization)
  const handleDrillDown = (type: 'country' | 'version' | 'status' | 'node' | 'storage', value: string) => {
    // 1. Reset filters/search to ensure we see what we clicked
    setFilterStatus("all");
    setFilterCountry("all");
    setFilterVersion("all");
    setFilterStorage("all");
    setSearchTerm("");

    // 2. Apply the specific filter
    if (type === 'country') setFilterCountry(value);
    // Handle potential mapping issues or clean up version string if needed
    if (type === 'version') setFilterVersion(value);
    if (type === 'status') {
      if (value.toLowerCase() === 'active') setFilterStatus("active");
      else if (value.toLowerCase() === 'inactive') setFilterStatus("inactive");
    }
    if (type === 'node') setSearchTerm(value);
    if (type === 'storage') setFilterStorage(value);

    // 3. Switch View
    setActiveView("pnodes");

    toast({
      title: "Filter Applied",
      description: `Showing results for: ${value}`,
    });
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

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Xandeum Node Report - ${selectedNode.pubkey}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a; }
    h1 { border-bottom: 2px solid #f97316; padding-bottom: 10px; color: #f97316; }
    .section { margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .label { font-weight: bold; color: #64748b; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .value { font-family: monospace; font-size: 1.1rem; margin-top: 4px; word-break: break-all; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 0.875rem; }
    .healthy { background: #dcfce7; color: #166534; }
    .warning { background: #fef3c7; color: #92400e; }
    .critical { background: #fee2e2; color: #991b1b; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
  </style>
</head>
<body>
  <h1>Xandeum Node Report</h1>
  
  <div class="section">
    <div class="label">Identity (Pubkey)</div>
    <div class="value">${selectedNode.pubkey}</div>
  </div>

  <div class="grid">
    <div class="section">
      <div class="label">Health Score</div>
      <div class="value">
        ${(() => {
        const h = calculateHealthScore(selectedNode);
        const className = h.status === 'HEALTHY' ? 'healthy' : h.status === 'WARNING' ? 'warning' : 'critical';
        return `<span class="status-badge ${className}">${h.total}/100 (${h.status})</span>`;
      })()}
      </div>
    </div>
    <div class="section">
      <div class="label">Status</div>
      <div class="value">${selectedNode.rpc ? 'Online (RPC Active)' : 'Offline'}</div>
    </div>
  </div>

  <div class="section">
    <h2>Metrics</h2>
    <div class="grid">
      <div>
        <div class="label">Storage Committed</div>
        <div class="value">${formatStorage(selectedNode.storage_committed || 0)}</div>
      </div>
      <div>
        <div class="label">Version</div>
        <div class="value">${XandeumClient.formatVersion(selectedNode.version || null)}</div>
      </div>
      <div>
        <div class="label">Uptime</div>
        <div class="value">${((selectedNode.uptime || 0) / 86400).toFixed(1)} days</div>
      </div>
      <div>
        <div class="label">Credits</div>
        <div class="value">${(selectedNode.credits || 0).toLocaleString()}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Network</h2>
    <div class="label">Gossip Address</div>
    <div class="value">${selectedNode.gossip || "N/A"}</div>
    <div style="margin-top: 15px;">
      <div class="label">Location</div>
      <div class="value">${geo ? `${geo.city}, ${geo.country}` : "Unknown"}</div>
    </div>
  </div>

  <p style="text-align: center; color: #64748b; font-size: 0.875rem; margin-top: 40px;">
    Generated by Xandeum Scope on ${new Date().toLocaleString()}
  </p>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `xandeum_node_${selectedNode.pubkey.slice(0, 8)}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Loading Screen Overlay */}
      {showLoadingScreen && (
        <div className={cn(
          "fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-500",
          isManualSync ? "bg-background/80 backdrop-blur-md" : "bg-background",
          isAnimatingOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        )}>
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="h-16 w-16 relative flex items-center justify-center">
              <Image src="/logo.png" alt="Xandeum" width={64} height={64} className="object-contain" />
            </div>
            <div className="flex flex-row items-baseline gap-2">
              <span className="font-bold text-2xl tracking-tight text-foreground">XANDEUM</span>
              <span className="text-sm font-mono text-secondary dark:text-cyan-500 tracking-[0.2em] uppercase">Scope</span>
            </div>
          </div>

          {/* Loader Animation */}
          <div className="xandeum-loader mb-8" style={{ fontSize: '24px' }} />

          {/* Loading Text */}
          <p className="text-muted-foreground text-sm font-mono animate-pulse">
            {isManualSync ? "Refreshing data..." : "Synchronizing network data..."}
          </p>
        </div>
      )}

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
                <div className="h-8 w-8 relative flex items-center justify-center">
                  <Image src="/logo.png" alt="Xandeum" width={32} height={32} className="object-contain" />
                </div>
                <div className="flex flex-row items-baseline gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-foreground leading-none">XANDEUM</span>
                  <span className="text-[10px] font-mono text-secondary dark:text-cyan-500 tracking-[0.2em] uppercase">Scope</span>
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
                  onClick={() => setActiveView("watchlist")}
                  className={cn(
                    "h-9 px-4 text-sm font-medium transition-all relative items-center gap-2 hidden sm:flex",
                    activeView === "watchlist" ? "text-foreground bg-secondary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                  My Nodes
                  <span className="ml-1 bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full border border-primary/20">New</span>
                  {activeView === "watchlist" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-sm" />}
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
                <a
                  href="/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "h-9 px-4 text-sm font-medium transition-all relative inline-flex items-center gap-1.5",
                    "text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  Docs
                </a>
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

              {/* AI Assistant Button */}
              {/* AI Assistant Button */}
              <div className="relative">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          setAiChatOpen(!aiChatOpen);
                          setShowAiNudge(false); // Dismiss nudge on click
                        }}
                        className={cn(
                          "h-9 px-4 rounded-md inline-flex items-center justify-center gap-2",
                          "text-white font-medium text-sm",
                          "bg-gradient-to-r from-orange-500 to-pink-500",
                          "ai-shimmer-btn", // Shimmer overlay
                          "transition-all duration-200 hover:brightness-110 active:scale-95",
                          "shadow-md hover:shadow-lg",
                          aiChatOpen && "ring-2 ring-white/40 ring-offset-1 ring-offset-background"
                        )}
                      >
                        <Sparkles className="h-4 w-4" />
                        <span className="hidden sm:inline">Ask AI</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Xandeum Scope AI Assistant</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Auto Nudge Element */}
                <div
                  className={cn(
                    "absolute top-full left-1/2 -translate-x-1/2 mt-3 w-max max-w-[280px] pl-3 pr-8 py-2 rounded-2xl bg-popover border border-border text-popover-foreground text-xs font-medium shadow-xl transition-all duration-700 ease-in-out z-50 flex items-center gap-2",
                    showAiNudge ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
                  )}
                >
                  {/* Chat Tail */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-popover border-t border-l border-border rotate-45" />
                  <Sparkles className="h-3 w-3 text-orange-500 mr-0.5 flex-shrink-0" />
                  Ask me anything about Xandeum Nodes

                  {/* Dismiss Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAiNudge(false);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Sync Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleManualSync}
                      className="h-9 w-9 text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                    >
                      <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sync Network Data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <ModeToggle />
            </div>
          </header>

          <div className={cn("w-full relative z-10", activeView === "dashboard" ? "px-6 py-6 space-y-6" : "hidden")}>

            {/* VIEW: DASHBOARD */}
            {activeView === "dashboard" && (
              <>
                {/* Top Section - Swapped order: Network Intelligence first, then Hero Metrics */}
                <div className="flex flex-col-reverse gap-6">
                  {/* Hero Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard
                      icon={<Server className="w-3 h-3 text-secondary" />}
                      title="Total Nodes"
                      value={stats.total}
                      subtext="Global Network"
                      subtextClassName="text-secondary/80"
                      tooltip="Count of all unique nodes discovered in the global gossip mesh."
                      loading={loading}
                    />
                    <DashboardCard
                      icon={<Zap className="w-3 h-3 text-primary" />}
                      title="Online Nodes"
                      value={stats.active}
                      subtext="RPC/TPU Responding"
                      subtextClassName="text-emerald-500"
                      tooltip="Nodes currently online and responding to RPC/TPU requests."
                      loading={loading}
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
                      tooltip="Total verified storage capacity committed to the network."
                      loading={loading}
                    />
                    <DashboardCard
                      icon={<Activity className="w-3 h-3 text-muted-foreground" />}
                      title="Software Distribution"
                      value={activeVersionsCount}
                      subtext="Unique Versions"
                      subtextClassName="text-muted-foreground"
                      onClick={() => setActiveView("pnodes")}
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                    />

                  </div>

                  {/* Network Intelligence Summary - WOW Element */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Network Grade Card */}
                    <Card className="bg-card/50 border-border overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-orange-500/10" />
                      <CardContent className="p-6 relative">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Network Grade</p>
                            <div className="flex items-baseline gap-2">
                              <span className={cn(
                                "text-5xl font-black",
                                (() => {
                                  const healthyPct = stats.total > 0 ? (nodes.filter(n => calculateHealthScore(n).total >= 75).length / stats.total) * 100 : 0;
                                  if (healthyPct >= 80) return "text-emerald-400";
                                  if (healthyPct >= 60) return "text-primary";
                                  if (healthyPct >= 40) return "text-amber-400";
                                  return "text-red-400";
                                })()
                              )}>
                                {(() => {
                                  const healthyPct = stats.total > 0 ? (nodes.filter(n => calculateHealthScore(n).total >= 75).length / stats.total) * 100 : 0;
                                  if (healthyPct >= 90) return "A+";
                                  if (healthyPct >= 80) return "A";
                                  if (healthyPct >= 70) return "B+";
                                  if (healthyPct >= 60) return "B";
                                  if (healthyPct >= 50) return "C+";
                                  if (healthyPct >= 40) return "C";
                                  if (healthyPct >= 30) return "D";
                                  return "F";
                                })()}
                              </span>
                              <span className="text-lg text-muted-foreground font-mono">
                                {stats.total > 0 ? Math.round((nodes.filter(n => calculateHealthScore(n).total >= 75).length / stats.total) * 100) : 0}/100
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Based on healthy node ratio</p>
                            <div className="relative">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={copyStatusLoading}
                                className={cn(
                                  "text-xs px-3 py-1.5 h-7 mt-3 transition-all duration-200",
                                  copyStatusSuccess && "bg-emerald-500/20 border-emerald-500 text-emerald-400",
                                  copyStatusError && "bg-red-500/20 border-red-500 text-red-400",
                                  !copyStatusSuccess && !copyStatusError && "hover:bg-primary/10 hover:border-primary hover:text-primary"
                                )}
                                onClick={async () => {
                                  if (copyStatusLoading) return;

                                  setCopyStatusLoading(true);
                                  setCopyStatusError(false);
                                  setCopyStatusSuccess(false);

                                  try {
                                    // Prepare data
                                    const healthyPct = stats.total > 0 ? Math.round((nodes.filter(n => calculateHealthScore(n).total >= 75).length / stats.total) * 100) : 0;
                                    const atRisk = nodes.filter(n => calculateHealthScore(n).total < 75).length;
                                    const mostCommon = getMostCommonVersion(nodes);
                                    const outdated = nodes.filter(n => n.version !== mostCommon).length;
                                    const totalStorage = formatStorage(nodes.reduce((sum, n) => sum + (n.storage_committed || 0), 0));
                                    const grade = healthyPct >= 90 ? "A+" : healthyPct >= 80 ? "A" : healthyPct >= 70 ? "B+" : healthyPct >= 60 ? "B" : healthyPct >= 50 ? "C+" : healthyPct >= 40 ? "C" : healthyPct >= 30 ? "D" : "F";

                                    // Clean, simple format for messaging apps
                                    const summary = `🌐 *XANDEUM NETWORK STATUS*

🏆 Grade: *${grade}* (${healthyPct}/100)

📊 *Nodes*
Total: ${stats.total}
Active: ${stats.active}
Healthy: ${nodes.filter(n => calculateHealthScore(n).total >= 75).length}
At-Risk: ${atRisk}

💾 Storage: ${totalStorage}

🔄 *Version*
Current: ${mostCommon?.split(' ')[0] || 'Unknown'}
Outdated: ${outdated}

⏰ ${new Date().toLocaleString()}
🔗 ${window.location.origin}`;

                                    await navigator.clipboard.writeText(summary);
                                    setCopyStatusSuccess(true);
                                    setTimeout(() => setCopyStatusSuccess(false), 3000);
                                  } catch (e) {
                                    console.error('Copy status failed:', e);
                                    setCopyStatusError(true);
                                    setTimeout(() => setCopyStatusError(false), 5000);
                                  } finally {
                                    setCopyStatusLoading(false);
                                  }
                                }}
                              >
                                {copyStatusLoading ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                                    Generating...
                                  </>
                                ) : copyStatusSuccess ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1.5" />
                                    Copied!
                                  </>
                                ) : copyStatusError ? (
                                  <>
                                    <X className="h-3 w-3 mr-1.5" />
                                    Try Again
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1.5" />
                                    Copy Status
                                  </>
                                )}
                              </Button>
                              {copyStatusError && (
                                <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-red-500/90 text-white text-[10px] rounded whitespace-nowrap z-10">
                                  AI unavailable. Try again later.
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center">
                            <Trophy className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Intelligence Insights */}
                    <Card className="lg:col-span-3 bg-card/50 border-border flex flex-col">
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-4">Network Intelligence</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                          {/* Network Status */}
                          <div
                            className={cn(
                              "p-4 rounded-lg border cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all flex flex-col justify-between h-full",
                              stats.total > 0 && (stats.active / stats.total) >= 0.8
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : stats.total > 0 && (stats.active / stats.total) >= 0.6
                                  ? "bg-amber-500/10 border-amber-500/30"
                                  : "bg-red-500/10 border-red-500/30"
                            )}
                            onClick={() => {
                              // Show healthy nodes only (filter out bad health)
                              setSearchTerm("");
                              setFilterStatus("all");
                              setFilterCountry("all");
                              setFilterVersion("all");
                              setFilterStorage("all");
                              setFilterHealth("healthy");
                              setActiveView("pnodes");
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {stats.total > 0 && (stats.active / stats.total) >= 0.8 ? "✅" :
                                    stats.total > 0 && (stats.active / stats.total) >= 0.6 ? "⚠️" : "🔴"}
                                </span>
                                <span className="text-lg font-bold text-foreground">
                                  {stats.total > 0 && (stats.active / stats.total) >= 0.8 ? "Excellent" :
                                    stats.total > 0 && (stats.active / stats.total) >= 0.6 ? "Good" : "Degraded"}
                                </span>
                              </div>
                              <span className="text-xs text-primary font-medium whitespace-nowrap">View →</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Network health status</p>
                          </div>

                          {/* At-Risk Nodes */}
                          <div
                            className={cn(
                              "p-4 rounded-lg border cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all flex flex-col justify-between h-full",
                              (() => {
                                const atRisk = nodes.filter(n => {
                                  const score = calculateHealthScore(n);
                                  return score.total < 75;
                                }).length;
                                if (atRisk === 0) return "bg-emerald-500/10 border-emerald-500/30";
                                if (atRisk <= 5) return "bg-amber-500/10 border-amber-500/30";
                                return "bg-red-500/10 border-red-500/30";
                              })()
                            )}
                            onClick={() => {
                              // Reset all filters first, then apply specific filter
                              setSearchTerm("");
                              setFilterStatus("all");
                              setFilterCountry("all");
                              setFilterVersion("all");
                              setFilterStorage("all");
                              setFilterHealth("at_risk");
                              setActiveView("pnodes");
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const atRisk = nodes.filter(n => calculateHealthScore(n).total < 75).length;
                                  if (atRisk === 0) return <span className="text-lg">✅</span>;
                                  if (atRisk <= 5) return <span className="text-lg">⚠️</span>;
                                  return <span className="text-lg">🔴</span>;
                                })()}
                                <span className="text-2xl font-bold text-foreground">
                                  {nodes.filter(n => calculateHealthScore(n).total < 75).length}
                                </span>
                              </div>
                              <span className="text-xs text-primary font-medium">View →</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {nodes.filter(n => calculateHealthScore(n).total < 75).length === 0
                                ? "All nodes healthy!"
                                : "Nodes at risk"}
                            </p>
                          </div>

                          {/* Outdated Versions - Shows nodes not on latest software */}
                          {(() => {
                            const latestVersion = getMostCommonVersion(nodes);
                            const outdated = nodes.filter(n => {
                              const nodeVersion = n.version?.split(' ')[0];
                              return nodeVersion && nodeVersion !== latestVersion;
                            }).length;
                            return (
                              <div
                                className={cn(
                                  "p-4 rounded-lg border cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all flex flex-col justify-between h-full",
                                  outdated === 0 ? "bg-emerald-500/10 border-emerald-500/30" :
                                    outdated <= 10 ? "bg-amber-500/10 border-amber-500/30" :
                                      "bg-red-500/10 border-red-500/30"
                                )}
                                onClick={() => {
                                  // Reset all filters first, then apply specific filter
                                  setSearchTerm("");
                                  setFilterStatus("all");
                                  setFilterCountry("all");
                                  setFilterVersion("outdated");
                                  setFilterStorage("all");
                                  setFilterHealth("all");
                                  setActiveView("pnodes");
                                }}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{outdated === 0 ? "✅" : "🔄"}</span>
                                    <span className="text-2xl font-bold text-foreground">{outdated}</span>
                                  </div>
                                  <span className="text-xs text-primary font-medium">View →</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {outdated === 0 ? "All on latest version!" : "Outdated versions"}
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div> {/* End of flex-col-reverse wrapper */}

                {/* ... existing charts ... */}
                {/* ... existing charts ... */}
                {/* Row 1: Network Performance (2 cols) + Storage Distribution (1 col) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <NetworkPerformance data={metrics?.tpsHistory || []} />
                  </div>
                  <div className="lg:col-span-1">
                    <StorageDistribution data={storageDistributionData} onDrillDown={(s) => handleDrillDown('storage', s)} />
                  </div>
                </div>

                {/* Row 2: Version Chart (2 cols) + Node Leaderboard (1 col) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <VersionChart data={versionData} onDrillDown={(v) => handleDrillDown('version', v)} />
                  </div>
                  <div className="lg:col-span-1">
                    <NodeLeaderboard data={leaderboardData} onDrillDown={(nodeId) => handleDrillDown('node', nodeId)} />
                  </div>
                </div>

                {/* Row 3: Global Distribution (Full Width) */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="w-full">
                    <CountryChart data={countryData} onDrillDown={(c) => handleDrillDown('country', c)} />
                  </div>
                </div>

                {/* Row 3: Node Leaderboard (full width) */}
                <div>
                  <AnalyticsBar
                    title="Network Node Status"
                    segments={[
                      { label: "Online (RPC Active)", value: stats.active, color: "#10b981" },
                      { label: "Gossip Only", value: stats.total - stats.active, color: "#f59e0b" },
                    ]}
                    onSegmentClick={(segment) => {
                      // Map segment labels to filter values
                      if (segment.label.includes("Online")) {
                        handleDrillDown('status', 'active');
                      } else {
                        handleDrillDown('status', 'inactive');
                      }
                    }}
                  />
                </div>
              </>
            )}          </div>

          {/* VIEW: NODES - Full height layout with right panel sticking to edge */}
          {activeView === "pnodes" && (
            <div className="flex flex-1 min-h-0 overflow-hidden h-full">
              {/* Table Section with padding */}
              <div className={cn("flex-1 min-w-0 px-8 py-6 space-y-4 flex flex-col h-full", selectedNode && "hidden md:flex")}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/50 p-4 rounded-xl border border-border">
                  {/* Left side: Search + Node Count */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search Node ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background border-input focus:border-primary text-foreground placeholder:text-muted-foreground font-mono text-sm"
                      />
                    </div>

                    {/* Node Count Indicator */}
                    <div className="hidden sm:flex items-center gap-1.5 text-sm whitespace-nowrap">
                      <span className="text-muted-foreground">Showing</span>
                      <span className="font-mono font-bold text-foreground">{filteredNodes.length}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="font-mono font-bold text-primary">{nodes.length}</span>
                    </div>
                  </div>

                  {/* Right side: Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      className={cn(
                        "bg-primary hover:bg-orange-600 active:scale-95 text-primary-foreground font-bold transition-all",
                        selectedNode && "px-3"
                      )}
                      onClick={handleExport}
                    >
                      <Download className={cn("h-4 w-4", !selectedNode && "mr-2")} />
                      {!selectedNode && <span className="hidden lg:inline">EXPORT ENRICHED CSV</span>}
                      {!selectedNode && <span className="lg:hidden">EXPORT</span>}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size={selectedNode ? "icon" : "default"}
                          className={cn(
                            "border-border bg-card text-muted-foreground hover:text-foreground flex-shrink-0 transition-all",
                            selectedNode && "h-10 w-10",
                            (filterStatus !== "all" || filterCountry !== "all" || filterVersion !== "all") && "border-primary bg-primary/10 text-primary"
                          )}
                        >
                          <Filter className="h-4 w-4" />
                          {!selectedNode && <span className="ml-2">Filters</span>}
                          {(filterStatus !== "all" || filterCountry !== "all" || filterVersion !== "all" || filterStorage !== "all" || filterHealth !== "all") && (
                            <Badge className={cn("h-5 px-1.5 text-[10px] bg-primary text-primary-foreground", selectedNode ? "absolute -top-1 -right-1" : "ml-2")}>
                              {(filterStatus !== "all" ? 1 : 0) + (filterCountry !== "all" ? 1 : 0) + (filterVersion !== "all" ? 1 : 0) + (filterStorage !== "all" ? 1 : 0) + (filterHealth !== "all" ? 1 : 0)}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 max-h-[300px] overflow-y-auto bg-popover border-border text-popover-foreground text-sm p-0">
                        {/* Status Section */}
                        <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-popover z-10">
                          Status
                        </div>
                        <DropdownMenuCheckboxItem
                          checked={filterStatus === "all"}
                          onCheckedChange={() => setFilterStatus("all")}
                          className="text-xs py-1"
                        >
                          All Nodes
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterStatus === "active"}
                          onCheckedChange={() => setFilterStatus(filterStatus === "active" ? "all" : "active")}
                          className="text-xs py-1"
                        >
                          Active Only
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterStatus === "inactive"}
                          onCheckedChange={() => setFilterStatus(filterStatus === "inactive" ? "all" : "inactive")}
                          className="text-xs py-1"
                        >
                          Inactive Only
                        </DropdownMenuCheckboxItem>

                        <Separator className="my-1 bg-border" />

                        {/* Country Section */}
                        <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-popover z-10">
                          Country
                        </div>
                        <DropdownMenuCheckboxItem
                          checked={filterCountry === "all"}
                          onCheckedChange={() => setFilterCountry("all")}
                          className="text-xs py-1"
                        >
                          All Countries
                        </DropdownMenuCheckboxItem>
                        {Array.from(new Set(Object.values(geoCache).map((g: any) => g.country))).map((country: any) => (
                          <DropdownMenuCheckboxItem
                            key={country}
                            checked={filterCountry === country}
                            onCheckedChange={() => setFilterCountry(filterCountry === country ? "all" : country)}
                            className="text-xs py-1"
                          >
                            <span className="truncate max-w-[120px]">{country}</span>
                          </DropdownMenuCheckboxItem>
                        ))}

                        <Separator className="my-1 bg-border" />

                        {/* Version Section */}
                        <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-popover z-10">
                          Version
                        </div>
                        <DropdownMenuCheckboxItem
                          checked={filterVersion === "all"}
                          onCheckedChange={() => setFilterVersion("all")}
                          className="text-xs py-1"
                        >
                          All Versions
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterVersion === "outdated"}
                          onCheckedChange={() => setFilterVersion(filterVersion === "outdated" ? "all" : "outdated")}
                          className="text-xs py-1"
                        >
                          🔄 Outdated
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterVersion === "latest"}
                          onCheckedChange={() => setFilterVersion(filterVersion === "latest" ? "all" : "latest")}
                          className="text-xs py-1"
                        >
                          ✅ Latest
                        </DropdownMenuCheckboxItem>
                        {versionData.map((v) => (
                          <DropdownMenuCheckboxItem
                            key={v.name}
                            checked={filterVersion === v.name}
                            onCheckedChange={() => setFilterVersion(filterVersion === v.name ? "all" : v.name)}
                            className="text-xs py-1"
                          >
                            <span className="truncate max-w-[120px]">{v.name}</span>
                          </DropdownMenuCheckboxItem>
                        ))}

                        <Separator className="my-1 bg-border" />

                        {/* Storage Section */}
                        <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-popover z-10">
                          Storage
                        </div>
                        <DropdownMenuCheckboxItem
                          checked={filterStorage === "all"}
                          onCheckedChange={() => setFilterStorage("all")}
                          className="text-xs py-1"
                        >
                          All Storage
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterStorage === "< 100 GB"}
                          onCheckedChange={() => setFilterStorage(filterStorage === "< 100 GB" ? "all" : "< 100 GB")}
                          className="text-xs py-1"
                        >
                          &lt; 100 GB
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterStorage === "100 GB - 1 TB"}
                          onCheckedChange={() => setFilterStorage(filterStorage === "100 GB - 1 TB" ? "all" : "100 GB - 1 TB")}
                          className="text-xs py-1"
                        >
                          100 GB - 1 TB
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterStorage === "1 TB - 10 TB"}
                          onCheckedChange={() => setFilterStorage(filterStorage === "1 TB - 10 TB" ? "all" : "1 TB - 10 TB")}
                          className="text-xs py-1"
                        >
                          1 TB - 10 TB
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterStorage === "> 10 TB"}
                          onCheckedChange={() => setFilterStorage(filterStorage === "> 10 TB" ? "all" : "> 10 TB")}
                          className="text-xs py-1"
                        >
                          &gt; 10 TB
                        </DropdownMenuCheckboxItem>

                        <Separator className="my-1 bg-border" />

                        {/* Health Section */}
                        <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-popover z-10">
                          Health
                        </div>
                        <DropdownMenuCheckboxItem
                          checked={filterHealth === "all"}
                          onCheckedChange={() => setFilterHealth("all")}
                          className="text-xs py-1"
                        >
                          All Health
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterHealth === "at_risk"}
                          onCheckedChange={() => setFilterHealth(filterHealth === "at_risk" ? "all" : "at_risk")}
                          className="text-xs py-1"
                        >
                          🔴 At Risk (&lt;75)
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterHealth === "healthy"}
                          onCheckedChange={() => setFilterHealth(filterHealth === "healthy" ? "all" : "healthy")}
                          className="text-xs py-1"
                        >
                          🟢 Healthy (≥75)
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterHealth === "warning"}
                          onCheckedChange={() => setFilterHealth(filterHealth === "warning" ? "all" : "warning")}
                          className="text-xs py-1"
                        >
                          🟡 Warning (50-74)
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterHealth === "critical"}
                          onCheckedChange={() => setFilterHealth(filterHealth === "critical" ? "all" : "critical")}
                          className="text-xs py-1"
                        >
                          🔴 Critical (&lt;50)
                        </DropdownMenuCheckboxItem>
                        {/* Bottom spacer for sticky headers */}
                        <div className="h-6" />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Card className="bg-background/50 backdrop-blur-sm border-border overflow-hidden flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto rounded-md">
                    <Table className="w-full table-fixed">
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-border">
                          <TableHead className="w-[4%] bg-muted"></TableHead>
                          <TableHead className="w-[18%] font-bold text-secondary cursor-pointer bg-muted" onClick={() => handleSort("pubkey")}>
                            Node Identity {sortConfig?.key === "pubkey" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                          </TableHead>
                          <TableHead className="w-[20%] font-bold text-secondary hidden md:table-cell bg-muted">Gossip Address</TableHead>
                          <TableHead className="w-[12%] font-bold text-secondary hidden md:table-cell bg-muted">Version</TableHead>
                          <TableHead className="w-[12%] font-bold text-secondary text-right bg-muted">Uptime</TableHead>
                          <TableHead className="w-[16%] font-bold text-secondary text-right bg-muted">Storage</TableHead>
                          <TableHead className={cn("w-[6%] font-bold text-secondary text-center bg-muted", selectedNode && "hidden")}>Share</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNodes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-64 text-center">
                              <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                                  <SearchX className="h-6 w-6 opacity-50" />
                                </div>
                                <div className="space-y-1">
                                  <p className="font-medium text-foreground">No nodes found</p>
                                  <p className="text-xs">No nodes match your filters. Try adjusting your search term or filters.</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => { setSearchTerm(""); setFilterStatus("all"); setFilterCountry("all"); setFilterVersion("all"); setFilterStorage("all"); setFilterHealth("all"); }} className="mt-2 active:scale-95 transition-all">
                                  Clear Filters
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
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
                                <TableCell className="hidden md:table-cell overflow-hidden">
                                  <Badge variant="outline" className="bg-secondary/10 text-secondary dark:bg-cyan-950/30 dark:text-cyan-400 border-secondary/30 dark:border-cyan-800/50 font-mono text-xs max-w-full truncate block">
                                    {(node.version?.split(' ')[0]) || "Unknown"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right"><span className="font-mono text-sm text-foreground">{uptimeString}</span></TableCell>
                                <TableCell className="text-right">
                                  <div className="flex flex-col items-end">
                                    <span className="font-bold text-sm text-foreground">{committed}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {((node.storage_committed || 0) / (1024 * 1024)).toFixed(0)} MB Cached
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className={cn("text-center", selectedNode && "hidden")}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // Don't trigger row click
                                      const url = `${window.location.origin}?view=pnodes&node=${node.pubkey.slice(0, 8)}`;
                                      navigator.clipboard.writeText(url);
                                      toast({
                                        title: "Link Copied!",
                                        description: formatPubkey(node.pubkey),
                                      });
                                    }}
                                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                                    title="Copy sharable link"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
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
                    className="hidden md:flex flex-shrink-0 h-full min-h-0 flex-col overflow-hidden shadow-sm bg-background dark:bg-[#020617]"
                    style={{ width: rightSidebarWidth }}
                  >

                    {/* Header */}
                    <div className="flex-shrink-0 border-b border-border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Server className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-bold tracking-tight text-foreground">Node Details</h2>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={async () => {
                              const url = `${window.location.origin}?view=pnodes&node=${selectedNode?.pubkey.slice(0, 8)}`;
                              await navigator.clipboard.writeText(url);
                              toast({
                                title: "Link Copied!",
                                description: "Share this link to open this node directly.",
                              });
                            }}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                            aria-label="Copy link"
                            title="Copy shareable link"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCloseNodeDetails}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            aria-label="Close panel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
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
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none cursor-default hover:bg-emerald-500/20">
                                      Online
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive" className="cursor-default hover:bg-destructive">Offline</Badge>
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

                            {/* Health Score */}
                            {(() => {
                              const healthScore = calculateHealthScore(selectedNode);
                              return (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                      <Activity className="h-4 w-4 text-primary" /> Health Score
                                    </h4>
                                    <Badge className={cn(
                                      "border-none cursor-default",
                                      healthScore.status === "HEALTHY" && "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20",
                                      healthScore.status === "WARNING" && "bg-amber-500/20 text-amber-400 hover:bg-amber-500/20",
                                      healthScore.status === "CRITICAL" && "bg-red-500/20 text-red-400 hover:bg-red-500/20"
                                    )}>
                                      {healthScore.status}
                                    </Badge>
                                  </div>

                                  {/* Score Display */}
                                  <div className="flex items-center gap-3">
                                    <div className="text-3xl font-bold text-foreground">{healthScore.total}</div>
                                    <div className="text-muted-foreground text-sm">/100</div>
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={cn(
                                          "h-full rounded-full transition-all",
                                          healthScore.total >= 75 && "bg-emerald-500",
                                          healthScore.total >= 50 && healthScore.total < 75 && "bg-amber-500",
                                          healthScore.total < 50 && "bg-red-500"
                                        )}
                                        style={{ width: `${healthScore.total}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Breakdown */}
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-muted/50 p-2 rounded">
                                      <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Version</span>
                                        <span className="font-mono font-bold text-foreground">{healthScore.breakdown.version.score}/{healthScore.breakdown.version.max}</span>
                                      </div>
                                    </div>
                                    <div className="bg-muted/50 p-2 rounded">
                                      <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Uptime</span>
                                        <span className="font-mono font-bold text-foreground">{healthScore.breakdown.uptime.score}/{healthScore.breakdown.uptime.max}</span>
                                      </div>
                                    </div>
                                    <div className="bg-muted/50 p-2 rounded">
                                      <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Storage</span>
                                        <span className="font-mono font-bold text-foreground">{healthScore.breakdown.storage.score}/{healthScore.breakdown.storage.max}</span>
                                      </div>
                                    </div>
                                    <div className="bg-muted/50 p-2 rounded">
                                      <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">RPC Status</span>
                                        <span className="font-mono font-bold text-foreground">{healthScore.breakdown.rpc.score}/{healthScore.breakdown.rpc.max}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

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

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4">
                              <Button
                                onClick={handleExportHtml}
                                className="flex-1 bg-primary hover:bg-orange-600 active:scale-95 text-primary-foreground font-bold h-10 transition-all"
                                size="sm"
                              >
                                <Download className="mr-2 h-4 w-4" /> Export HTML
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 h-10 font-bold active:scale-95 transition-all"
                                size="sm"
                                onClick={() => {
                                  const healthScore = calculateHealthScore(selectedNode);
                                  const uptimeSeconds = selectedNode?.uptime || 0;
                                  const days = Math.floor(uptimeSeconds / 86400);
                                  const hours = Math.floor((uptimeSeconds % 86400) / 3600);

                                  // Build metrics array - only include non-zero/non-null values
                                  const metrics: string[] = [];

                                  if (selectedNode?.version) {
                                    metrics.push(`• Version: ${XandeumClient.formatVersion(selectedNode.version)}`);
                                  }
                                  if (uptimeSeconds > 0) {
                                    metrics.push(`• Uptime: ${days}d ${hours}h`);
                                  }
                                  if (selectedNode?.storage_committed && selectedNode.storage_committed > 0) {
                                    metrics.push(`• Storage Committed: ${formatStorage(selectedNode.storage_committed)}`);
                                  }
                                  if (selectedNode?.storage_used && selectedNode.storage_used > 0) {
                                    metrics.push(`• Storage Used: ${formatStorage(selectedNode.storage_used)}`);
                                  }
                                  if (selectedNode?.credits && selectedNode.credits > 0) {
                                    metrics.push(`• Credits: ${selectedNode.credits.toLocaleString()}`);
                                  }

                                  // Build location string
                                  const locationParts: string[] = [];
                                  if (geoData?.city) locationParts.push(geoData.city);
                                  if (geoData?.country) locationParts.push(geoData.country);

                                  // Status emoji based on health
                                  const statusEmoji = healthScore.status === "HEALTHY" ? "🟢" : healthScore.status === "WARNING" ? "🟡" : "🔴";

                                  let detailsText = `${statusEmoji} XANDEUM NODE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━

📍 Node ID
${selectedNode?.pubkey}

📊 Health: ${healthScore.total}/100 (${healthScore.status})
┌─ Version: ${healthScore.breakdown.version.score}/${healthScore.breakdown.version.max}
├─ Uptime: ${healthScore.breakdown.uptime.score}/${healthScore.breakdown.uptime.max}
├─ Storage: ${healthScore.breakdown.storage.score}/${healthScore.breakdown.storage.max}
└─ RPC: ${healthScore.breakdown.rpc.score}/${healthScore.breakdown.rpc.max}`;

                                  if (metrics.length > 0) {
                                    detailsText += `\n\n📈 Metrics\n${metrics.join('\n')}`;
                                  }

                                  detailsText += `\n\n🔗 Network
• Gossip: ${selectedNode?.gossip || "N/A"}`;

                                  if (selectedNode?.rpc) {
                                    detailsText += `\n• RPC: ${selectedNode.rpc}`;
                                  }

                                  if (locationParts.length > 0) {
                                    detailsText += `\n\n🌍 Location: ${locationParts.join(', ')}`;
                                    if (geoData?.org || geoData?.isp) {
                                      detailsText += `\n• Provider: ${geoData.org || geoData.isp}`;
                                    }
                                  }

                                  navigator.clipboard.writeText(detailsText).then(() => {
                                    toast({
                                      title: "Copied to Clipboard",
                                      description: "Node report copied successfully.",
                                    });
                                  });
                                }}
                              >
                                <Copy className="mr-2 h-4 w-4" /> Copy All
                              </Button>
                            </div>

                            <Separator className="bg-border my-4" />

                            {/* Raw JSON Stream */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" /> RAW_JSON_STREAM
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                                  onClick={() => {
                                    const jsonData = JSON.stringify({
                                      pubkey: selectedNode?.pubkey,
                                      gossip: selectedNode?.gossip,
                                      rpc: selectedNode?.rpc,
                                      version: selectedNode?.version,
                                      storage_committed: selectedNode?.storage_committed,
                                      storage_used: selectedNode?.storage_used,
                                      storage_usage_percent: selectedNode?.storage_usage_percent,
                                      uptime: selectedNode?.uptime,
                                      credits: selectedNode?.credits,
                                      health_score: calculateHealthScore(selectedNode).total,
                                    }, null, 2);
                                    navigator.clipboard.writeText(jsonData).then(() => {
                                      toast({
                                        title: "JSON Copied",
                                        description: "Raw node data copied to clipboard.",
                                      });
                                    });
                                  }}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </div>
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
                                    health_score: calculateHealthScore(selectedNode).total,
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
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            }>
              <LeafletClusterMap
                nodes={mapNodeData}
                onNodeClick={(pubkey) => {
                  // Switch to Registry and select the node
                  setActiveView("pnodes");
                  // Wait for render
                  setTimeout(() => {
                    const node = nodes.find(n => n.pubkey === pubkey);
                    if (node) setSelectedNode(node);
                  }, 100);
                }}
              />
            </Suspense>
          )}

          {/* WATCHLIST VIEW */}
          {activeView === "watchlist" && (
            <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

              {/* Header */}
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                  My Nodes
                </h2>
                <p className="text-muted-foreground">Track and monitor your favorite pNodes in one place. Data is stored locally.</p>
              </div>

              {/* Add Node Panel */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-primary mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4" /> Add a Node to Track
                  </h3>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter pNode pubkey..."
                        value={newWatchlistNode}
                        onChange={(e) => setNewWatchlistNode(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <Button onClick={addToWatchlist} disabled={!newWatchlistNode || newWatchlistNode.length < 5}>
                      <div className="flex items-center gap-2">
                        <span>+ Add Node</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Nodes List */}
              <div className="space-y-4">
                {watchlist.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-muted rounded-xl bg-muted/20">
                    <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No Nodes Saved Yet</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                      Add pNode pubkeys above to start tracking their live performance, health score, and earnings.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => setActiveView("pnodes")}>
                      <Search className="h-4 w-4 mr-2" />
                      Browse All Nodes
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {watchlist.map(pubkey => {
                      // Hydrate with Live Data
                      const node = nodes.find(n => n.pubkey === pubkey);
                      const health = node ? calculateHealthScore(node) : { total: 0, status: "WARNING", breakdown: { version: { score: 0, max: 0 }, uptime: { score: 0, max: 0 }, storage: { score: 0, max: 0 }, rpc: { score: 0, max: 0 } } };
                      const isOnline = node ? !!(node.rpc || node.tpu) : false;

                      return (
                        <Card key={pubkey} className="overflow-hidden hover:border-primary/40 transition-all">
                          <CardContent className="p-0 flex flex-col sm:flex-row h-auto sm:h-24">
                            {/* Status Bar */}
                            <div className={cn(
                              "w-full sm:w-2 h-2 sm:h-auto flex-shrink-0",
                              isOnline ? "bg-emerald-500" : "bg-red-500"
                            )} />

                            <div className="flex-1 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-6">

                              {/* Identity */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-mono font-bold text-lg truncate text-primary">{formatPubkey(pubkey)}</h3>
                                  <Badge variant={isOnline ? "secondary" : "destructive"} className={isOnline ? "bg-emerald-500/10 text-emerald-500 border-none" : ""}>
                                    {isOnline ? "Online" : "Offline"}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">
                                  {pubkey}
                                </div>
                              </div>

                              {/* Metrics */}
                              {node ? (
                                <div className="flex items-center gap-8 text-sm">
                                  <div className="text-center">
                                    <div className="text-xs text-muted-foreground mb-1">Health</div>
                                    <div className={cn(
                                      "font-bold text-lg",
                                      health.total >= 80 ? "text-emerald-500" :
                                        health.total >= 50 ? "text-amber-500" : "text-red-500"
                                    )}>
                                      {health.total}
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xs text-muted-foreground mb-1">Storage</div>
                                    <div className="font-medium">
                                      {formatStorage(node.storage_committed || 0)}
                                    </div>
                                  </div>
                                  <div className="text-center hidden sm:block">
                                    <div className="text-xs text-muted-foreground mb-1">Version</div>
                                    <div className="font-mono text-xs">
                                      {XandeumClient.formatVersion(node.version || null)}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-amber-500 text-sm">
                                  <Activity className="h-4 w-4 animate-pulse" />
                                  Waiting for network discovery...
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-2 ml-auto">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => removeFromWatchlist(pubkey)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" onClick={() => {
                                  if (node) {
                                    setActiveView("pnodes");
                                    setTimeout(() => setSelectedNode(node), 50);
                                  }
                                }}>
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* AI Chat Widget - controlled from header button */}
          <AIChatWidget
            externalOpen={aiChatOpen}
            onOpenChange={setAiChatOpen}
            hideFloatingButton={true}
            context={{
              totalNodes: stats.total,
              activeNodes: stats.active,
              totalStorage: formatStorage(nodes.reduce((sum, n) => sum + (n.storage_committed || 0), 0)),
              healthyCount: nodes.filter(n => calculateHealthScore(n).status === "HEALTHY").length,
              warningCount: nodes.filter(n => calculateHealthScore(n).status === "WARNING").length,
              criticalCount: nodes.filter(n => calculateHealthScore(n).status === "CRITICAL").length,
              lastUpdated: new Date().toLocaleTimeString(),
              atRiskNodes: nodes
                .map(n => ({ pubkey: n.pubkey.slice(0, 8) + "..." + n.pubkey.slice(-4), health: calculateHealthScore(n) }))
                .filter(n => n.health.status !== "HEALTHY")
                .slice(0, 10)
                .map(n => `${n.pubkey}: ${n.health.total}/100 (${n.health.status})`),
              topCountries: Object.entries(nodes.reduce((acc, n) => {
                const country = n.location?.country || "Unknown";
                acc[country] = (acc[country] || 0) + 1;
                return acc;
              }, {} as Record<string, number>))
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([country, count]) => `${country}: ${count}`),
              offlineNodes: nodes
                .filter(n => n.status !== "Active")
                .slice(0, 10)
                .map(n => n.pubkey),
              softwareVersions: Object.entries(nodes.reduce((acc, n) => {
                const version = n.version || "Unknown";
                acc[version] = (acc[version] || 0) + 1;
                return acc;
              }, {} as Record<string, number>))
                .sort((a, b) => b[1] - a[1])
                .map(([ver, count]) => `${ver}: ${count}`),
            }}
          />

          <Toaster />
        </main>
      </div>
    </div>
  );
}

// Main export with Suspense for useSearchParams
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

// Subcomponents
function DashboardCard({ icon, title, value, subtext, subtextClassName, tooltip, loading }: any) {
  return (
    <Card className="bg-card/40 border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          {icon} {title}
          {tooltip && <InfoTooltip content={tooltip} />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 mb-1" />
        ) : (
          <div className="text-3xl font-bold text-foreground font-mono">{value}</div>
        )}
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
