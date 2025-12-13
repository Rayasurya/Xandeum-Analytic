const { Connection } = require("@solana/web3.js");

const RUN = async () => {
    const connection = new Connection("https://api.devnet.xandeum.com:8899", "confirmed");

    console.log("--- DEBUGGING NODE COUNTS ---");

    try {
        // Method 1: Current Implementation (Gossip Table)
        const clusterNodes = await connection.getClusterNodes();
        console.log(`[getClusterNodes] Count: ${clusterNodes.length}`);
        console.log(`[getClusterNodes] Sample:`, clusterNodes[0]);
    } catch (e) {
        console.log("[getClusterNodes] ERROR:", e.message);
    }

    try {
        // Method 2: Vote Accounts (Validators)
        const voteAccounts = await connection.getVoteAccounts();
        const totalValidators = voteAccounts.current.length + voteAccounts.delinquent.length;
        console.log(`[getVoteAccounts] Count: ${totalValidators} (Current: ${voteAccounts.current.length}, Delinquent: ${voteAccounts.delinquent.length})`);
        if (voteAccounts.current.length > 0) {
            console.log(`[getVoteAccounts] Sample:`, voteAccounts.current[0]);
        }
    } catch (e) {
        console.log("[getVoteAccounts] ERROR:", e.message);
    }
};

RUN();
