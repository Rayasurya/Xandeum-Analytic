
import React from 'react';
import { Zap } from 'lucide-react';

export default function RewardsDocs() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase tracking-widest">
                <Zap className="w-4 h-4" />
                Algorithm No. 002
            </div>
            <h1 className="text-4xl font-bold text-white">Yield & Rewards Mechanics</h1>
            <p className="text-gray-400">
                (Coming Soon) How credits are calculated and boost multipliers work.
            </p>
        </div>
    );
}
