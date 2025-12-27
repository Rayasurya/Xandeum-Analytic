import { PNodeInfo } from "./xandeum";

// Health Score Calculation (0-100)
export interface HealthScore {
    total: number;
    status: "HEALTHY" | "WARNING" | "CRITICAL";
    breakdown: {
        version: { score: number; max: number };
        uptime: { score: number; max: number };
        storage: { score: number; max: number };
        rpc: { score: number; max: number };
    };
}

// Helper to compare SemVer-like version strings
export const compareVersions = (v1: string, v2: string) => {
    return v1.localeCompare(v2, undefined, { numeric: true, sensitivity: 'base' });
};

/**
 * Calculates the holistic Health Score of a pNode.
 * 
 * Algorithm Highlights:
 * 1. Majority Rules Versioning: Nodes on the most common version (or newer) get 100pts.
 *    This prevents penalizing stable nodes just because a "nightly" build exists.
 * 
 * 2. Sigmoid Uptime: Non-linear curve that heavily validates >99% uptime.
 * 
 * 3. Logarithmic Storage: Diminishing returns for massive storage. 
 *    Tuned to treat >1TB as Excellent (100) and >300GB as Good (~70).
 * 
 * 4. Dynamic Credits: Normalized against the network's top earner.
 */
export const calculateHealthScore = (node: any, maxNetworkCredits: number, sortedVersions: string[] = [], mostCommonVersion: string = ""): HealthScore => {
    let versionScore = 0;
    let uptimeScore = 0;
    let storageScore = 0;
    let creditsScore = 0;
    let weightUptime = 0.35;
    let weightStorage = 0.30;
    let weightCredits = 0.20;
    let weightVersion = 0.15;

    // 1. Version Score (15%) - Majority Rules
    const currentVersion = node?.version?.split(" ")[0] || "";

    if (mostCommonVersion && currentVersion) {
        if (currentVersion === mostCommonVersion) {
            versionScore = 100; // Exact match with majority
        } else if (compareVersions(currentVersion, mostCommonVersion) > 0) {
            versionScore = 100; // Newer than majority (Leading edge)
        } else {
            // Older than majority
            // Find distance in the sorted list
            const majorIndex = sortedVersions.indexOf(mostCommonVersion);
            const currentIndex = sortedVersions.indexOf(currentVersion);

            if (majorIndex !== -1 && currentIndex !== -1) {
                // Calculate penalty based on how many versions behind
                const versionLag = Math.max(0, currentIndex - majorIndex);
                versionScore = Math.max(0, 100 - (versionLag * 30)); // -30 points per version step behind
            } else {
                versionScore = 0; // Version not found in list (Unknown)
            }
        }
    } else if (sortedVersions.length > 0) {
        // Fallback if no majority detected (e.g. tie), use Top version as standard
        const rank = sortedVersions.indexOf(currentVersion);
        if (rank === 0) versionScore = 100;
        else versionScore = Math.max(0, 100 - (rank * 20));
    }

    // 2. Uptime Score (35%) - Sigmoid Vitality Curve
    const uptimeSeconds = node?.uptime || 0;
    const uptimeDays = uptimeSeconds / 86400;
    uptimeScore = 100 / (1 + Math.exp(-2.0 * (uptimeDays - 0.5)));

    // 3. Storage Score (30%) - Tuned Logarithmic Scale
    // Tuned: 1TB = 100. 500GB = ~85. 100GB = ~50.
    const storageTB = (node?.storage_committed || 0) / (1024 * 1024 * 1024 * 1024);
    // Formula: 25 * log2(15 * TB + 1). 
    storageScore = Math.min(100, 25 * Math.log2((15 * storageTB) + 1));

    // 4. Credits Score (20%) - Dynamic Scaling relative to Network Max
    const credits = node?.credits || 0;
    if (maxNetworkCredits > 0) {
        creditsScore = Math.min(100, (credits / maxNetworkCredits) * 100);
    } else if (credits > 0) {
        creditsScore = 100; // Fallback if max is 0 but node has credits
    }

    // RPC Bonus
    if (!node?.rpc) {
        uptimeScore *= 0.8; // Penalty for no RPC
    }

    const total = Math.round(
        (versionScore * weightVersion) +
        (uptimeScore * weightUptime) +
        (storageScore * weightStorage) +
        (creditsScore * weightCredits)
    );

    // New Thresholds: >70 Excellent, <30 Critical
    let status: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
    if (total < 30) {
        status = "CRITICAL";
    } else if (total < 70) {
        status = "WARNING";
    }

    return {
        total,
        status,
        breakdown: {
            version: { score: Math.round(versionScore), max: 100 },
            uptime: { score: Math.round(uptimeScore), max: 100 },
            storage: { score: Math.round(storageScore), max: 100 },
            rpc: { score: Math.round(creditsScore), max: 100 },
        },
    };
};
