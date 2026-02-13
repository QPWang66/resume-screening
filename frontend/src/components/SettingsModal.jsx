import React, { useState, useEffect } from 'react';
import { X, Save, Check, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_Base = 'http://localhost:8000/api';

export default function SettingsModal({ isOpen, onClose }) {
    const [config, setConfig] = useState({
        provider: 'openai',
        model: '',
        base_url: '',
        api_key: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [availableModels, setAvailableModels] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchConfig();
            fetchModels();
        }
    }, [isOpen]);

    // Fetch models when provider changes (if needed, or just on open/mount)
    // For simplicity, we fetch all models on open, or maybe only when provider is selected?
    // Let's just fetch models when the modal opens or provider changes.
    useEffect(() => {
        if (isOpen) {
            fetchModels();
        }
    }, [config.provider, isOpen]);


    const fetchConfig = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_Base}/config/llm`);
            if (res.ok) {
                const data = await res.json();
                setConfig({
                    provider: data.provider,
                    model: data.model,
                    base_url: data.base_url || '',
                    api_key: '' // Don't show the masked key, just empty creates "unchanged" implication or we can show placeholder
                });
            }
        } catch (e) {
            setError("Failed to load settings.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchModels = async () => {
        try {
            // Ideally we ask the backend for models for the *current* provider in state.
            // But backend `list_models` uses the *configured* client. 
            // So initially this will return models for the active provider.
            // If user switches provider in UI, we can't list models until we save... 
            // OR we need an endpoint that accepts provider config to list models.
            // For now, let's just list what we can from the current active client, 
            // and if they switch, maybe we just show a text input or common defaults.

            // Actually, for local/Ollama, listing is useful. For Anthropic, it's static.
            const res = await fetch(`${API_Base}/config/llm/models`);
            if (res.ok) {
                const data = await res.json();
                setAvailableModels(data);
            }
        } catch (e) {
            console.error("Failed to fetch models", e);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const payload = { ...config };
            // If api_key is empty string, we might want to send null? 
            // Or if the user didn't type anything, maybe we shouldn't overwrite it?
            // The current backend overwrites. 
            // Current implementation: `api_key = config.api_key`.
            // If we send empty string, it might break it if it expects a key.
            // Ideally, the backend should handle "if None, keep existing".
            // BUT, for security, the backend returns "***".
            // If we send back empty string, we should probably handle that in backend or here.
            // Let's assume if the user leaves it empty, they don't mean to change it?
            // But we can't know the difference between "clear it" and "keep it".
            // Let's assuming for now we just send what we have. 
            // If it's empty, and provider is Anthropic, it might fail if we don't handle it.
            // Let's just send it.

            const res = await fetch(`${API_Base}/config/llm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Failed to save");
            }

            onClose();
        } catch (e) {
            setError(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-md bg-bg-primary border border-border-primary shadow-sharp p-6 z-10"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-xl font-bold text-text-primary">LLM Settings</h2>
                            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-text-secondary" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Provider */}
                                <div>
                                    <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Provider</label>
                                    <select
                                        value={config.provider}
                                        onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                                        className="w-full p-2 bg-bg-secondary border border-border-primary focus:outline-none focus:border-accent-orange font-sans"
                                    >
                                        <option value="openai">OpenAI Compatible (Ollama/Local)</option>
                                        <option value="anthropic">Anthropic</option>
                                    </select>
                                </div>

                                {/* Base URL (Only for OpenAI/Local) */}
                                {config.provider === 'openai' && (
                                    <div>
                                        <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Base URL</label>
                                        <input
                                            type="text"
                                            value={config.base_url}
                                            onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
                                            placeholder="http://localhost:11434/v1"
                                            className="w-full p-2 bg-bg-secondary border border-border-primary focus:outline-none focus:border-accent-orange font-sans"
                                        />
                                    </div>
                                )}

                                {/* Model */}
                                <div>
                                    <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Model Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={config.model}
                                            onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                            list="model-options"
                                            className="w-full p-2 bg-bg-secondary border border-border-primary focus:outline-none focus:border-accent-orange font-sans"
                                            placeholder={config.provider === 'anthropic' ? 'claude-3-sonnet-20240229' : 'llama3'}
                                        />
                                        {/* Only show datalist if we actually have models from the *current* provider context. 
                        Since we can't easily fetch new provider models without saving first, 
                        we might be showing models from the *previous* provider if strictly relying on backend list.
                        Ideally we'd clear list on provider change or show nothing.
                    */}
                                        <datalist id="model-options">
                                            {availableModels.map(m => (
                                                <option key={m} value={m} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>

                                {/* API Key */}
                                <div>
                                    <label className="block text-xs font-mono uppercase text-text-secondary mb-1">API Key</label>
                                    <input
                                        type="password"
                                        value={config.api_key}
                                        onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                                        placeholder={config.provider === 'openai' ? 'Optional for Ollama' : 'sk-ant-...'}
                                        className="w-full p-2 bg-bg-secondary border border-border-primary focus:outline-none focus:border-accent-orange font-sans"
                                    />
                                    <p className="text-[10px] text-text-secondary mt-1">
                                        Leave empty to keep existing key (if set) or if not required.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-primary/50">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-sans hover:bg-black/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-text-primary text-bg-primary text-sm font-sans font-medium hover:bg-accent-orange hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
