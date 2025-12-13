const { Connection } = require("@solana/web3.js");

const RUN = async () => {
    const connection = new Connection("https://api.devnet.xandeum.com:8899", "confirmed");

    console.log("--- DEBUGGING REAL METRICS ---");

    try {
        // 1. Epoch Info
        const epochInfo = await connection.getEpochInfo();
        console.log("[Epoch]", epochInfo);
    } catch (e) {
        console.log("[Epoch] ERROR:", e.message);
    }

    try {
        // 2. Performance Samples (Real History?)
        const samples = await connection.getRecentPerformanceSamples(5);
        console.log("[PerformanceSamples]", samples);
        // sample has: numSlots, numTransactions, samplePeriodSecs, slot
        // TPS = numTransactions / samplePeriodSecs
    } catch (e) {
        console.log("[PerformanceSamples] ERROR:", e.message);
    }

    try {
        // 3. Supply / Storage hint?
        const supply = await connection.getSupply();
        console.log("[Supply]", supply.value.total);
    } catch (e) {
        console.log("[Supply] ERROR:", e.message);
    }
};

RUN();
