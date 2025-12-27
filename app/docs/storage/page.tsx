
import React from 'react';
import { Database } from 'lucide-react';

export default function StorageDocs() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-blue-500 font-mono text-xs uppercase tracking-widest">
                <Database className="w-4 h-4" />
                Algorithm No. 003
            </div>
            <h1 className="text-4xl font-bold text-white">Storage Log-Curve</h1>
            <p className="text-gray-400">
                (Coming Soon) Deep dive into the logarithmic scoring model for storage.
            </p>
        </div>
    );
}
