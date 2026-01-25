import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProgressTracker({ session, onComplete }) {
    // session has total_resumes, processed_count, qualified_count
    const progress = session.total_resumes > 0
        ? Math.round((session.processed_count / session.total_resumes) * 100)
        : 0;

    useEffect(() => {
        if (session.status === 'completed') {
            onComplete();
        }
    }, [session.status, onComplete]);

    return (
        <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Screening in Progress</h2>
                <p className="text-gray-500">AI is reading and scoring each resume...</p>
            </div>

            <div className="relative pt-8 pb-12">
                {/* Bar */}
                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Stats */}
                <div className="absolute top-0 right-0 transform -translate-y-full mb-2">
                    <span className="text-2xl font-bold text-primary-600">{progress}%</span>
                </div>

                <div className="grid grid-cols-3 gap-8 mt-8">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-sm text-gray-500 mb-1">Processed</div>
                        <div className="text-2xl font-semibold text-gray-900">
                            {session.processed_count} <span className="text-gray-400 text-lg font-normal">/ {session.total_resumes}</span>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-sm text-gray-500 mb-1">Qualified</div>
                        <div className="text-2xl font-semibold text-green-600">
                            {session.qualified_count}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-sm text-gray-500 mb-1">Rejected</div>
                        <div className="text-2xl font-semibold text-red-500">
                            {session.processed_count - session.qualified_count}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing batch... do not close this window</span>
                </div>
            </div>
        </div>
    );
}
