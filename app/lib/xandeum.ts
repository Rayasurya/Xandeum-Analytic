import { Connection, ContactInfo } from "@solana/web3.js";
import { XANDEUM_CONFIG } from "../config";

// Xandeum Devnet RPC Endpoint
const XANDEUM_RPC_ENDPOINT = XANDEUM_CONFIG.RPC_ENDPOINT;

export interface PNodeInfo extends ContactInfo {
    // version is inherited from ContactInfo (string | null)
    shredVersion?: number;
    featureSet?: number;
    tpuForwards?: string;
    tvu?: string;
    serveRepair?: string;
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
            const nodes = await this.connection.getClusterNodes();

            // Sort: Active nodes (with RPC/TPU APIs) first, then by pubkey
            return nodes.sort((a, b) => {
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
     * Get real network metrics from the RPC
     */
    async getNetworkMetrics() {
        try {
            const [epochInfo, perfSamples, supply] = await Promise.all([
                this.connection.getEpochInfo(),
                this.connection.getRecentPerformanceSamples(30),
                this.connection.getSupply()
            ]);

            return {
                epoch: epochInfo.epoch,
                tpsHistory: perfSamples.map((sample, i) => {
                    const timeOffset = i * (sample.samplePeriodSecs || 60) * 1000;
                    return {
                        time: new Date(Date.now() - timeOffset).toLocaleTimeString([], { hour12: false }),
                        tps: sample.numTransactions / sample.samplePeriodSecs
                    };
                }).reverse(),
                totalSupply: (supply.value.total / 1000000000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " SOL"
            };
        } catch (error) {
            console.error("Failed to fetch metrics:", error);
            return null;
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
     * Get formatted stats for dashboard
     */
    async getStats() {
        try {
            const nodes = await this.getPNodes();
            const activeNodes = nodes.filter(n => n.rpc).length;
            return {
                total: nodes.length,
                active: activeNodes,
                delinquent: nodes.length - activeNodes // Rough approximation
            };
        } catch (error) {
            console.error("Failed to fetch stats:", error);
            return { total: 0, active: 0, delinquent: 0 };
        }
    }
}
