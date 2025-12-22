# Xandeum pNode Mesh Discovery Server

A standalone Node.js server that discovers pNodes via mesh seeds and exposes the data via a public API.

## Features
- Queries multiple mesh seed nodes for pNode data
- Caches results for 30 seconds to reduce load
- Enables CORS for cross-origin requests
- Provides REST API for frontend consumption

## Setup

```bash
cd backend
npm install
```

## Run

```bash
node server.js
```

Or with PM2 for production:
```bash
pm2 start server.js --name xandeum-mesh
```

## API Endpoints

- `GET /api/pnodes` - Returns all discovered pNodes
- `GET /health` - Health check

## Environment Variables

- `PORT` - Server port (default: 3001)

## Deploy to VPS

1. SSH into your VPS
2. Clone this folder
3. Run `npm install`
4. Start with PM2: `pm2 start server.js --name xandeum-mesh`
5. Set up nginx reverse proxy to expose port 3001
