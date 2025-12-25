export const XANDEUM_KNOWLEDGE_BASE = `
# XANDEUM NETWORK KNOWLEDGE BASE

## 1. GENERAL & GETTING STARTED
- **What is a pNode?**: A pNode (Provider Node) is a server that participates in the Xandeum decentralized storage network. Node operators pledge storage capacity and earn rewards (POD Credits) for maintaining reliable, high-performance nodes.
- **What is Xandeum Scope?**: The real-time analytics dashboard for monitoring pNodes. It tracks health, performance, storage, and earnings.
- **Key Concepts**:
  - **Storage Committed**: Disk space cryptographically pledged to the network.
  - **PoPS**: Proof of Physical Storage - the consensus mechanism.

### Minimum Hardware Requirements
- **CPU**: 12+ cores (24 threads)
- **RAM**: 128GB (ECC preferred)
- **Disk**: 500GB NVMe (System) + 2TB+ NVMe (Ledger, high TBW)
- **Network**: 1 Gbps symmetric fiber connection
- **Ports**: 8899 (RPC) and 8001 (TPU) must be open.

## 2. HEALTH SCORE LOGIC
The Health Score is a 0-100 metric indicating node reliability.
**Formula**:
- **40% Uptime**: Continuous online presence. Resets on restart.
- **30% Storage Consistency**: Proof that pledged storage is available.
- **20% RPC Status**: Port 8899 accessibility from the internet.
- **10% Version Freshness**: Running the latest validator software.

**Thresholds**:
- **Healthy (Green, ≥ 75)**: Node is performing well. Eligible for full rewards.
- **Warning (Yellow, 50-74)**: Performance grading. Check latency or version.
- **Critical (Red, < 50)**: Immediate action required. Risk of penalties.

## 3. FREQUENTLY ASKED QUESTIONS (FAQ)
**Q: Why does my node show as 'Inactive'?**
A: Usually means RPC port 8899 is unreachable. Check firewalls, router forwarding, or if the service is running (\`systemctl status xandeum-validator\`).

**Q: How do I update my node software?**
A: 
1. Check version: \`xandeum-validator --version\`
2. Download latest release.
3. Stop service: \`sudo systemctl stop xandeum-validator\`
4. Replace binary.
5. Start service: \`sudo systemctl start xandeum-validator\`

**Q: Why is my uptime score low?**
A: It resets on every restart. Use a UPS and avoid unnecessary reboots.

**Q: How do I check my rewards?**
A: Rewards (POD Credits) are calculated based on Health Score and Storage. Check the "Rewards" tab in the dashboard.

**Q: Can I export data?**
A: Yes, use the "Export CSV" button on the dashboard.

**Q: How is geolocation determined?**
A: By IP address. VPNs may show incorrect locations.

## 4. TROUBLESHOOTING
**Low Health Score (< 75)**:
- **High Latency**: Upgrade internet to 1Gbps.
- **Storage Failures**: Check \`df -h\` to ensure drives are mounted.
- **Old Version**: Update software.

**CLI Commands**:
- \`xandeum-validator --version\`: Check version.
- \`xandeum-validator monitor\`: Local dashboard.
- \`xandeum-validator gossip\`: Check cluster connection.
- \`nc -zv <ip> 8899\`: Check port visibility.

## 5. DOCUMENTATION LINKS
- Health Scores: [Learn more](/docs/health-score)
- Troubleshooting: [Guide](/docs/troubleshooting)
- Getting Started: [Docs](/docs/getting-started)
- FAQ: [FAQ](/docs/faq)
- Metrics: [Metrics](/docs/metrics)
`;
