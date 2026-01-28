import React from 'react';
import { X, Check, ArrowLeft, Download, Award, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CandidateDetail({ candidate, onClose }) {
    if (!candidate) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
        >
            <div className="bg-white w-full max-w-6xl rounded-3xl border-2 border-secondary overflow-hidden shadow-sharp-lg flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 md:p-8 border-b-2 border-secondary/10 flex justify-between items-start bg-secondary/5">
                    <div>
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 text-secondary/60 hover:text-primary transition-colors font-mono text-xs uppercase tracking-wider mb-4"
                        >
                            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
                        </button>
                        <h1 className="text-4xl md:text-5xl font-display font-semibold text-secondary mb-2">
                            {candidate.filename.replace('.pdf', '')}
                        </h1>
                        <div className="flex items-center gap-4">
                            {candidate.passed_dealbreakers ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent-green text-white rounded-full text-sm font-bold tracking-wide shadow-sm">
                                    <Check className="w-4 h-4" /> QUALIFIED CANDIDATE
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent-red text-white rounded-full text-sm font-bold tracking-wide shadow-sm">
                                    <X className="w-4 h-4" /> REJECTED
                                </span>
                            )}
                            <div className="h-6 w-px bg-secondary/20" />
                            <span className="font-mono text-secondary/60">ID: {candidate.id.slice(0, 8)}</span>
                        </div>
                    </div>

                    <div className="text-right hidden md:block">
                        <div className="font-mono text-xs text-secondary/40 mb-1">FINAL SCORE</div>
                        <div className={`text-6xl font-bold ${candidate.final_score >= 80 ? 'text-accent-green' :
                                candidate.final_score >= 60 ? 'text-accent-yellow' : 'text-accent-red'
                            }`}>
                            {candidate.final_score || 0}
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-12 gap-8 custom-scrollbar bg-white">
                    {/* Main Profil */}
                    <div className="md:col-span-8 space-y-10">
                        {candidate.rejection_reason && (
                            <div className="p-6 bg-accent-red/5 border-l-4 border-accent-red rounded-r-xl">
                                <h3 className="font-bold text-accent-red mb-1 uppercase tracking-wider flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> Dealbreaker Detected
                                </h3>
                                <p className="text-secondary font-medium leading-relaxed">{candidate.rejection_reason}</p>
                            </div>
                        )}

                        <div className="prose prose-lg max-w-none">
                            <h3 className="font-serif text-2xl text-secondary mb-4">Executive Summary</h3>
                            <p className="text-secondary/80 leading-loose border-l-2 border-primary/30 pl-6 italic">
                                "{candidate.one_liner}"
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-serif text-2xl text-secondary flex items-center gap-3">
                                <Award className="w-6 h-6 text-primary" /> Evaluation Breakdown
                            </h3>
                            <div className="grid gap-4">
                                {candidate.category_scores && Object.entries(candidate.category_scores).map(([key, val]) => (
                                    <div key={key} className="bg-background p-6 rounded-2xl border border-secondary/10 hover:border-secondary/30 transition-colors group">
                                        <div className="flex justify-between items-baseline mb-3">
                                            <span className="font-bold text-lg text-secondary capitalize">{key.replace(/_/g, ' ')}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-24 bg-secondary/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${val.score > 70 ? 'bg-accent-green' : 'bg-accent-yellow'}`}
                                                        style={{ width: `${val.score}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono font-bold text-lg w-8 text-right">{val.score}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-secondary/70 leading-relaxed font-light">"{val.evidence}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-background p-6 rounded-2xl border-2 border-secondary/10 shadow-sharp-sm">
                            <h3 className="font-bold text-secondary mb-6 font-mono text-sm uppercase tracking-wider border-b border-secondary/10 pb-2">Key Strengths</h3>
                            <ul className="space-y-4">
                                {candidate.highlights?.map((h, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-secondary/80 leading-relaxed group">
                                        <Check className="w-4 h-4 text-accent-green shrink-0 mt-1" />
                                        <span>{h}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-background p-6 rounded-2xl border-2 border-secondary/10 shadow-sharp-sm">
                            <h3 className="font-bold text-secondary mb-6 font-mono text-sm uppercase tracking-wider border-b border-secondary/10 pb-2">Areas of Concern</h3>
                            <ul className="space-y-4">
                                {candidate.concerns?.map((h, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-secondary/80 leading-relaxed">
                                        <X className="w-4 h-4 text-accent-red shrink-0 mt-1" />
                                        <span>{h}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
