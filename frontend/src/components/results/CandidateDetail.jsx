import React from 'react';
import { X, Check, ArrowLeft } from 'lucide-react';

export default function CandidateDetail({ candidate, onClose }) {
    if (!candidate) return null;

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6 md:p-12">
                <button
                    onClick={onClose}
                    className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Main Profil */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">{candidate.filename}</h1>
                            <div className="flex items-center gap-3">
                                {candidate.passed_dealbreakers ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                        <Check className="w-4 h-4" /> Qualified
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                                        <X className="w-4 h-4" /> Rejected
                                    </span>
                                )}
                                <span className="text-sm text-gray-500">Score: {candidate.final_score}/100</span>
                            </div>
                        </div>

                        {candidate.rejection_reason && (
                            <div className="p-4 bg-red-50 text-red-900 rounded-xl border border-red-100">
                                <h3 className="font-semibold mb-1 text-sm uppercase tracking-wide opacity-80">Dealbreaker Found</h3>
                                <p>{candidate.rejection_reason}</p>
                            </div>
                        )}

                        <div className="prose max-w-none">
                            <h3 className="text-xl font-semibold text-gray-900">Summary</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">{candidate.one_liner}</p>
                        </div>

                        {/* Scores breakdown would go here */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-900">Score Breakdown</h3>
                            {candidate.category_scores && Object.entries(candidate.category_scores).map(([key, val]) => (
                                <div key={key} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                                        <span className={`font-bold ${val.score > 70 ? 'text-green-600' : 'text-gray-700'}`}>{val.score}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 italic">"{val.evidence}"</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h3 className="font-semibold mb-4">Highlights</h3>
                            <ul className="space-y-2">
                                {candidate.highlights?.map((h, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                                        <span className="text-green-500">•</span>
                                        {h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h3 className="font-semibold mb-4">Concerns</h3>
                            <ul className="space-y-2">
                                {candidate.concerns?.map((h, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                                        <span className="text-red-500">•</span>
                                        {h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
