import React, { useState, useRef } from 'react';
import { Upload, X, FileText, ArrowRight, Loader2 } from 'lucide-react';
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
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">ResumeRank AI</h1>
                <p className="text-lg text-gray-600">Upload resumes, describe the role, and let AI find your top candidates.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Job Details */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">1. Job Details</h2>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Job Description</label>
                            <textarea
                                className="w-full h-40 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none text-sm"
                                placeholder="Paste the full job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Top Candidates to Keep</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                    value={keepCount}
                                    onChange={(e) => setKeepCount(parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Extra Notes (Optional)</label>
                            <textarea
                                className="w-full h-20 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none text-sm"
                                placeholder="e.g. 'Must have led a team before' or 'Ignore lack of degree'"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Upload */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 h-full flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-900">2. Upload Resumes</h2>

                        <div
                            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
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
                            <div className="bg-primary-100 p-4 rounded-full mb-4">
                                <Upload className="w-8 h-8 text-primary-600" />
                            </div>
                            <p className="text-sm text-gray-600 text-center font-medium">Click to upload or drag & drop</p>
                            <p className="text-xs text-gray-400 mt-1">PDF directories or files support</p>
                        </div>

                        {files.length > 0 && (
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">{files.length} files selected</span>
                                    <button onClick={() => setFiles([])} className="text-xs text-red-500 hover:text-red-700">Clear all</button>
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    <AnimatePresence>
                                        {files.map((file, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                key={i}
                                                className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm group"
                                            >
                                                <div className="flex items-center space-x-2 truncate">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate max-w-[180px]">{file.name}</span>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
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

            <div className="flex justify-center pt-4">
                <button
                    onClick={handleSubmit}
                    className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-gray-800 hover:scale-105 transition-all focus:ring-4 focus:ring-gray-300 disabled:opacity-50 disabled:hover:scale-100"
                    disabled={!jobDescription || files.length === 0}
                >
                    <span>Generate Criteria</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
