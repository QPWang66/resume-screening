import React from 'react';
import { Check, X, FileText, ChevronRight, Star, AlertTriangle, ExternalLink } from 'lucide-react';

const API_Base = 'http://localhost:8000/api';

export default function CandidateCard({ candidate, rank, onClick, sessionId }) {
    const isQualified = candidate.passed_dealbreakers;
    const isSkipped = candidate.skipped;
    const score = candidate.final_score || 0;

    const handleViewPdf = (e) => {
        e.stopPropagation();
        window.open(`${API_Base}/screening/${sessionId}/resume/${candidate.id}`, '_blank');
    };

    // Handle skipped/failed PDF extraction
    if (isSkipped) {
        return (
            <div
                className="group relative bg-white border-2 border-dashed border-accent-yellow/50 rounded-xl p-6 opacity-70"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg font-mono bg-accent-yellow/10 border-2 border-accent-yellow/30 text-accent-yellow">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-serif font-bold text-lg text-secondary line-clamp-1">
                                {candidate.filename.replace('.pdf', '')}
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-mono text-secondary/50">
                                <FileText className="w-3 h-3" />
                                <span>PDF_DOCUMENT</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-start gap-2 p-3 bg-accent-yellow/5 rounded-lg border border-accent-yellow/20">
                        <AlertTriangle className="w-4 h-4 text-accent-yellow flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-secondary/80">Could not process this resume</p>
                            <p className="text-xs text-secondary/50 mt-1">{candidate.extraction_warning}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-secondary/5">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-accent-yellow/10 text-accent-yellow uppercase tracking-wider">
                            <AlertTriangle className="w-3 h-3" /> Skipped
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`group relative bg-white border-2 rounded-xl p-6 transition-all duration-300 cursor-pointer overflow-hidden ${!isQualified
                    ? 'border-secondary/10 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 hover:border-secondary/30'
                    : 'border-secondary hover:border-primary hover:-translate-y-1 hover:shadow-sharp'
                }`}
        >
            {/* Top Banner */}
            <div className="flex justify-between items-start mb-4 relative z-10 gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg font-mono font-bold text-lg border-2 ${rank === 1 ? 'bg-accent-yellow border-secondary text-secondary shadow-sm' :
                            'bg-background border-secondary/10 text-secondary'
                        }`}>
                        #{rank}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-serif font-bold text-lg text-secondary truncate group-hover:text-primary transition-colors" title={candidate.filename.replace('.pdf', '')}>
                            {candidate.filename.replace('.pdf', '')}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-mono text-secondary/50">
                            <FileText className="w-3 h-3" />
                            <span>PDF_DOCUMENT</span>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 flex flex-col items-end">
                    {candidate.final_score !== null && (
                        <div className={`text-2xl font-display font-bold whitespace-nowrap ${score >= 80 ? 'text-accent-green' :
                                score >= 60 ? 'text-accent-yellow' : 'text-accent-red'
                            }`}>
                            {score}<span className="text-sm text-secondary/30 font-normal">/100</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                {candidate.one_liner ? (
                    <p className="text-sm text-secondary/80 line-clamp-2 leading-relaxed font-medium">
                        "{candidate.one_liner}"
                    </p>
                ) : (
                    <p className="text-sm text-secondary/30 italic">Processing summary...</p>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-secondary/5">
                    {!isQualified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-accent-red/10 text-accent-red uppercase tracking-wider">
                            <X className="w-3 h-3" /> Dealbreaker
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-accent-green/10 text-accent-green uppercase tracking-wider">
                            <Check className="w-3 h-3" /> Qualified
                        </span>
                    )}
                    {score > 85 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-accent-yellow/10 text-accent-yellow uppercase tracking-wider">
                            <Star className="w-3 h-3" /> Top Pick
                        </span>
                    )}
                    <button
                        onClick={handleViewPdf}
                        className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-secondary/5 text-secondary/60 hover:bg-secondary/10 hover:text-secondary transition-colors uppercase tracking-wider"
                        title="View PDF"
                    >
                        <ExternalLink className="w-3 h-3" /> View PDF
                    </button>
                </div>
            </div>

            {/* Hover decoration */}
            <div className={`absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300 ${isQualified ? 'w-0 group-hover:w-full' : 'w-0'
                }`} />
        </div>
    );
}
