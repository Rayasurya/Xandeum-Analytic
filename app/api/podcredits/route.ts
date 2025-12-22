
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = "https://podcredits.xandeum.network/api/pods-credits";

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
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
