import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProgressTracker({ session, onComplete }) {
    const progress = session.total_resumes > 0
        ? Math.round((session.processed_count / session.total_resumes) * 100)
        : 0;

    useEffect(() => {
        if (session.status === 'completed') {
            onComplete();
        }
    }, [session.status, onComplete]);

    return (
        <div className="max-w-xl mx-auto text-center space-y-12 py-20 animate-enter">
            <div className="space-y-4">
                <div className="w-20 h-20 mx-auto border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                <h2 className="text-4xl font-display font-medium text-secondary">Analyzing Candidates</h2>
                <p className="font-mono text-sm text-secondary/60 uppercase tracking-widest">
                    AI Inference Engine Active
                </p>
            </div>

            <div className="relative">
                <div className="h-16 w-full bg-white border-2 border-secondary rounded-xl overflow-hidden shadow-sharp relative">
                    <motion.div
                        className="h-full bg-primary relative overflow-hidden"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center mix-blend-difference">
                        <span className="font-mono font-bold text-2xl text-white">{progress}%</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="p-4 rounded-xl border-2 border-secondary/10 bg-white/50">
                        <div className="font-mono text-xs text-secondary/40 mb-1">PROCESSED</div>
                        <div className="text-2xl font-serif text-secondary">{session.processed_count}/{session.total_resumes}</div>
                    </div>
                    <div className="p-4 rounded-xl border-2 border-secondary/10 bg-white/50">
                        <div className="font-mono text-xs text-secondary/40 mb-1">QUALIFIED</div>
                        <div className="text-2xl font-serif text-accent-green">{session.qualified_count}</div>
                    </div>
                    <div className="p-4 rounded-xl border-2 border-secondary/10 bg-white/50">
                        <div className="font-mono text-xs text-secondary/40 mb-1">REJECTED</div>
                        <div className="text-2xl font-serif text-accent-red">
                            {Math.max(0, session.processed_count - session.qualified_count)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
