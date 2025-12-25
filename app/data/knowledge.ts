export const XANDEUM_KNOWLEDGE_BASE = `
# XANDEUM NETWORK KNOWLEDGE BASE

## KEY METRICS DEFINITIONS
- **Health Score**: A composite metric (0-100) indicating node reliability. 
  - Calculated based on: Uptime (40%), Storage Consistency (30%), Latency (20%), and Version Freshness (10%).
  - **Healthy (Green)**: Score ≥ 75. Node is performing well.
  - **Warning (Yellow)**: Score 50-74. specific metrics (usually latency or version) are degrading.
  - **Critical (Red)**: Score < 50. Immediate action required.
- **Storage Committed**: The amount of disk space a pNode has cryptographically pledged to the network.
- **RPC/TPU**: Remote Procedure Call / Transaction Processing Unit ports. Must be open for the node to be "Active".

## TROUBLESHOOTING GUIDES

### Node is "Inactive" or "Offline"
1. **Check Internet**: Ensure the server has stable connectivity.
2. **Check Ports**: Verify ports 8899 (RPC) and 8001 (TPU) are open and forwarded.
   - Command: \`nc -zv <your-ip> 8899\`
3. **Check Service Status**: 
   - Linux: \`systemctl status xandeum-validator\`
4. **View Logs**:
   - Command: \`tail -f /var/log/xandeum.log\`

### Low Health Score (< 75)
- **High Latency**: Check your internet speed. Minimum 1Gbps up/down is recommended.
- **Storage Failures**: Check disk space. Ensure the pledged storage volume is mounted.
   - Command: \`df -h\`
- **Old Version**: Update your node software.

## CLI COMMAND REFERENCE
- \`xandeum-validator --version\`: Check current installed version.
- \`xandeum-validator monitor\`: View local status dashboard.
- \`xandeum-validator gossip\`: Check connection to the cluster.
- \`solana config get\`: (Legacy) Check underlying Solana-based configuration.

## NETWORK REQUIREMENTS
- **CPU**: 12 cores / 24 threads minimum.
- **RAM**: 128GB minimum (ECC recommended).
- **Disk**: 
  - System: 500GB NVMe
  - Ledger: 2TB NVMe (High TBW)
- **Bandwidth**: 1 Gbps symmetric fiber.
`;
