export const XANDEUM_CONFIG = {
    PROTOCOL_VERSION: "v0.7.0",
    PROTOCOL_NAME: "Heidelberg",
    RPC_ENDPOINT: "https://api.devnet.xandeum.com:8899",
    NETWORK: "Devnet",

    // Mapping Agave/Solana versions to Xandeum Protocol names if needed
    VERSION_MAPPING: {
        "2.2.0": "v0.7.0 (Heidelberg)",
        "2.2.1": "v0.7.1 (Heidelberg)",
    } as Record<string, string>
};
