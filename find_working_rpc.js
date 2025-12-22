
const fetch = require('node-fetch');
const { Connection } = require("@solana/web3.js");

async function run() {
    const connection = new Connection("https://api.devnet.xandeum.com:8899", "confirmed");
    try {
        const nodes = await connection.getClusterNodes();
        const activeCandidates = nodes.filter(n => n.rpc).map(n => n.gossip.split(':')[0]);

        console.log(`Testing ${activeCandidates.length} candidates...`);

        for (const ip of activeCandidates) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 2000);

                const res = await fetch(`http://localhost:3000/api/pnodestats?ip=${ip}`, {
                    signal: controller.signal
                });
                clearTimeout(timeout);

                if (res.ok) {
                    const data = await res.json();
                    if (data.result && data.result.pods) {
                        console.log(`SUCCESS: Found working node ${ip}`);
                        console.log("Sample Pod Data:", JSON.stringify(data.result.pods[0], null, 2));
                        break;
                    }
                }
            } catch (e) {
                // console.log(`Failed ${ip}`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

run();
