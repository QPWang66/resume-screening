import React from 'react';
import { Check, X, FileText, ChevronRight, Star } from 'lucide-react';

export default function CandidateCard({ candidate, rank, onClick }) {
    const isQualified = candidate.passed_dealbreakers;
    const score = candidate.final_score || 0;

    return (
        <div
            onClick={onClick}
            className={`group relative bg-white border-2 rounded-xl p-6 transition-all duration-300 cursor-pointer overflow-hidden ${!isQualified
                    ? 'border-secondary/10 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 hover:border-secondary/30'
                    : 'border-secondary hover:border-primary hover:-translate-y-1 hover:shadow-sharp'
                }`}
        >
            {/* Top Banner */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-mono font-bold text-lg border-2 ${rank === 1 ? 'bg-accent-yellow border-secondary text-secondary shadow-sm' :
                            'bg-background border-secondary/10 text-secondary'
                        }`}>
                        #{rank}
                    </div>
                    <div>
                        <h3 className="font-serif font-bold text-lg text-secondary line-clamp-1 group-hover:text-primary transition-colors">
                            {candidate.filename.replace('.pdf', '')}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-mono text-secondary/50">
                            <FileText className="w-3 h-3" />
                            <span>PDF_DOCUMENT</span>
                        </div>
                    </div>
                </div>

                <div className={`flex flex-col items-end`}>
                    {candidate.final_score !== null && (
                        <div className={`text-2xl font-display font-bold ${score >= 80 ? 'text-accent-green' :
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

                <div className="flex flex-wrap gap-2 pt-2 border-t border-secondary/5">
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
                </div>
            </div>

            {/* Hover decoration */}
            <div className={`absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300 ${isQualified ? 'w-0 group-hover:w-full' : 'w-0'
                }`} />
        </div>
    );
}
