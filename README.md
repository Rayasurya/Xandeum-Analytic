# Xandeum Scope: Advanced Network Analytics

**Xandeum Scope** is a powerful, real-time analytics platform designed for the Xandeum storage-enabled blockchain. It goes beyond simple metrics to provide deep insights, AI-powered assistance, and comprehensive network health monitoring.

![Dashboard Preview](https://github.com/Rayasurya/Xandeum-Analytic/blob/main/public/demo-v2.gif?raw=true)

---

## 🚀 Key Features

### 🤖 AI-Powered Intelligence (RAG)
Integrated directly into the dashboard, the **AI Analyst** uses **Google Gemini 1.5 Flash** to answer questions about the network.
*   **Retrieval-Augmented Generation (RAG)**: The AI has read the entire documentation (Getting Started, Metrics, Health Score, Troubleshooting) and provides cited, fact-based answers.
*   **Context-Aware**: It knows the current dashboard state (e.g., "How many nodes are offline?") and uses real-time data in its responses.
*   **Deep Linking**: If the AI references a topic, it provides a direct link to the relevant documentation page.
*   **Auto-Nudge**: A smart tooltip suggests questions ("Ask me anything about Xandeum Nodes"). Users can dismiss this with a single click.

### 📊 Advanced Dashboard & Filtering
The dashboard is built for power users, offering granular control over data visibility.
*   **Multi-Dimensional Filtering**: Filter the node list by **Search** (Pubkey/IP), **Status** (Active/Inactive), **Country**, **Version** (Latest/Outdated), **Storage** (<100GB to >10TB), and **Health** (Excellent/Warning/Critical).
*   **Health Score Algorithm**: A custom 0-100 scoring system based on:
    *   **Uptime** (30%)
    *   **Version Currency** (30%)
    *   **Storage Commitment** (20%)
    *   **RPC Responsiveness** (20%)
*   **Interactive Charts**:
    *   **Version Distribution**: Pie chart showing network upgrade consensus.
    *   **Storage Committed**: Bar chart visualizing storage capacity tiers.
    *   **Geographic Spread**: Visualization of top node locations.

### 🗺️ Geospatial Intelligence (Leaflet Map)
A fully interactive global map visualizing the physical decentralization of the network.
*   **Cluster Mapping**: Nodes are grouped into clusters (circles with counts) that expand when clicked.
*   **Health-Coded Markers**: Individual node pins are color-coded by their Health Score (Green = Healthy, Orange = Warning, Red = Critical).
*   **Tooltips**: Hover over any pin to see the node's Pubkey, City, and Lat/Lon.

### 🔍 Deep Node Inspection
Clicking any node reveals the **Node Intelligence Panel**:
*   **Detailed Metrics**: View exact Storage Committed, Credits, Uptime, and Gossip Address.
*   **Health Breakdown**: See exactly *why* a node has a specific score (e.g., "Version: 40/40", "Uptime: 5/30").
*   **Export Features**:
    *   **Export HTML**: Download a professional **Node Report** for the selected node (offline viewable).
    *   **Export CSV**: Download the entire filtered node registry for external analysis.
*   **Deep Linking**: The URL updates automatically (e.g., `?node=8fn2...`), allowing you to share a direct link to a specific node's details.

### 📚 "Heavy" Documentation System
The platform includes a built-in documentation hub (`/docs`) covering:
*   **Getting Started**: Hardware specs, CLI installation, Firewall rules.
*   **Metrics**: PoPS Consensus, Sector Lifecycle, Skip Rates.
*   **Health Score**: The exact math behind the grading system.
*   **Troubleshooting**: Error codes, Log analysis (`journalctl`), and Network tools (`nc`, `curl`).

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **AI**: Google Generative AI SDK (`@google/generative-ai`), Gemini 1.5 Flash
*   **Styling**: Tailwind CSS, Shadcn/ui (Radix Primitives)
*   **Maps**: Leaflet, React Layout Masonry
*   **Data**: `@xandeum/web3.js` (RPC connection)
*   **Visualization**: Recharts (Graphs), Lucide React (Icons)

---

## 🏃‍♂️ How to Run

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/Rayasurya/Xandeum-Analytic.git
    cd Xandeum-Analytic
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment**:
    Create a `.env.local` file and add your Google AI API Key:
    ```bash
    GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
    ```

4.  **Start the development server**:
    ```bash
    npm run dev
    ```

5.  **Open your browser**:
    Navigate to [http://localhost:3000](http://localhost:3000) to launch Xandeum Scope.
