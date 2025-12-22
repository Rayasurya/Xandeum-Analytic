import { Connection, ContactInfo } from "@solana/web3.js";
import { XANDEUM_CONFIG } from "../config";

// Xandeum Devnet RPC Endpoint
const XANDEUM_RPC_ENDPOINT = XANDEUM_CONFIG.RPC_ENDPOINT;

export interface PNodeInfo extends Omit<ContactInfo, 'version'> {
    shredVersion?: number | null;
    featureSet?: number | null;
    // Extended fields from pNode RPC
    storage_committed?: number;
    storage_used?: number;
    storage_usage_percent?: number;
    uptime?: number;
    credits?: number;
    rpc_port?: number;
    version?: string | null;
}

export class XandeumClient {
    private connection: Connection;

    constructor(endpoint: string = XANDEUM_RPC_ENDPOINT) {
        this.connection = new Connection(endpoint, "confirmed");
    }

    /**
     * Fetches the list of pNodes via gossip.
     * Uses standard getClusterNodes which returns nodes interacting via gossip.
     */
    async getPNodes(): Promise<PNodeInfo[]> {
        try {
            // 1. Get bootstrap list from standard RPC
            const clusterNodes = await this.connection.getClusterNodes();
            let allNodes: PNodeInfo[] = [...clusterNodes];

            // 2. Fetch rich "pNode" stats via Multi-Seed Mesh Discovery
            // Check if we should use external Mesh API (for Vercel environment)
            const shouldUseExternalApi = !!XANDEUM_CONFIG.MESH_API_URL;

            try {
                if (shouldUseExternalApi && XANDEUM_CONFIG.MESH_API_URL) {
                    // Use external dedicated backend
                    const apiUrl = `${XANDEUM_CONFIG.MESH_API_URL}/api/pnodes`;
                    const response = await fetch(apiUrl);

                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && Array.isArray(result.data)) {
                            console.log(`[Xandeum] Fetched ${result.data.length} nodes from external Mesh API.`);
                            return result.data;
                        }
                    } else {
                        throw new Error(`External API failed with status ${response.status}`);
                    }
                }

                // Fallback to client-side discovery (Local/Development)
                // Seeds from Xandeum Discord community
                const MESH_SEEDS = [
                    // Original Seeds
                    "173.212.203.145",
                    "173.212.220.65",
                    "161.97.97.41",
                    "192.190.136.36",
                    "192.190.136.37",
                    "192.190.136.38",
                    "192.190.136.28",
                    "192.190.136.29",
                    "207.244.255.1",
                    // Additional Seeds from Community Chat
                    "45.84.138.15",
                    "173.249.3.118",
                    "84.21.171.129",
                    "161.97.185.116",
                    "154.38.169.212",
                    "152.53.155.15",
                    "154.38.185.152",
                    "173.249.59.66",
                    "45.151.122.60",
                    "152.53.236.91",
                    "173.249.54.191",
                    "45.151.122.71"
                ];

                // Map to merge specific pNode data
                const nodeMap = new Map<string, PNodeInfo>();

                // Initialize with cluster nodes to ensure we have the base set
                clusterNodes.forEach(n => nodeMap.set(n.pubkey, n));

                // Query all seeds in parallel via our proxy
                const seedPromises = MESH_SEEDS.map(async (seedIp) => {
                    try {
                        // Use local proxy to bypass browser restriction on port 6000
                        const url = `/api/pnodestats?ip=${seedIp}`;
                        const response = await fetch(url, { headers: { "Content-Type": "application/json" } });
                        const data = await response.json();

                        if (data.result && Array.isArray(data.result.pods)) {
                            return data.result.pods;
                        }
                    } catch (e) {
                        // console.warn(`Failed to query seed ${seedIp}`);
                    }
                    return [];
                });

                const allSeedResults = await Promise.all(seedPromises);

                // Fetch Pod Credits (external source)
                let creditMap = new Map<string, number>();
                try {
                    const creditRes = await fetch("/api/podcredits");
                    if (creditRes.ok) {
                        const creditData = await creditRes.json();
                        // API returns { credits: [...], status: "success" }
                        const creditList = Array.isArray(creditData) ? creditData : (creditData.credits || []);

                        if (Array.isArray(creditList)) {
                            creditList.forEach((c: any) => {
                                const key = c.pod_id || c.pubkey;
                                const score = c.credits || c.total_credits || 0;
                                if (key) creditMap.set(key, score);
                            });
                            console.log(`[Debug] Loaded ${creditMap.size} credit entries.`);
                        }
                    }
                } catch (e) {
                    console.warn("Failed to fetch pod credits:", e);
                }

                // Merge results
                let matchCount = 0;
                allSeedResults.flat().forEach((pod: any) => {
                    const existing = nodeMap.get(pod.pubkey) || { pubkey: pod.pubkey } as PNodeInfo;
                    const creditScore = creditMap.get(pod.pubkey) || 0;
                    if (creditScore > 0) matchCount++;

                    nodeMap.set(pod.pubkey, {
                        ...existing,
                        gossip: existing.gossip || pod.address,
                        rpc: existing.rpc || (pod.rpc_port ? `${pod.address.split(':')[0]}:${pod.rpc_port}` : null),
                        version: pod.version ? `${pod.version} (Heidelberg)` : (existing.version ?? null),
                        // Overwrite with richer pNode metrics
                        storage_committed: pod.storage_committed,
                        storage_used: pod.storage_used,
                        storage_usage_percent: pod.storage_usage_percent,
                        uptime: pod.uptime,
                        credits: creditScore
                    });
                });
                console.log(`[Debug] Merged credits. Total nodes: ${nodeMap.size}. Matches with credits: ${matchCount}`);

                allNodes = Array.from(nodeMap.values());
                console.log(`[Xandeum] Mesh Discovery complete. Total Unique Nodes: ${allNodes.length}`);

            } catch (discoveryErr) {
                console.warn("pNode Mesh Discovery Failed:", discoveryErr);
                // If external API fails, we fall back to cluster nodes
            }

