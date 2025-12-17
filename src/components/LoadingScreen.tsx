import React, { useState, useEffect } from 'react';

const INSIGHTS = [
  {
    title: "Quantify your impact with numbers",
    text: "Resumes with metrics (e.g., 'Increased sales by 20%') are 40% more likely to get an interview than those that just list duties. Recruiters love seeing tangible proof of your achievements."
  },
  {
    title: "Tailor your skills section",
    text: "75% of ATS algorithms filter candidates based on keyword matches in the 'Skills' section relative to the job description. Make sure to mirror the language of the job post."
  },
  {
    title: "Use strong active verbs",
    text: "Start bullet points with strong action verbs like 'Spearheaded', 'Orchestrated', or 'Developed'. Avoid passive phrases like 'Responsible for' or 'Helped with'."
  },
  {
    title: "Keep formatting simple",
    text: "Complex columns, tables, and graphics often confuse ATS parsers. A clean, single-column layout is the safest bet for ensuring your data is read correctly."
  }
];

interface LoadingScreenProps {
  onCancel: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onCancel }) => {
  const [progress, setProgress] = useState(0);
  const [currentInsight, setCurrentInsight] = useState(0);

  // Simulate progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Stall at 95% until actual completion
        
        // Non-linear increment to feel more organic
        const increment = Math.random() * 1.5; 
        return Math.min(prev + increment, 95);
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Rotate insights
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % INSIGHTS.length);
    }, 6000); // 6 seconds per insight
    return () => clearInterval(timer);
  }, []);

  const getStepStatus = (stepIndex: number) => {
      // Mapping progress to steps roughly
      // 0-30: Upload (Step 0) & Scan (Step 1)
      // 30-60: Soft Skills (Step 2)
      // 60-90: Formatting (Step 3)
      
      const threshold = stepIndex * 25;
      if (progress > threshold + 25) return 'completed';
      if (progress > threshold) return 'active';
      return 'pending';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-12 animate-fade-in">
        
      {/* Central Icon */}
      <div className="relative mb-8">
        <div className="w-28 h-28 bg-white rounded-[2rem] shadow-xl flex items-center justify-center relative z-10">
            <svg className="w-14 h-14 text-brand-lightblue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2v7.31" />
                <path d="M14 2v7.31" />
                <path d="M8.5 2h7" />
                <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
            </svg>
        </div>
        {/* Glow effect behind */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-lightblue/10 rounded-full blur-2xl z-0"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-brand-lightblue/20 rounded-full z-0 animate-ping opacity-20"></div>
        
        {/* Success Badge */}
        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg z-20 border-4 border-white">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
        </div>
      </div>

      <h2 className="text-4xl font-bold text-brand-black mb-6 text-center">Analyzing Your Profile</h2>
      
      <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-brand-lightblue/10 text-brand-mediumblue text-sm font-semibold mb-12 animate-pulse">
        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {progress < 40 ? "Extracting key competencies..." : progress < 70 ? "Evaluating soft skills..." : "Checking formatting rules..."}
      </div>

      {/* Progress Card */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-brand-lightgrey/30 p-8 mb-8">
        <div className="flex justify-between items-end mb-2">
            <div>
                <h3 className="text-sm font-bold text-brand-black uppercase tracking-wide">Analysis Progress</h3>
                <p className="text-xs text-brand-darkgrey mt-1">
                    Step {progress < 40 ? '2' : progress < 70 ? '3' : '4'} of 4: 
                    {progress < 40 ? ' Scanning for ATS keywords' : progress < 70 ? ' Evaluating soft skills' : ' Final formatting check'}
                </p>
            </div>
            <span className="text-3xl font-bold text-brand-lightblue">{Math.round(progress)}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-3 mb-8 overflow-hidden">
            <div 
                className="h-full bg-brand-lightblue transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
            >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
            </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            {[
                { label: "File Upload Complete", index: 0 },
                { label: "ATS Keyword Scan", index: 1 },
                { label: "Soft Skills Evaluation", index: 2 },
                { label: "Formatting Check", index: 3 }
            ].map((step) => {
                // Step 0 is always complete if we are here
                const status = step.index === 0 ? 'completed' : getStepStatus(step.index);
                
                return (
                    <div key={step.index} className="flex items-center">
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold transition-all duration-500
                            ${status === 'completed' ? 'bg-green-100 text-green-600' : 
                              status === 'active' ? 'bg-brand-lightblue/10 text-brand-mediumblue scale-110' : 
                              'bg-gray-50 text-gray-300'}
                        `}>
                            {status === 'completed' ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : status === 'active' ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                step.index + 1
                            )}
                        </div>
                        <span className={`text-sm font-medium transition-colors duration-300 ${status === 'pending' ? 'text-gray-300' : 'text-brand-black'}`}>
                            {step.label}
                        </span>
                    </div>
                )
            })}
        </div>
      </div>

      {/* Insight Card */}
      <div className="w-full bg-brand-black text-white rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg className="w-48 h-48 translate-x-12 -translate-y-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md flex-shrink-0 shadow-inner">
                <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 2C7.589 2 4 5.589 4 9.995 3.971 16.44 11.696 21.784 12 22c0 0 8.029-5.56 8-12 0-4.411-3.589-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" opacity="0.5"/>
                    <path d="M12 6a4 4 0 0 0-4 4c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                </svg>
            </div>
            
            <div className="flex-1 min-h-[120px] flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                    <span className="bg-yellow-500/20 text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-yellow-500/30 shadow-sm">
                        Insight of the day
                    </span>
                    <span className="text-gray-400 text-xs">Auto-rotating in 6s</span>
                </div>
                
                <div key={currentInsight} className="animate-fade-in">
                    <h3 className="text-xl font-bold mb-2 text-white">{INSIGHTS[currentInsight].title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        {INSIGHTS[currentInsight].text}
                    </p>
                </div>

                <div className="flex gap-2 mt-4">
                    <button 
                        onClick={() => setCurrentInsight((prev) => (prev - 1 + INSIGHTS.length) % INSIGHTS.length)}
                        className="p-1.5 rounded-full hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                    >
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button 
                        onClick={() => setCurrentInsight((prev) => (prev + 1) % INSIGHTS.length)}
                        className="p-1.5 rounded-full hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                    >
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
          </div>
          
          {/* Progress bar for rotation */}
           <div key={`progress-${currentInsight}`} className="absolute bottom-0 left-0 h-1 bg-brand-lightblue w-full origin-left animate-[progress_6s_linear_infinite]"></div>
      </div>

      <button 
        onClick={onCancel}
        className="mt-8 text-brand-darkgrey hover:text-brand-red flex items-center gap-2 text-sm font-medium transition-colors opacity-70 hover:opacity-100"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Cancel Analysis
      </button>

      <style>{`
        @keyframes progress {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;