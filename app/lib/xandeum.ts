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
    location?: {
        country?: string;
        city?: string;
        lat?: number;
        lon?: number;
    };
    status?: string;
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
            // 1. Static Dataset (GitHub Actions / "Serverless" Approach)
            // If the URL points to a JSON file, we treat it as a static snapshot.
            if (XANDEUM_CONFIG.MESH_API_URL && XANDEUM_CONFIG.MESH_API_URL.endsWith('.json')) {
                console.log('Fetching pNodes from static dataset:', XANDEUM_CONFIG.MESH_API_URL);
                try {
                    const res = await fetch(XANDEUM_CONFIG.MESH_API_URL, { cache: 'no-store' });
                    if (res.ok) {
                        const data = await res.json();
                        // The scraper saves as { nodes: [...] }, so we return data.nodes
                        if (data.nodes && Array.isArray(data.nodes)) {
                            // Map raw JSON to PNodeInfo structure and deduplicate by pubkey
                            const mappedNodes = data.nodes.map((n: any) => ({
                                ...n,
                                rpc: n.rpc || (n.rpc_port && n.address ? `${n.address.split(':')[0]}:${n.rpc_port}` : null),
                                gossip: n.gossip || n.address
                            }));

                            // Deduplicate using a Map
                            const uniqueNodes = new Map();
                            mappedNodes.forEach((n: any) => {
                                if (n.pubkey && !uniqueNodes.has(n.pubkey)) {
                                    uniqueNodes.set(n.pubkey, n);
                                }
                            });

                            return Array.from(uniqueNodes.values());
                        }
                    }
                } catch (e) {
                    console.warn('Failed to fetch from static dataset, falling back...', e);
                }
            }

            // 2. Dedicated Backend API (VPS Approach)
            // If text is set but not a .json file, assume it's an API endpoint
            if (XANDEUM_CONFIG.MESH_API_URL && !XANDEUM_CONFIG.MESH_API_URL.endsWith('.json')) {
                console.log('Fetching pNodes from Mesh Backend:', XANDEUM_CONFIG.MESH_API_URL);
                try {
                    const res = await fetch(`${XANDEUM_CONFIG.MESH_API_URL}/api/pnodes`);
                    if (res.ok) {
                        const data = await res.json();
                        return Array.isArray(data) ? data : (data.nodes || []);
                    }
                } catch (e) {
                    console.warn('Failed to fetch from Mesh Backend, falling back...', e);
                }
            }

            // 3. Fallback: Client-Side Discovery (Limited on Vercel)
            console.log('Performing client-side pNode discovery (fallback)...');

            // Initial cluster nodes from RPC
            const clusterNodes = await this.connection.getClusterNodes();
            let allNodes: PNodeInfo[] = [...clusterNodes];
            const nodeMap = new Map<string, PNodeInfo>();
            clusterNodes.forEach(n => nodeMap.set(n.pubkey, n));

            // Seeds to query
            const MESH_SEEDS = [
                "173.212.203.145", "173.212.220.65", "161.97.97.41",
                "192.190.136.36", "192.190.136.37", "192.190.136.38",
                "45.84.138.15", "173.249.3.118"
            ];

            // Fetch Pod Credits first
            let creditMap = new Map<string, number>();
            try {
                const creditRes = await fetch("/api/podcredits");
                if (creditRes.ok) {
                    const creditData = await creditRes.json();
                    const creditList = Array.isArray(creditData) ? creditData : (creditData.credits || []);
                    if (Array.isArray(creditList)) {
                        creditList.forEach((c: any) => {
                            const key = c.pod_id || c.pubkey;
                            if (key) creditMap.set(key, c.credits || c.total_credits || 0);
                        });
                    }
                }
            } catch (e) { console.warn("Failed to fetch credits:", e); }

            // Query seeds (limited parallelism to avoid timeouts)
            // We only need ONE good seed to get the mesh, but we query a few to be safe
            for (const seedIp of MESH_SEEDS.slice(0, 3)) {
                try {
                    const url = `/api/pnodestats?ip=${seedIp}`;
                    const response = await fetch(url, { headers: { "Content-Type": "application/json" } });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.result && Array.isArray(data.result.pods)) {
                            data.result.pods.forEach((pod: any) => {
                                const existing = nodeMap.get(pod.pubkey) || { pubkey: pod.pubkey } as PNodeInfo;
                                nodeMap.set(pod.pubkey, {
                                    ...existing,
                                    gossip: existing.gossip || pod.address,
                                    rpc: existing.rpc || (pod.rpc_port ? `${pod.address.split(':')[0]}:${pod.rpc_port}` : null),
                                    version: pod.version ? `${pod.version} (Heidelberg)` : (existing.version ?? null),
                                    storage_committed: pod.storage_committed,
                                    storage_used: pod.storage_used,
                                    storage_usage_percent: pod.storage_usage_percent,
                                    uptime: pod.uptime,
                                    credits: creditMap.get(pod.pubkey) || 0
                                });
                            });
                            // If we successfully got data, we can likely stop or just continue to merge more
                            break;
                        }
                    }
                } catch (e) { /* ignore */ }
            }

            return Array.from(nodeMap.values());

        } catch (error) {
            console.error("Failed to fetch pNodes:", error);
            return [];
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
