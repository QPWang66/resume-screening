import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

const API_Base = 'http://localhost:8000'; // Adjust if needed or pass as prop

export default function ModelStatus({ onOpenSettings }) {
    const [status, setStatus] = useState(null); // { status: "online"|"offline", provider, model }

    const checkStatus = async () => {
        try {
            const res = await fetch(`${API_Base}/status/llm`);
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
            } else {
                setStatus({ status: 'offline' });
            }
        } catch (e) {
            setStatus({ status: 'offline' });
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, []);

    if (!status) return null;

    return (
        <button
            onClick={onOpenSettings}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider transition-colors hover:bg-opacity-20 cursor-pointer ${status.status === 'online'
                ? 'bg-accent-green/10 border-accent-green/20 text-accent-green hover:bg-accent-green'
                : 'bg-accent-red/10 border-accent-red/20 text-accent-red hover:bg-accent-red'
                }`}
            title="Click to configure LLM settings"
        >
            <div className={`w-2 h-2 rounded-full ${status.status === 'online' ? 'bg-accent-green animate-pulse' : 'bg-accent-red'}`} />
            {status.status === 'online' ? (
                <span>{status.provider} :: {status.model}</span>
            ) : (
                <span>LLM OFFLINE</span>
            )}
            <Settings className="w-3 h-3 ml-1 opacity-50" />
        </button>
    );
}
