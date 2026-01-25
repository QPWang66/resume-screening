import React, { useState } from 'react';
import { Download, Filter, Search, BarChart3 } from 'lucide-react';
import CandidateCard from './CandidateCard';

export default function ResultsDashboard({ results, onExport, onSelectCandidate }) {
    const { candidates, insights, session } = results;

    const [filterMode, setFilterMode] = useState('all'); // all, qualified, rejected

    const filteredCandidates = candidates.filter(c => {
        if (filterMode === 'qualified') return c.passed_dealbreakers;
        if (filterMode === 'rejected') return !c.passed_dealbreakers;
        return true;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Screening Results</h1>
                    <p className="text-gray-500">Found {session.qualified_count} qualified candidates from {session.total} resumes</p>
                </div>

                <div className="flex gap-3">
                    <button
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={onExport}
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stats / Insights Row (Placeholder for more complex charts) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Average Score</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {candidates.length > 0 ? Math.round(candidates.reduce((acc, c) => acc + (c.final_score || 0), 0) / candidates.length) : 0}
                        </p>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
                    <button
                        onClick={() => setFilterMode('all')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterMode === 'all' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        All Candidates <span className="opacity-60 ml-1">{candidates.length}</span>
                    </button>
                    <button
                        onClick={() => setFilterMode('qualified')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterMode === 'qualified' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Qualified <span className="opacity-60 ml-1">{session.qualified_count}</span>
                    </button>
                    <button
                        onClick={() => setFilterMode('rejected')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterMode === 'rejected' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Rejected <span className="opacity-60 ml-1">{candidates.length - session.qualified_count}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCandidates.map((c, i) => (
                        <CandidateCard
                            key={c.id}
                            candidate={c}
                            rank={i + 1}
                            onClick={() => onSelectCandidate(c.id)}
                        />
                    ))}
                </div>

                {filteredCandidates.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No candidates match this filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
