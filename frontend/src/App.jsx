import React, { useState, useEffect } from 'react';
import UploadZone from './components/upload/UploadZone';
import CriteriaChat from './components/criteria/CriteriaChat';
import ProgressTracker from './components/processing/ProgressTracker';
import ResultsDashboard from './components/results/ResultsDashboard';
import CandidateDetail from './components/results/CandidateDetail';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';



const API_Base = 'http://localhost:8000/api';

function ModelStatus() {
  const [status, setStatus] = useState(null); // { status: "online"|"offline", provider, model }

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8000/status/llm`);
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

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider ${status.status === 'online'
      ? 'bg-accent-green/10 border-accent-green/20 text-accent-green'
      : 'bg-accent-red/10 border-accent-red/20 text-accent-red'
      }`}>
      <div className={`w-2 h-2 rounded-full ${status.status === 'online' ? 'bg-accent-green animate-pulse' : 'bg-accent-red'}`} />
      {status.status === 'online' ? (
        <span>{status.provider} :: {status.model}</span>
      ) : (
        <span>LLM OFFLINE</span>
      )}
    </div>
  );
}

function App() {
  const [step, setStep] = useState('upload'); // upload, criteria, processing, results
  const [sessionId, setSessionId] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [criteria, setCriteria] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Start Screening -> Create Session & Get Initial Criteria
  const handleStart = async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_Base}/screening/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: data.jobDescription,
          keep_count: data.keepCount,
          hr_notes: data.notes
        })
      });
      const session = await res.json();
      setSessionId(session.id);
      setSessionData(session);
      setCriteria({
        human_readable: session.criteria_human_readable,
        structured: session.criteria_json
      });

      // Upload files now
      await uploadFiles(session.id, data.files);

      setStep('criteria');
    } catch (e) {
      console.error(e);
      alert("Failed to start session: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFiles = async (sid, files) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    await fetch(`${API_Base}/screening/${sid}/upload`, {
      method: 'POST',
      body: formData
    });
  };

  // 2. Refine Criteria
  const handleRefineCriteria = async (feedback) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_Base}/screening/${sessionId}/criteria/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });
      const newCriteria = await res.json();
      setCriteria({
        human_readable: newCriteria.criteria_human_readable,
        structured: newCriteria.criteria_json,
        changes: newCriteria.changes_made
      });
    } catch (e) {
      console.error(e);
      alert("Failed to refine criteria");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCriteria = async () => {
    // Start processing
    try {
      await fetch(`${API_Base}/screening/${sessionId}/process`, { method: 'POST' });
      setStep('processing');
    } catch (e) {
      alert("Failed to start processing");
    }
  };

  // 3. Poll for Progress
  useEffect(() => {
    let interval;
    if (step === 'processing') {
      interval = setInterval(async () => {
        const res = await fetch(`${API_Base}/screening/${sessionId}/results`);
        const data = await res.json();
        setResults(data); // data has session and candidates
        setSessionData(data.session);

        if (data.session.status === 'completed') {
          clearInterval(interval);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, sessionId]);

  const handleProcessingComplete = () => {
    setStep('results');
  };

  // 4. View Results & Details
  const handleSelectCandidate = async (cid) => {
    const res = await fetch(`${API_Base}/screening/${sessionId}/candidate/${cid}`);
    const detail = await res.json();
    setSelectedCandidate(detail);
    setSelectedCandidateId(cid);
  };

  const handleExport = () => {
    window.location.href = `${API_Base}/screening/${sessionId}/export`;
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden p-6 md:p-12">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-dim/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Global Header */}
      <header className="fixed top-0 left-0 right-0 p-6 z-40 bg-background/80 backdrop-blur-sm border-b border-secondary/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-secondary text-white flex items-center justify-center rounded-lg font-serif font-bold text-xl shadow-sharp-sm">R</div>
          <span className="font-serif font-semibold text-lg tracking-tight">ResumeRank AI</span>
        </div>

        <div className="flex items-center gap-4">
          <ModelStatus />
          {step !== 'upload' && (
            <div className="text-xs font-mono bg-white border border-secondary/20 px-3 py-1 rounded-full text-secondary/60">
              SESSION_ID: {sessionId?.slice(0, 8)}
            </div>
          )}
        </div>
      </header>

      {/* Step Transition Wrapper */}
      <div className="pt-20 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 'upload' && <UploadZone onStart={handleStart} />}

            {step === 'criteria' && (
              <CriteriaChat
                criteria={criteria}
                onRefine={handleRefineCriteria}
                onConfirm={handleConfirmCriteria}
                isLoading={isLoading}
              />
            )}

            {step === 'processing' && results && (
              <ProgressTracker
                session={results.session}
                onComplete={handleProcessingComplete}
              />
            )}

            {step === 'results' && results && (
              <ResultsDashboard
                results={results}
                onExport={handleExport}
                onSelectCandidate={handleSelectCandidate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedCandidate && (
          <CandidateDetail
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && step === 'upload' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/90 z-50 flex flex-col items-center justify-center backdrop-blur-sm"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-secondary/10 border-t-secondary rounded-full animate-spin" />
              <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-secondary" />
            </div>
            <p className="mt-8 font-serif text-xl text-secondary animate-pulse">Analysing Job Requirements...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