            // Sort: Active nodes (with RPC/TPU APIs) first, then by pubkey
            return allNodes.sort((a, b) => {
                const aActive = a.rpc || a.tpu ? 1 : 0;
                const bActive = b.rpc || b.tpu ? 1 : 0;
                if (aActive !== bActive) return bActive - aActive; // Descending
                return a.pubkey.localeCompare(b.pubkey);
            });
        } catch (error) {
            console.error("Failed to fetch pNodes:", error);
            throw new Error("Failed to retrieve pNodes from Xandeum network.");
        }
    }

    /**
     * Helper to map software versions to brand protocol versions
     */
    static formatVersion(rawVersion: string | null): string {
        if (!rawVersion) return "Unknown";
        const cleanV = rawVersion.split(" ")[0];
        return XANDEUM_CONFIG.VERSION_MAPPING[cleanV] || rawVersion;
    }

    /**
     * Get real network metrics from the RPC
     */
    async getNetworkMetrics() {
        try {
            const [epochInfo, perfSamples, supply] = await Promise.all([
                this.connection.getEpochInfo(),
                this.connection.getRecentPerformanceSamples(60),
                this.connection.getSupply()
            ]);

            return {
                epoch: epochInfo.epoch,
                tpsHistory: perfSamples
                    .filter(s => s.samplePeriodSecs > 0 && s.numTransactions > 0)
                    .map((sample, i) => {
                        const tps = sample.numTransactions / sample.samplePeriodSecs;
                        // Relative time
                        const d = new Date();
                        d.setMinutes(d.getMinutes() - i);
                        return {
                            time: d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                            tps
                        };
                    }).reverse(),
                totalSupply: (supply.value.total / 1000000000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " XAND"
            };
        } catch (error) {
            console.error("Failed to fetch metrics:", error);
            return null;
        }
    }

    /**
     * Get formatted stats for dashboard
     */
    async getStats() {
        try {
            const nodes = await this.getPNodes();
            const activeNodes = nodes.filter(n => n.rpc).length;

            return {
                total: nodes.length,
                active: activeNodes,
                delinquent: nodes.length - activeNodes
            };
        } catch (error) {
            console.error("Failed to fetch stats:", error);
            return { total: 0, active: 0, delinquent: 0 };
        }
    }
}
