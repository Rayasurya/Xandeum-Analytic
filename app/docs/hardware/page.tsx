
import React from 'react';
import { Cpu } from 'lucide-react';

export default function HardwareDocs() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-pink-500 font-mono text-xs uppercase tracking-widest">
                <Cpu className="w-4 h-4" />
                Infrastructure
            </div>
            <h1 className="text-4xl font-bold text-white">Hardware Requirements</h1>
            <p className="text-gray-400">
                (Coming Soon) Recommended specifications for achieving "Excellent" grade.
            </p>
        </div>
    );
}
