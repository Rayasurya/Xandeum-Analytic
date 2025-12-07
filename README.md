# Xandeum Analytics Platform

A professional, real-time analytics dashboard for monitoring Xandeum Service Provider Nodes (pNodes). Built with Next.js 15, Tailwind CSS, and shadcn/ui.

![Dashboard Preview](https://github.com/Rayasurya/Xandeum-Analytic/raw/main/public/preview.png)
*(Note: You can add a preview screenshot to `public/preview.png`)*

## Features

- **Live Network Stats**: Real-time fetching of pNode data via standard Solana RPC (`getClusterNodes`).
- **Xandeum Branding**: Custom Light/Dark themes using Xandeum's official Purple & Cyan identity.
- **Professional UI**: 
  - "App Shell" layout with persistent sidebar.
  - Equidistant stats cards.
  - Interactive table with integrated search, filtering, and copy-ID functionality.
- **Interactive Feedback**: Toast notifications for user actions (Export, Filter, etc.).

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Integration**: `@xandeum/web3.js` / `@solana/web3.js`

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rayasurya/Xandeum-Analytic.git
   cd Xandeum-Analytic
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

1. Push your code to GitHub.
2. Import the project in Vercel.
3. Deploy! (No special environment variables required for Devnet access).

## Submitted by
Rayasurya
