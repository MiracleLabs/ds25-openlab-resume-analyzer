import { useState } from 'react';
import AnalysisDashboard from './components/AnalysisDashboard';
import FileUpload from './components/FileUpload';
import LoadingScreen from './components/LoadingScreen';
import { analyzeResumeWithGemini } from './services/geminiService';
import type { AnalysisResult, AnalysisStatus } from './types';

import ds25Logo from './assets/images/ds_25_logo.svg';
import miracleLogo from './assets/images/miracle-logo-dark.png';


function App() {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  const handleFileSelect = async (file: File) => {
    setStatus('analyzing');
    setErrorMsg(null);


    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];

        try {
          // Note: Since analyzeResumeWithGemini is an async promise,
          // true cancellation (aborting the network request) depends on the SDK support or custom abort signals.
          // For now, we check if status is still 'analyzing' after promise resolves.
          const data = await analyzeResumeWithGemini(base64String);

          // Use a functional state update to check if we should proceed
          setStatus((prevStatus) => {
            if (prevStatus === 'analyzing') {
              setResult(data);
              return 'success';
            }
            return prevStatus;
          });
        } catch (err: unknown) {
          console.error(err);
          setStatus((prevStatus) => {
            if (prevStatus === 'analyzing') {
              const errorMessage = err instanceof Error ? err.message : "Failed to analyze resume. Please try again.";
              setErrorMsg(errorMessage || "Failed to analyze resume. Please try again.");
              return 'error';
            }
            return prevStatus;
          });
        }
      };
      reader.onerror = () => {
        setStatus('error');
        setErrorMsg("Failed to read file.");
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setStatus('error');
      console.error(e)
      setErrorMsg("An unexpected error occurred.");
    }
  };


  const cancelAnalysis = () => {
    setStatus('idle');
    setResult(null);
    setErrorMsg(null);
  };


  const resetAnalysis = () => {
    setStatus('idle');
    setResult(null);
    setErrorMsg(null);
  };


  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-black bg-white">
      {/* Header */}
      <header className="bg-white border-b border-brand-lightgrey/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ds25Logo} alt="ResumeAI" className=" h-24" />
          </div>
          <nav>
            <img src={miracleLogo} alt="ResumeAI" className=" h-10" />
          </nav>
        </div>
      </header>


      {/* Main Content */}
      <main className="grow">
        {status === 'idle' && (
          <div className="max-w-6xl mx-auto px-4 py-24 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-brand-black mb-6 tracking-tight leading-tight">
              AI-Powered <span className="text-brand-lightblue">PDF Resume Analyzer</span>
              <span className="inline-block px-4 rounded-full bg-brand-lightblue/10 text-brand-mediumblue text-xs font-bold uppercase tracking-wider mb-8 border border-brand-lightblue/20">
                Powered by Gemini 3 Pro
              </span>


            </h1>
            <p className="text-xl text-brand-darkgrey mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Upload, Analyze, and Score Resumes Instantly Using Generative AI
            </p>


            <div className="bg-white p-2 rounded-2xl shadow-2xl shadow-brand-darkblue/5 border border-brand-lightgrey/20">
              <FileUpload onFileSelect={handleFileSelect} />
            </div>


            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { title: "Instant Scoring", desc: "Get a 0-100 score based on real-world ATS algorithms.", icon: "⚡" },
                { title: "Keyword Analysis", desc: "Identify missing skills critical for your target role.", icon: "🔍" },
                { title: "Smart Feedback", desc: "Actionable advice to increase your interview chances.", icon: "🎯" }
              ].map((feature, i) => (
                <div key={i} className="p-8 bg-white rounded-xl border border-brand-lightgrey/30 text-left hover:border-brand-lightblue transition-all hover:shadow-lg group">
                  <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="font-bold text-lg text-brand-darkblue mb-3">{feature.title}</h3>
                  <p className="text-brand-darkgrey text-base leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}


        {status === 'analyzing' && (
          <LoadingScreen onCancel={cancelAnalysis} />
        )}


        {status === 'error' && (
          <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-xl border border-brand-red/20 text-center animate-fade-in">
            <div className="w-16 h-16 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-brand-black mb-2">Analysis Failed</h2>
            <p className="text-brand-darkgrey mb-6">{errorMsg}</p>
            <button
              onClick={resetAnalysis}
              className="px-6 py-2.5 bg-brand-darkblue text-white font-semibold rounded-lg hover:bg-brand-mediumblue transition-colors shadow-lg shadow-brand-darkblue/20"
            >
              Try Again
            </button>
          </div>
        )}


        {status === 'success' && result && (
          <div className="py-12 px-4 sm:px-6 bg-slate-50 min-h-screen">
            <AnalysisDashboard data={result} onReset={resetAnalysis} />
          </div>
        )}
      </main>


      <footer className="bg-white border-t border-brand-lightgrey/30 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-brand-darkgrey text-sm font-medium">
          <p> Made with ❤️ by Miracle Labs.</p>
        </div>
      </footer>
    </div>
  );
}


export default App;
