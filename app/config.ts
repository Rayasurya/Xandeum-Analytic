export const XANDEUM_CONFIG = {
    PROTOCOL_VERSION: "v0.7.0",
    PROTOCOL_NAME: "Heidelberg",
    RPC_ENDPOINT: "https://api.devnet.xandeum.com:8899",
    NETWORK: "Devnet",

    // External Mesh Discovery API (set this when deploying to Vercel)
    // Example: https://your-vps-domain.com or http://your-vps-ip:3001
    // Use the GitHub Actions dataset by default for consistent local/prod verification
    MESH_API_URL: process.env.NEXT_PUBLIC_MESH_API_URL || "https://raw.githubusercontent.com/Rayasurya/Xandeum-Analytic/dataset/pnodes.json",

    // Mapping Agave/Solana versions to Xandeum Protocol names if needed
    VERSION_MAPPING: {
        "2.2.0": "v0.7.0 (Heidelberg)",
        "2.2.1": "v0.7.1 (Heidelberg)",
    } as Record<string, string>
};
