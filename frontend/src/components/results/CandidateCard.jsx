import React from 'react';
import { Star, Check, X, FileText, ChevronRight } from 'lucide-react';

export default function CandidateCard({ candidate, rank, onClick }) {
    // candidate has: id, filename, final_score, passed_dealbreakers, one_liner

    return (
        <div
            onClick={onClick}
            className={`group relative bg-white rounded-xl border p-5 transition-all hover:shadow-md cursor-pointer ${!candidate.passed_dealbreakers ? 'border-gray-200 opacity-60 bg-gray-50' : 'border-gray-200 hover:border-primary-300'
                }`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                            rank <= 3 ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-400'
                        }`}>
                        #{rank}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{candidate.filename.replace('.pdf', '')}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FileText className="w-3 h-3" />
                            <span>PDF Resume</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {candidate.final_score !== null && (
                        <div className={`px-2 py-1 rounded-md text-sm font-bold ${candidate.final_score >= 80 ? 'bg-green-100 text-green-700' :
                                candidate.final_score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-50 text-red-600'
                            }`}>
                            {candidate.final_score}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {candidate.one_liner ? (
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        "{candidate.one_liner}"
                    </p>
                ) : (
                    <p className="text-sm text-gray-400 italic">No summary generated.</p>
                )}

                <div className="flex flex-wrap gap-2">
                    {!candidate.passed_dealbreakers ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <X className="w-3 h-3" /> Failed Dealbreakers
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <Check className="w-3 h-3" /> Qualified
                        </span>
                    )}
                </div>
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
        </div>
    );
}
