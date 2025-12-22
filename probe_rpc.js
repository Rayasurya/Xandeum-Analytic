const fetch = require('node-fetch');
const { Connection } = require('@solana/web3.js');

const MAIN_RPC = "https://api.devnet.xandeum.com:8899";

async function probeNode(ip, port) {
    const url = `http://${ip}:${port}/rpc`; // Note: standard RPC might be at root or /rpc
    console.log(`Probing ${url}...`);
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout

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

        const data = await response.json();
        if (data.result) {
            console.log(`[FOUND_ACTIVE_NODE] ${ip}`);
            // console.log(JSON.stringify(data.result, null, 2));
            return true;
        }
    } catch (e) {
        // console.log(`Failed ${ip}:${port} - ${e.message}`);
    }
    return false;
}

async function run() {
    console.log("Fetching active nodes from main RPC...");
    const connection = new Connection(MAIN_RPC, "confirmed");
    const nodes = await connection.getClusterNodes();

    // Sort by active
    const activeNodes = nodes.filter(n => n.rpc);
    console.log(`Found ${activeNodes.length} active nodes. Scanning for pNode RPC (port 6000)...`);

    for (const node of activeNodes) {
        if (!node.gossip) continue;
        const ip = node.gossip.split(':')[0];

        // Try port 6000 usually
        const found = await probeNode(ip, 6000);
        if (found) break; // Found one, we are good!
    }
}

run();
