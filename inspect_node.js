
const { Connection } = require("@solana/web3.js");

async function inspectNode() {
    const connection = new Connection("https://api.devnet.xandeum.com:8899", "confirmed");
    const nodes = await connection.getClusterNodes();
    console.log("Total Nodes:", nodes.length);
    if (nodes.length > 0) {
        console.log("Raw Node Sample:", JSON.stringify(nodes[0], null, 2));
        // Check for specific fields competitor mentioned
        const withShred = nodes.find(n => n.shredVersion);
        if (withShred) console.log("Node with Shred Version:", withShred.shredVersion);
    }
}

inspectNode().catch(console.error);
