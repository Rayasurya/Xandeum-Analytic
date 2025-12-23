const fs = require('fs');
const path = require('path');

// Seed nodes to query (port 6000)
const SEED_NODES = [
    '88.200.77.100', // Primary
    '173.212.203.145',
    '173.212.220.65',
    '161.97.97.41',
    '192.190.136.36',
    '192.190.136.37',
    '192.190.136.38',
    '192.190.136.28',
    '192.190.136.29',
    '207.244.255.1',
    '45.84.138.15',
    '173.249.3.118',
    '84.21.171.129',
    '161.97.185.116',
    '154.38.169.212',
    '152.53.155.15',
    '154.38.185.152',
    '173.249.59.66',
    '45.151.122.60',
    '152.53.236.91',
    '173.249.54.191',
    '45.151.122.71'
];

const MESH_RPC_PORT = 6000;
const CREDITS_API_URL = 'https://podcredits.xandeum.network/api/pods-credits';
const OUTPUT_FILE = path.join(__dirname, '../pnodes.json');

async function fetchWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

async function getCredits() {
    try {
        console.log(`Fetching credits from ${CREDITS_API_URL}...`);
        const res = await fetchWithTimeout(CREDITS_API_URL);
        if (!res.ok) throw new Error(`Credits API error: ${res.status}`);
        const data = await res.json();
        return data.credits || {}; // returns { "ip": creditAmount, ... }
    } catch (err) {
        console.warn('Failed to fetch credits:', err.message);
        return {};
    }
}

async function getMeshNodes() {
    // Try seeds until one works
    for (const ip of SEED_NODES) {
        const url = `http://${ip}:${MESH_RPC_PORT}/pnodes`;
        try {
            console.log(`Querying seed ${ip}...`);
            const res = await fetchWithTimeout(url, {}, 8000);
            if (!res.ok) throw new Error(`Seed ${ip} returned ${res.status}`);
            const data = await res.json();

            // Data format check
            if (!data || !data.nodes) {
                throw new Error('Invalid data format from seed');
            }

            console.log(`Successfully fetched ${data.nodes.length} nodes from ${ip}`);
            return data.nodes;
        } catch (err) {
            console.warn(`Failed to query seed ${ip}:`, err.message);
            // Continue to next seed
        }
    }
    throw new Error('All seed nodes failed');
}

async function main() {
    try {
        const [nodes, creditsMap] = await Promise.all([
            getMeshNodes(),
            getCredits()
        ]);

        // Merge credits into nodes
        const enrichedNodes = nodes.map(node => {
            // Find credit for this node's IP
            // API returns credits keyed by IP string
            const podCredits = creditsMap[node.ip] || 0;

            return {
                ...node,
                pod_credits: podCredits
            };
        });

        const output = {
            updatedAt: new Date().toISOString(),
            count: enrichedNodes.length,
            nodes: enrichedNodes
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
        console.log(`Successfully wrote ${enrichedNodes.length} nodes to ${OUTPUT_FILE}`);

    } catch (err) {
        console.error('Fatal error in scraper:', err);
        process.exit(1);
    }
}

main();
