const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

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

// Helper to make HTTP/HTTPS requests (bypassing fetch restrictions)
function makeRequest(urlStr, options = {}, body = null, timeout = 8000) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlStr);
        const lib = url.protocol === 'https:' ? https : http;

        const reqOpts = {
            method: options.method || 'GET',
            headers: options.headers || {},
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            timeout: timeout
        };

        const req = lib.request(reqOpts, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const json = JSON.parse(data);
                        resolve(json);
                    } catch (e) {
                        reject(new Error(`Invalid JSON response: ${e.message}`));
                    }
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (err) => reject(err));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timed out'));
        });

        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

async function getCredits() {
    try {
        console.log(`Fetching credits from ${CREDITS_API_URL}...`);
        const data = await makeRequest(CREDITS_API_URL);
        return data.credits || {};
    } catch (err) {
        console.warn('Failed to fetch credits:', err.message);
        return {};
    }
}

async function getMeshNodes() {
    // Try seeds until one works
    for (const ip of SEED_NODES) {
        const url = `http://${ip}:${MESH_RPC_PORT}/rpc`;
        try {
            console.log(`Querying seed ${ip}...`);
            const data = await makeRequest(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "get-pods-with-stats",
                params: []
            }), 8000);

            // Check for RPC error or valid result
            if (data.error) throw new Error(`RPC Error: ${data.error.message}`);

            const pods = data.result?.pods;
            if (!pods || !Array.isArray(pods)) {
                throw new Error('Invalid data format from seed');
            }

            console.log(`Successfully fetched ${pods.length} nodes from ${ip}`);
            return pods;
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
