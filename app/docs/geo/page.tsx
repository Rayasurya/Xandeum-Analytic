
import React from 'react';
import { Map } from 'lucide-react';

export default function GeoDocs() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-purple-500 font-mono text-xs uppercase tracking-widest">
                <Map className="w-4 h-4" />
                Infrastructure
            </div>
            <h1 className="text-4xl font-bold text-white">Network Topology</h1>
            <p className="text-gray-400">
                (Coming Soon) Understanding GOSSIP protocol and geographical distribution.
            </p>
        </div>
    );
}
