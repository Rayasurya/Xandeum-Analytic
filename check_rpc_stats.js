
const fetch = require('node-fetch');

async function check() {
    // A known seed IP from previous logs or config
    const seed = "162.55.244.250"; // Using one from the list in xandeum.ts or trying a known one
    // Or I can use a standard devnet RPC if it supports this method (unlikely, hence the proxy)
    // But I can run this script locally and if it fails (port block), I'll know.
    // Wait, local runtime allows port 6000? Maybe.
    // If not, I'll use the proxy URL I created! localhost:3000/api/pnodestats?ip=...

    // Actually, I can use the local proxy!
    try {
        const url = "http://localhost:3000/api/pnodestats?ip=seed1.xandeum.network";
        // Wait, seed1 DNS might not work, I need an IP.
        const seeds = ["162.55.244.250", "213.136.73.53"];

        for (const ip of seeds) {
            console.log(`Checking ${ip}...`);
            const res = await fetch(`http://localhost:3000/api/pnodestats?ip=${ip}`);
            if (res.ok) {
                const data = await res.json();
                if (data.result && data.result.pods && data.result.pods.length > 0) {
                    console.log("Found pods:", data.result.pods.length);
                    console.log("First pod sample:", data.result.pods[0]);
                    break;
                }
            } else {
                console.log("Failed:", res.status);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

check();
