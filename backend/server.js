const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Mesh seed nodes
const MESH_SEEDS = [
    "173.212.203.145",
    "173.212.220.65",
    "161.97.97.41",
    "192.190.136.36",
    "192.190.136.37",
    "192.190.136.38",
    "192.190.136.28",
    "192.190.136.29",
    "207.244.255.1",
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

// Cache for pNode data
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 seconds

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Query a single seed node
async function querySeed(seedIp) {
    const url = `http://${seedIp}:6000/rpc`;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "get-pods-with-stats",
                params: []
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.ok) {
            const data = await response.json();
            if (data.result && Array.isArray(data.result.pods)) {
                return data.result.pods;
            }
        }
    } catch (e) {
        // Silently ignore failed seeds
    }
    return [];
}

// Fetch pod credits
async function fetchPodCredits() {
    try {
        const response = await fetch("https://podcredits.xandeum.network/api/pods-credits", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            timeout: 5000
        });

        if (response.ok) {
            const data = await response.json();
            const creditList = Array.isArray(data) ? data : (data.credits || []);
            const creditMap = new Map();

            if (Array.isArray(creditList)) {
                creditList.forEach((c) => {
                    const key = c.pod_id || c.pubkey;
                    const score = c.credits || c.total_credits || 0;
                    if (key) creditMap.set(key, score);
                });
            }
            return creditMap;
        }
    } catch (e) {
        console.warn("Failed to fetch pod credits:", e.message);
    }
    return new Map();
}

// Discover all pNodes
async function discoverPNodes() {
    console.log(`[${new Date().toISOString()}] Starting mesh discovery...`);

    // Query all seeds in parallel
    const seedPromises = MESH_SEEDS.map(querySeed);
    const allResults = await Promise.all(seedPromises);

    // Merge results into a map by pubkey
    const nodeMap = new Map();

    allResults.flat().forEach((pod) => {
        if (!pod.pubkey) return;

        const existing = nodeMap.get(pod.pubkey) || {};
        nodeMap.set(pod.pubkey, {
            ...existing,
            pubkey: pod.pubkey,
            gossip: existing.gossip || pod.address,
            rpc: existing.rpc || (pod.rpc_port ? `${pod.address.split(':')[0]}:${pod.rpc_port}` : null),
            version: pod.version ? `${pod.version} (Heidelberg)` : (existing.version || null),
            storage_committed: pod.storage_committed || existing.storage_committed,
            storage_used: pod.storage_used || existing.storage_used,
            storage_usage_percent: pod.storage_usage_percent || existing.storage_usage_percent,
            uptime: pod.uptime || existing.uptime,
            rpc_port: pod.rpc_port || existing.rpc_port
        });
    });

    // Fetch and merge credits
    const creditMap = await fetchPodCredits();
    let matchCount = 0;

    nodeMap.forEach((node, pubkey) => {
        const credits = creditMap.get(pubkey) || 0;
        if (credits > 0) matchCount++;
        node.credits = credits;
    });

    const nodes = Array.from(nodeMap.values());

    // Sort: Active nodes first, then by pubkey
    nodes.sort((a, b) => {
        const aActive = a.rpc ? 1 : 0;
        const bActive = b.rpc ? 1 : 0;
        if (aActive !== bActive) return bActive - aActive;
        return (a.pubkey || '').localeCompare(b.pubkey || '');
    });

    console.log(`[${new Date().toISOString()}] Discovery complete. Found ${nodes.length} nodes. Credits matched: ${matchCount}`);

    return nodes;
}

// GET /api/pnodes - Returns all discovered pNodes
app.get('/api/pnodes', async (req, res) => {
    try {
        const now = Date.now();

        // Return cached data if still valid
        if (cachedData && (now - cacheTimestamp) < CACHE_TTL) {
            return res.json({
                success: true,
                cached: true,
                count: cachedData.length,
                data: cachedData
            });
        }

        // Refresh cache
        const nodes = await discoverPNodes();
        cachedData = nodes;
        cacheTimestamp = now;

        res.json({
            success: true,
            cached: false,
            count: nodes.length,
            data: nodes
        });
    } catch (error) {
        console.error("Error in /api/pnodes:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Xandeum Mesh Discovery Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`pNodes API: http://localhost:${PORT}/api/pnodes`);

    // Pre-warm cache on startup
    discoverPNodes().then(nodes => {
        cachedData = nodes;
        cacheTimestamp = Date.now();
        console.log(`Cache pre-warmed with ${nodes.length} nodes`);
    });
});
