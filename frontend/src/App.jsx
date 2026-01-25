import React, { useState, useEffect } from 'react';
import UploadZone from './components/upload/UploadZone';
import CriteriaChat from './components/criteria/CriteriaChat';
import ProgressTracker from './components/processing/ProgressTracker';
import ResultsDashboard from './components/results/ResultsDashboard';
import CandidateDetail from './components/results/CandidateDetail';
import { Loader2 } from 'lucide-react';

const API_Base = 'http://localhost:8000/api';

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
        structured: JSON.parse(session.criteria_json)
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
      setCriteria(newCriteria);
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
    <div className="min-h-screen bg-white">
      {/* Loading Overlay for Global Actions */}
      {isLoading && step === 'upload' && (
        <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-gray-500 font-medium">Analyzing job description...</p>
          </div>
        </div>
      )}

      {step === 'upload' && <UploadZone onStart={handleStart} />}

      {step === 'criteria' && (
        <div className="bg-gray-50 min-h-screen p-8">
          <CriteriaChat
            criteria={criteria}
            onRefine={handleRefineCriteria}
            onConfirm={handleConfirmCriteria}
            isLoading={isLoading}
          />
        </div>
      )}

      {step === 'processing' && results && (
        <ProgressTracker
          session={results.session}
          onComplete={handleProcessingComplete}
        />
      )}

      {step === 'results' && results && (
        <div className="p-8 bg-gray-50 min-h-screen">
          <ResultsDashboard
            results={results}
            onExport={handleExport}
            onSelectCandidate={handleSelectCandidate}
          />
        </div>
      )}

      {selectedCandidate && (
        <CandidateDetail
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}

export default App;
