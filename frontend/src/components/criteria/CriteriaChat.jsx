import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, Edit3, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CriteriaChat({ criteria, onRefine, onConfirm, isLoading }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Initial message from AI
        if (messages.length === 0 && criteria?.human_readable) {
            setMessages([{
                role: 'assistant',
                content: criteria.human_readable
            }]);
        } else if (criteria?.human_readable && messages.length > 0 && messages[messages.length - 1].role === 'user') {
            // Response after refinement
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: criteria.human_readable,
                changes: criteria.changes_made
            }]);
        }
    }, [criteria]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
        onRefine(inputValue);
        setInputValue('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Helper to render the specific markdown-like format we agreed on
    const renderMessageContent = (text) => {
        return text.split('\n').map((line, i) => {
            if (line.startsWith('📋') || line.startsWith('⭐') || line.startsWith('📌')) {
                const title = line.split('(')[0];
                const sub = line.includes('(') ? '(' + line.split('(')[1] : '';
                return (
                    <div key={i} className="font-bold text-gray-900 mt-4 mb-2 flex items-center gap-2">
                        <span className="text-lg">{title}</span>
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{sub}</span>
                    </div>
                );
            }
            if (line.trim().startsWith('•')) {
                return <div key={i} className="ml-4 pl-4 border-l-2 border-gray-100 text-gray-700 py-1">{line.replace('•', '').trim()}</div>;
            }
            if (line.trim() === "") return <div key={i} className="h-2"></div>;
            return <div key={i} className="text-gray-700">{line}</div>;
        });
    };

    return (
        <div className="max-w-3xl mx-auto h-[600px] flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">Refine Criteria</h2>
                        <p className="text-xs text-gray-500">AI Recruiter Assistant</p>
                    </div>
                </div>

                <button
                    onClick={onConfirm}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm shadow-sm"
                >
                    <CheckCircle className="w-4 h-4" />
                    <span>Looks Good, Start Screening</span>
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white to-gray-50/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm border ${msg.role === 'user'
                                ? 'bg-gray-900 text-white border-transparent'
                                : 'bg-white border-gray-100'
                            }`}>
                            {msg.role === 'assistant' ? (
                                <div className="space-y-1">
                                    {msg.changes && (
                                        <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100 flex gap-2">
                                            <Edit3 className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span>Updated: {msg.changes}</span>
                                        </div>
                                    )}
                                    {renderMessageContent(msg.content)}
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-2">
                            <div className="flex space-x-1">
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                            </div>
                            <span className="text-sm text-gray-500">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="relative">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type to adjust criteria (e.g. 'Make Python a must-have', 'Less focus on degree')..."
                        className="w-full pr-12 pl-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl resize-none shadow-inner transition-all text-sm"
                        rows="2"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isLoading}
                        className="absolute right-3 bottom-3 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
