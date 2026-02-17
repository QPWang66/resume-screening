import React, { useState, useRef } from 'react';
import { Upload, X, FileText, ArrowRight, Sparkles, Briefcase, StickyNote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadZone({ onStart }) {
    const [files, setFiles] = useState([]);
    const [jobDescription, setJobDescription] = useState('');
    const [keepCount, setKeepCount] = useState(10);
    const [notes, setNotes] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFiles = (newFiles) => {
        const validFiles = newFiles.filter(f => f.type === 'application/pdf');
        if (validFiles.length !== newFiles.length) {
            alert("Only PDF files are supported currently.");
        }
        setFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (!jobDescription.trim()) return alert("Please enter a job description");
        if (files.length === 0) return alert("Please upload at least one resume");

        onStart({
            jobDescription,
            keepCount,
            notes,
            files
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto animate-enter" style={{ animationDelay: '0s' }}>
                <h1 className="text-6xl md:text-7xl font-display font-semibold text-secondary leading-[0.9]">
                    Staff the <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-yellow relative inline-block">
                        Extraordinary
                        <Sparkles className="absolute -top-6 -right-8 text-primary w-8 h-8 animate-pulse" />
                    </span>
                </h1>
                <p className="text-xl text-secondary-dim/80 font-light max-w-lg mx-auto leading-relaxed">
                    Drag, drop, and let intelligent agents find the needle in the haystack. No more generic filters.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-enter" style={{ animationDelay: '0.1s' }}>
                {/* Left Column: Job Details */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="card-brutal p-8 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-secondary text-white rounded-lg">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-serif text-secondary">The Role</h2>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-mono text-secondary/60 uppercase tracking-wider">Job Description</label>
                            <textarea
                                className="w-full h-48 p-4 bg-background/50 rounded-xl border-2 border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                                placeholder="Paste the JD here. Be specific about skills, years of experience, and dealbreakers..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-secondary/60 uppercase tracking-wider">Shortlist Count</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full p-4 pr-28 bg-background/50 rounded-xl border-2 border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all font-mono text-lg font-bold"
                                        value={keepCount}
                                        onChange={(e) => setKeepCount(parseInt(e.target.value) || 1)}
                                    />
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 text-sm text-secondary/40 font-serif italic pointer-events-none">candidates</div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-secondary/60 uppercase tracking-wider">Preferences</label>
                                <div className="relative group/notes">
                                    <textarea
                                        className="w-full h-[58px] p-4 bg-background/50 rounded-xl border-2 border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all resize-none text-sm line-clamp-2 overflow-hidden focus:h-24 absolute z-10"
                                        placeholder="Any hidden preferences?"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                    <div className="h-[58px] w-full" /> {/* Spacer */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Upload */}
                <div className="lg:col-span-5 space-y-6">
                    <div
                        className={`card-brutal p-8 h-full flex flex-col relative transition-all cursor-pointer group ${isDragging ? 'bg-primary/5 border-primary scale-[1.02]' : 'hover:border-secondary-dim'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            multiple
                            accept=".pdf"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                        />

                        <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-8">
                            <div className={`p-6 rounded-full border-2 border-dashed transition-all duration-500 ${isDragging ? 'border-primary bg-primary/10 rotate-180' : 'border-secondary/20 group-hover:border-secondary'}`}>
                                <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-primary' : 'text-secondary'}`} />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="font-serif text-xl text-secondary">Drop resumes here</p>
                                <p className="text-sm text-secondary/50 font-mono">PDFs only supported</p>
                            </div>
                        </div>

                        {files.length > 0 && (
                            <div className="border-t-2 border-secondary/5 pt-4 mt-auto">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-mono uppercase tracking-wider text-secondary/60">{files.length} FILES READY</span>
                                    <button onClick={(e) => { e.stopPropagation(); setFiles([]); }} className="text-xs text-accent-red font-bold hover:underline">RESET</button>
                                </div>
                                <div className="max-h-32 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                                    <AnimatePresence>
                                        {files.map((file, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                key={i}
                                                className="flex items-center justify-between bg-background p-3 rounded-lg border border-transparent hover:border-secondary/10 group/file transition-all"
                                            >
                                                <div className="flex items-center space-x-3 truncate">
                                                    <FileText className="w-4 h-4 text-secondary/40" />
                                                    <span className="truncate max-w-[180px] text-sm font-medium text-secondary">{file.name}</span>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-secondary/20 hover:text-accent-red transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-8 animate-enter" style={{ animationDelay: '0.2s' }}>
                <button
                    onClick={handleSubmit}
                    className="btn-accent group text-lg px-12 py-5 rounded-2xl shadow-sharp-lg hover:shadow-sharp hover:-translate-y-1 transition-all disabled:opacity-50 disabled:pointer-events-none"
                    disabled={!jobDescription || files.length === 0}
                >
                    <span className="font-serif italic mr-2">Start</span>
                    <span className="font-bold tracking-wide">ANALYSIS</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
