import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, Edit3, MessageSquare, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CriteriaChat({ criteria, onRefine, onConfirm, isLoading }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messages.length === 0 && criteria?.human_readable) {
            setMessages([{
                role: 'assistant',
                content: criteria.human_readable
            }]);
        } else if (criteria?.human_readable && messages.length > 0 && messages[messages.length - 1].role === 'user') {
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

    const renderMessageContent = (text) => {
        return text.split('\n').map((line, i) => {
            if (line.startsWith('📋') || line.startsWith('⭐') || line.startsWith('📌')) {
                const title = line.split('(')[0];
                const sub = line.includes('(') ? '(' + line.split('(')[1] : '';
                return (
                    <div key={i} className="mt-6 mb-3 flex items-baseline gap-3 border-b border-secondary/10 pb-1">
                        <span className="font-serif font-bold text-xl text-secondary">{title}</span>
                        <span className="font-mono text-xs text-secondary/50 uppercase tracking-widest">{sub}</span>
                    </div>
                );
            }
            if (line.trim().startsWith('•')) {
                return (
                    <div key={i} className="flex gap-3 py-1 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 group-hover:bg-accent-yellow transition-colors" />
                        <div className="text-secondary/80 font-medium leading-relaxed">{line.replace('•', '').trim()}</div>
                    </div>
                );
            }
            if (line.trim() === "") return <div key={i} className="h-4"></div>;
            return <div key={i} className="text-secondary/70 leading-relaxed font-light">{line}</div>;
        });
    };

    return (
        <div className="max-w-4xl mx-auto h-[700px] flex flex-col card-brutal overflow-hidden">
            {/* Header */}
            <div className="bg-background border-b-2 border-secondary/10 p-5 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center shadow-sharp-sm">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-serif text-xl text-secondary">Calibration</h2>
                        <p className="font-mono text-xs text-secondary/50 uppercase tracking-widest">Refining Logic v2.0</p>
                    </div>
                </div>

                <button
                    onClick={onConfirm}
                    className="btn-accent px-6 py-2 text-sm shadow-sharp hover:shadow-sharp-lg"
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>CONFIRM CRITERIA</span>
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-background relative custom-scrollbar">
                {messages.map((msg, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] rounded-3xl p-8 shadow-sm ${msg.role === 'user'
                                ? 'bg-secondary text-white rounded-br-none shadow-sharp-sm'
                                : 'bg-white border md:border-2 border-secondary/10 rounded-tl-none shadow-sm'
                            }`}>
                            {msg.role === 'assistant' ? (
                                <div className="space-y-1">
                                    {msg.changes && (
                                        <div className="mb-6 mx-2 p-3 bg-accent-yellow/10 border-l-4 border-accent-yellow text-secondary-dim text-sm italic flex items-center gap-2">
                                            <Edit3 className="w-4 h-4" />
                                            <span>Logic adjusted: {msg.changes}</span>
                                        </div>
                                    )}
                                    {renderMessageContent(msg.content)}
                                </div>
                            ) : (
                                <div className="flex gap-4">
                                    <p className="font-serif text-lg leading-relaxed">{msg.content}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-3xl rounded-tl-none p-6 border md:border-2 border-secondary/10 flex items-center gap-3">
                            <div className="flex space-x-1">
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-secondary rounded-full" />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-secondary rounded-full" />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-secondary rounded-full" />
                            </div>
                            <span className="font-mono text-xs text-secondary/50 uppercase">Computing optimal parameters...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t-2 border-secondary/10">
                <div className="relative flex items-end gap-2 bg-background border-2 border-secondary/20 focus-within:border-primary rounded-2xl p-2 transition-colors">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Refine the criteria (e.g. 'Make Python mandatory', 'Ignore degree requirements')..."
                        className="w-full bg-transparent border-none focus:ring-0 p-3 min-h-[60px] resize-none font-medium placeholder:font-serif placeholder:italic placeholder:text-secondary/40"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isLoading}
                        className="p-3 bg-secondary text-white rounded-xl hover:bg-primary disabled:bg-secondary/20 transition-colors mb-1 shadow-sm"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
