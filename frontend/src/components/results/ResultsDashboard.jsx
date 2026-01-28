import React, { useState } from 'react';
import { Download, Filter, Search, BarChart3, SlidersHorizontal } from 'lucide-react';
import CandidateCard from './CandidateCard';

export default function ResultsDashboard({ results, onExport, onSelectCandidate }) {
    const { candidates, session } = results;
    const [filterMode, setFilterMode] = useState('all'); // all, qualified, rejected

    const filteredCandidates = candidates.filter(c => {
        if (filterMode === 'qualified') return c.passed_dealbreakers;
        if (filterMode === 'rejected') return !c.passed_dealbreakers;
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-enter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-secondary/10 pb-8">
                <div>
                    <p className="font-mono text-sm text-secondary/50 uppercase tracking-widest mb-2">Screening Complete</p>
                    <h1 className="text-5xl font-display font-semibold text-secondary">
                        Found <span className="text-primary">{session.qualified_count}</span> <br />
                        Matches
                    </h1>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onExport}
                        className="btn-primary py-2 px-6 text-sm shadow-sharp hover:shadow-sharp-lg flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>EXPORT CSV</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-white rounded-full border border-secondary/20 p-1 flex items-center shadow-sm">
                        <button
                            onClick={() => setFilterMode('all')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filterMode === 'all' ? 'bg-secondary text-white' : 'text-secondary/60 hover:text-secondary'}`}
                        >
                            ALL <span className="text-xs opacity-60 ml-1 font-mono">({candidates.length})</span>
                        </button>
                        <button
                            onClick={() => setFilterMode('qualified')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filterMode === 'qualified' ? 'bg-accent-green text-white' : 'text-secondary/60 hover:text-accent-green'}`}
                        >
                            QUALIFIED <span className="text-xs opacity-60 ml-1 font-mono">({session.qualified_count})</span>
                        </button>
                        <button
                            onClick={() => setFilterMode('rejected')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filterMode === 'rejected' ? 'bg-accent-red text-white' : 'text-secondary/60 hover:text-accent-red'}`}
                        >
                            REJECTED <span className="text-xs opacity-60 ml-1 font-mono">({candidates.length - session.qualified_count})</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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
                    <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-secondary/10 rounded-3xl bg-white/30 text-center">
                        <SlidersHorizontal className="w-12 h-12 text-secondary/20 mb-4" />
                        <p className="font-serif text-xl text-secondary">No candidates match this filter.</p>
                        <p className="text-secondary/50 mt-1">Try adjusting criteria or viewing all.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
