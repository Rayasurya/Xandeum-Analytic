import { PNodeInfo } from "./xandeum";

export const MOCK_PNODES: PNodeInfo[] = Array.from({ length: 202 }).map((_, i) => {
    const isActive = Math.random() > 0.1;
    const version = Math.random() > 0.8 ? "0.7.2" : "0.7.3";
    const region = Math.random() > 0.5 ? "Europe" : "North America";

    // Generate a stable-looking pubkey
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let pubkey = "";
    for (let j = 0; j < 44; j++) pubkey += chars.charAt(Math.floor(Math.random() * chars.length));

    // Specific logic to match screenshot for top nodes if needed
    if (i === 0) pubkey = "9faUshVg... (Mock)";

    return {
        pubkey,
        gossip: isActive ? `10.0.0.${i}:8001` : undefined,
        tpu: isActive ? `10.0.0.${i}:8004` : undefined,
        rpc: isActive ? `10.0.0.${i}:8899` : undefined,
        version: `${version} (Heidelberg)`,
        // We will need to extend PNodeInfo interface to support these new fields if we want to display them
    } as any; // Cast to any to bypass strict type for now until we update interface
});

export const MOCK_METRICS = {
    "9faUshVg": { capacity: "158.3248 GB", uptime: "8.7d", performance: 95, score: 99 },
    "default": { capacity: "169.5007 GB", uptime: "8.8d", performance: 95, score: 99 }
};
