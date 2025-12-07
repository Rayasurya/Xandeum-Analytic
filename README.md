# Xandeum Analytics Platform

This is a dashboard I built to monitor Xandeum pNodes. It fetches live data explicitly using the `getClusterNodes` method from the Solana/Xandeum RPC.

![Dashboard Preview](https://github.com/Rayasurya/Xandeum-Analytic/blob/main/public/demo.gif?raw=true)

## What it does

- **Live Data**: Connects directly to the `Xandeum Devnet` (rpc: https://api.devnet.xandeum.com:8899).
- **Data Authenticity**: View raw JSON for every node and verify the RPC connection in Settings.
- **Analytics**: Visualizes software version distribution and network status with interactive charts.
- **Node Explorer**: Search nodes, view detailed raw JSON data, and filter results.
- **Theme Support**: Includes both dark and light modes (customized with Xandeum brand colors).

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS + shadcn/ui components
- **Data**: `@xandeum/web3.js`

## How to Run

1. Clone the repo:
   ```bash
   git clone https://github.com/Rayasurya/Xandeum-Analytic.git
   ```

2. Install packages:
   ```bash
   npm install
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view it.
