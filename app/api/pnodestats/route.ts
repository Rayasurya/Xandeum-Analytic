import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get('ip');

    if (!ip) {
        return NextResponse.json({ error: 'IP parameter is required' }, { status: 400 });
    }

    // Construct the pNode RPC URL
    const url = `http://${ip}:6000/rpc`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        // Use specific node-fetch
        // @ts-ignore
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "get-pods-with-stats",
                params: []
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            return NextResponse.json({ error: `Upstream error: ${response.status}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        // console.error(`Proxy failed for ${url}:`, error.message);
        return NextResponse.json({ error: `Failed to fetch: ${error.message}` }, { status: 500 });
    }
}
