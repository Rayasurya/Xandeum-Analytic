import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    console.log("--> /api/geo hit");
    try {
        const body = await request.json();
        console.log("--> Request body length:", Array.isArray(body) ? body.length : "Not Array");

        // Validate input
        if (!Array.isArray(body)) {
            console.error("--> Invalid Input: Body is not array");
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // Proxy to ip-api.com (HTTP is fine server-side)
        console.log("--> Fetching from http://ip-api.com/batch...");
        const response = await fetch("http://ip-api.com/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        console.log("--> Response status:", response.status);

        if (!response.ok) {
            console.error("--> Upstream API failed:", response.status, response.statusText);
            return NextResponse.json({ error: 'Upstream API Failed' }, { status: response.status });
        }

        const data = await response.json();
        console.log("--> Response data length:", Array.isArray(data) ? data.length : "Not Array");
        return NextResponse.json(data);

    } catch (error) {
        console.error("--> Geo Proxy Internal Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
