
const { Connection } = require("@solana/web3.js");

const RUN = async () => {
    const connection = new Connection("https://api.devnet.xandeum.com:8899", "confirmed");
    try {
        const nodes = await connection.getClusterNodes();
        // Filter for nodes that have an RPC port (likely to respond to our proxy)
        const activeNodes = nodes.filter(n => n.rpc);
        console.log(`Found ${activeNodes.length} active nodes with RPC.`);
        if (activeNodes.length > 0) {
            console.log("Sample IP:", activeNodes[0].gossip.split(':')[0]);
        }
    } catch (e) {
        console.error(e);
    }
};

RUN();
