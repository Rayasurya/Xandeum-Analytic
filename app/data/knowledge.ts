export const XANDEUM_KNOWLEDGE_BASE = `
# XANDEUM NETWORK KNOWLEDGE BASE (v2.0 - Heavy Technical)

## 1. SYSTEM ARCHITECTURE & REQUIREMENTS
Xandeum uses a hybrid consensus: **Proof of History (PoH)** (Validator Layer) + **Proof of Physical Storage (PoPS)** (Storage Layer).
- **Validator Layer**: High-frequency block production. Requires single-core speed.
- **Storage Layer**: Manages "pDisks" (Sealed Sectors). Requires high IOPS.

**Hardware Spec (Recommended)**:
- **CPU**: 32 Cores / 64 Threads (AMD EPYC/Threadripper)
- **RAM**: 512 GB DDR5 ECC
- **Disk**: 2TB NVMe RAID 1 (System) + 4TB+ Enterprise NVMe (Ledger)
- **Network**: 10 Gbps Symmetric Fiber

## 2. INSTALLATION (CLI)
1. **Bootstrap**: \`sh -c "$(curl -sSfL https://sh.xandeum.network/install.sh)"\`
2. **Ports to Open**:
   - **8899 (TCP)**: RPC Interface (Essential).
   - **8001 (TCP/UDP)**: TPU (Transaction Processing).
   - **8000 (TCP/UDP)**: Gossip Protocol.
3. **Service Management**:
   - Start: \`sudo systemctl start xandeum-validator\`
   - Status: \`sudo systemctl status xandeum-validator\`
   - Logs: \`sudo journalctl -u xandeum-validator -f -o cat\`

## 3. METRICS & CONSENSUS (PoPS)
**Proof of Physical Storage (PoPS)** Cycle:
1. **Pledging**: Allocating a 64GiB Sector.
2. **Sealing**: Generating crypto-unique data (IO heavy).
3. **Proving**: Responding to a challenge query.
   - **Timeout**: Must respond within **400ms**. FAILS if disk is slow (HDD).
   
**Key Metrics**:
- **Storage Committed**: Total bytes sealed and active.
- **Sector States**: Active (Earning) -> Sealing (Preparing) -> Faulty (Failed Proof).
- **Skip Rate**: % of blocks missed. >25% is CRITICAL (Delinquency risk).
- **Gossip Propagation**: Target < 800ms.

## 4. HEALTH SCORE ALGORITHM (0-100)
Recalculated every Epoch (approx 2 days).
**Formula**: \`H = (0.4 * Uptime) + (0.3 * Storage) + (0.2 * RPC) + (0.1 * Version)\`

**Weights**:
- **40% Uptime**: Continuous reachability. Resets to 0 on restart.
- **30% Storage**: Consistency of PoPS proofs.
- **20% RPC**: Port 8899 availability.
- **10% Version**: Latest binary = 100%.

**Grading**:
- **Green (Healthy)**: 75-100 (Full Rewards)
- **Yellow (Warning)**: 50-74 (0.5x Rewards)
- **Red (Critical)**: 0-49 (NO Rewards + Risk of Slashing if < 50% uptime)

## 5. TROUBLESHOOTING & ERROR CODES
**Common Error Codes**:
- **0x1001 (Socket Bind Failed)**: Port 8899/8001 busy. Check \`lsof -i :8899\`.
- **0x2004 (PoPS Timeout)**: Read latency > 400ms. Upgrade to NVMe.
- **0x3012 (Gossip Lag)**: Network congestion. Check firewall/bandwidth.
- **0x4000 (Version Mismatch)**: Binary deprecated. Update immediately.

**Diagnostics**:
- **Check Gossip**: \`xandeum-validator gossip --monitor\` (Target > 2Mbps)
- **Check RPC**: \`nc -zv <IP> 8899\`
- **Grep Errors**: \`sudo journalctl -u xandeum-validator | grep "panic"\`

## 6. DOCUMENTATION LINKS
- Health Scores: [Algorithm Details](/docs/health-score)
- Troubleshooting: [Error Codes](/docs/troubleshooting)
- Getting Started: [Installation](/docs/getting-started)
- Metrics: [PoPS Logic](/docs/metrics)
`;
