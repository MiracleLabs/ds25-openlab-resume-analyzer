import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { AnalysisResult } from '../types';

interface AnalysisDashboardProps {
   data: AnalysisResult;
   onReset: () => void;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data, onReset }) => {
   const [activeTab, setActiveTab] = useState<'All' | 'Content' | 'Keywords' | 'Formatting'>('All');
   const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
   const [isExporting, setIsExporting] = useState(false);

   const handleExportPDF = async () => {
      setIsExporting(true);
      const element = document.getElementById('analysis-dashboard-content');
      if (!element) {
         setIsExporting(false);
         return;
      }

      try {
         const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
         });

         const imgData = canvas.toDataURL('image/png');
         const pdf = new jsPDF('p', 'mm', 'a4');
         const pdfWidth = pdf.internal.pageSize.getWidth();
         const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

         // If content is taller than a page, we just fit it on one long page (or let it scale down) 
         // For a simple report, scaling to fit width is standard.
         pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
         pdf.save(`${data.candidateName.replace(/\s+/g, '_')}_Resume_Analysis.pdf`);
      } catch (error) {
         console.error("PDF Export failed", error);
         alert("Failed to export PDF. Please try again.");
      } finally {
         setIsExporting(false);
      }
   };

   // Helper to filter feedback based on tabs and assign sections
   const getFilteredFeedback = () => {
      type FeedbackItem = {
         type: 'missing_keywords' | 'formatting' | 'plan';
         priority: 'High' | 'Medium' | 'Low';
         category: 'Keywords' | 'Formatting' | 'Content';
         title: string;
         description: string;
         keywords?: string[];
         benefit?: string;
         section: string;
      };
      const items: FeedbackItem[] = [];

      // 1. Missing Keywords (High Priority) - Always "Keywords" category
      if (data.missingKeywords.length > 0) {
         items.push({
            type: 'missing_keywords',
            priority: 'High',
            category: 'Keywords',
            title: 'Missing Critical Keywords',
            description: `Your resume is missing ${data.missingKeywords.length} top keywords found in typical job descriptions for this role. Adding these can boost your score significantly.`,
            keywords: data.missingKeywords,
            section: 'skills'
         });
      }

      // 2. Formatting Issues - Always "Formatting" category
      data.formattingIssues.forEach(issue => {
         items.push({
            type: 'formatting',
            priority: 'Medium', // Default for formatting
            category: 'Formatting',
            title: 'Formatting Issue',
            description: issue,
            section: 'document' // Generic document wide
         });
      });

      // 3. Improvement Plan
      data.improvementPlan.forEach(plan => {
         let section = 'document';
         const lowerAction = plan.action.toLowerCase();

         if (plan.category === 'Keywords') section = 'skills';
         else if (lowerAction.includes('summary') || lowerAction.includes('objective')) section = 'summary';
         else if (plan.category === 'Content') section = 'experience'; // Default content to experience if not summary

         items.push({
            type: 'plan',
            priority: plan.priority,
            category: plan.category,
            title: plan.action,
            description: plan.explanation,
            benefit: plan.expectedBenefit,
            section: section
         });
      });

      if (activeTab === 'All') return items;
      return items.filter(item => item.category === activeTab);
   };

   const feedbackItems = getFilteredFeedback();

   // Counts for tabs
   const countContent = data.improvementPlan.filter(i => i.category === 'Content').length;
   const countKeywords = (data.missingKeywords.length > 0 ? 1 : 0) + data.improvementPlan.filter(i => i.category === 'Keywords').length;
   const countFormatting = data.formattingIssues.length + data.improvementPlan.filter(i => i.category === 'Formatting').length;

   return (
      <div className="w-full max-w-7xl mx-auto pb-20 pt-8 animate-fade-in" id="analysis-dashboard-content">
         <div className="flex justify-between items-center mb-6 px-4 lg:px-0">
            <h2 className="text-2xl font-bold text-brand-black">Analysis Overview</h2>
            <div className="flex gap-3">
               <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="px-4 py-2 text-sm font-semibold text-brand-mediumblue bg-brand-lightblue/10 border border-brand-lightblue/20 rounded-lg hover:bg-brand-lightblue/20 transition-colors flex items-center"
               >
                  {isExporting ? (
                     <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                     <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  )}
                  Export PDF
               </button>
               <button
                  onClick={onReset}
                  className="px-4 py-2 text-sm font-semibold text-brand-darkgrey bg-white border border-brand-lightgrey rounded-lg hover:border-brand-mediumblue hover:text-brand-mediumblue transition-colors"
               >
                  Analyze New
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN: Document Preview */}
            <div className="lg:col-span-4 space-y-6">
               <div className={`
              bg-white rounded-lg shadow-sm border sticky top-24 overflow-hidden transition-all duration-300
              ${highlightedSection === 'document' ? 'ring-2 ring-brand-lightblue border-brand-lightblue shadow-lg' : 'border-brand-lightgrey/30'}
          `}>
                  <div className="p-4 border-b border-brand-lightgrey/20 flex justify-between items-center bg-gray-50">
                     <span className="text-xs font-bold text-brand-darkgrey uppercase tracking-wider">Document Preview</span>
                     <div className="flex gap-2 text-brand-darkgrey">
                        <svg className="w-4 h-4 cursor-pointer hover:text-brand-mediumblue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                     </div>
                  </div>

                  {/* Simulated Resume View */}
                  <div className="p-8 min-h-150 bg-white text-xs leading-relaxed text-brand-black relative">
                     {/* Paper Effect */}
                     <div className="text-center mb-8">
                        <h1 className="text-xl font-bold text-brand-black uppercase tracking-widest mb-1">{data.candidateName}</h1>
                        <p className="text-brand-mediumblue font-semibold mb-2">{data.candidateTitle || 'Professional'}</p>
                        <p className="text-[10px] text-brand-darkgrey">
                           {data.contactInfo?.location || 'Location N/A'} | {data.contactInfo?.phone || 'Phone N/A'} | {data.contactInfo?.email || 'Email N/A'}
                        </p>
                        <div className="w-16 h-0.5 bg-brand-lightgrey mx-auto mt-4"></div>
                     </div>

                     <div className={`mb-6 p-2 rounded transition-all duration-300 ${highlightedSection === 'summary' ? 'bg-brand-lightblue/10 ring-2 ring-brand-lightblue' : 'hover:bg-gray-50'}`}>
                        <h2 className="text-xs font-bold text-brand-darkblue uppercase mb-2 border-b border-gray-100 pb-1">Professional Summary</h2>
                        <p className="text-brand-darkgrey relative">
                           {data.professionalSummary}
                        </p>
                     </div>

                     <div className={`mb-6 p-2 rounded transition-all duration-300 ${highlightedSection === 'experience' ? 'bg-brand-lightblue/10 ring-2 ring-brand-lightblue' : 'hover:bg-gray-50'}`}>
                        <h2 className="text-xs font-bold text-brand-darkblue uppercase mb-2 border-b border-gray-100 pb-1">Experience</h2>
                        {data.workExperience && data.workExperience.length > 0 ? (
                           data.workExperience.map((exp, i) => (
                              <div key={i} className="mb-3">
                                 <div className="flex justify-between font-semibold mb-0.5">
                                    <span>{exp.role}</span>
                                    <span>{exp.duration}</span>
                                 </div>
                                 <div className="italic text-[10px] mb-1">{exp.company}</div>
                                 <ul className="list-disc pl-4 space-y-1 text-[10px]">
                                    {exp.description.map((bullet, bi) => (
                                       <li key={bi}>{bullet}</li>
                                    ))}
                                 </ul>
                              </div>
                           ))
                        ) : (
                           <div className="text-[10px] text-brand-darkgrey italic">No work experience detected.</div>
                        )}
                     </div>

                     <div className={`mb-6 p-2 rounded transition-all duration-300 ${highlightedSection === 'skills' ? 'bg-brand-lightblue/10 ring-2 ring-brand-lightblue' : 'hover:bg-gray-50'}`}>
                        <h2 className="text-xs font-bold text-brand-darkblue uppercase mb-2 border-b border-gray-100 pb-1">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                           {data.extractedSkills.slice(0, 15).map((skill, idx) => (
                              <span key={idx} className="bg-white border border-gray-200 text-brand-black px-2 py-1 rounded text-[10px] font-medium shadow-sm">{skill}</span>
                           ))}
                           {data.extractedSkills.length > 15 && <span className="text-[10px] text-gray-400 self-center">+{data.extractedSkills.length - 15} more</span>}
                        </div>
                     </div>

                     {/* Removed Watermark/Overlay that was causing blurriness */}
                  </div>
               </div>
            </div>

            {/* RIGHT COLUMN: Analysis Overview */}
            <div className="lg:col-span-8">

               {/* Top Cards Row */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {/* Overall Score */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-brand-lightgrey/30 relative group cursor-help">
                     {/* Tooltip */}
                     <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-xs rounded p-3 z-20 w-64 -top-2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none shadow-xl">
                        This score represents how well your resume parses and matches job requirements. It combines keyword relevance, formatting cleanliness, and content quality.
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                     </div>

                     <div className="text-brand-darkgrey text-sm font-medium mb-2 flex items-center gap-1">
                        Overall ATS Score
                        <svg className="w-4 h-4 text-brand-lightgrey" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-5xl font-bold text-brand-black">{data.atsScore}</span>
                        <span className="text-brand-lightgrey text-sm">/100</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div
                           className={`h-2 rounded-full ${data.atsScore >= 80 ? 'bg-green-500' : data.atsScore >= 60 ? 'bg-brand-lightblue' : 'bg-brand-red'}`}
                           style={{ width: `${data.atsScore}%` }}
                        ></div>
                     </div>
                     <div className={`text-xs font-bold ${data.atsScore >= 80 ? 'text-green-600' : data.atsScore >= 60 ? 'text-brand-mediumblue' : 'text-brand-red'}`}>
                        {data.atsScore >= 80 ? 'Excellent' : data.atsScore >= 60 ? 'Good Start' : 'Needs Work'}
                     </div>
                  </div>

                  {/* Parsability */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-brand-lightgrey/30 flex flex-col justify-between relative group cursor-help">
                     {/* Tooltip */}
                     <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-xs rounded p-3 z-20 w-64 -top-2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none shadow-xl">
                        This measures how easily an ATS can read your file. Tables, columns, and graphics can lower this score, making it hard for systems to index your profile.
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                     </div>

                     <div>
                        <div className="text-brand-darkgrey text-sm font-medium mb-1 flex items-center gap-1">
                           Parsability
                           <svg className="w-4 h-4 text-brand-lightgrey" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-full ${data.parsabilityScore >= 90 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                              {data.parsabilityScore >= 90 ? (
                                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              ) : (
                                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              )}
                           </div>
                           <span className="text-3xl font-bold text-brand-black">{data.parsabilityScore}%</span>
                        </div>
                     </div>
                     <p className="text-xs text-brand-darkgrey mt-2">
                        {data.parsabilityScore >= 90 ? 'Format is machine-readable.' : 'Layout may confuse some ATS.'}
                     </p>
                  </div>

                  {/* Keyword Match */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-brand-lightgrey/30 flex flex-col justify-between relative group cursor-help">
                     {/* Tooltip */}
                     <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-xs rounded p-3 z-20 w-64 -top-2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none shadow-xl">
                        This indicates how many essential industry keywords were found in your resume compared to standard job descriptions for this role.
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                     </div>

                     <div>
                        <div className="text-brand-darkgrey text-sm font-medium mb-1 flex items-center gap-1">
                           Keyword Match
                           <svg className="w-4 h-4 text-brand-lightgrey" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-full ${data.keywordMatchScore >= 80 ? 'bg-green-100 text-green-600' : 'bg-brand-red/10 text-brand-red'}`}>
                              {data.keywordMatchScore >= 80 ? (
                                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              ) : (
                                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              )}
                           </div>
                           <span className="text-3xl font-bold text-brand-black">{data.keywordMatchScore}%</span>
                        </div>
                     </div>
                     <p className={`text-xs mt-2 ${data.keywordMatchScore < 70 ? 'text-brand-red font-medium' : 'text-brand-darkgrey'}`}>
                        {data.keywordMatchScore < 70 ? 'Critical keywords missing.' : 'Good keyword coverage.'}
                     </p>
                  </div>
               </div>

               {/* Feedback Tabs */}
               <div className="border-b border-brand-lightgrey/20 mb-6">
                  <div className="flex space-x-8">
                     {['All', 'Content', 'Keywords', 'Formatting'].map((tab) => (
                        <button
                           key={tab}
                           onClick={() => setActiveTab(tab as 'All' | 'Content' | 'Keywords' | 'Formatting')}
                           className={`
                       pb-4 text-sm font-medium transition-colors relative
                       ${activeTab === tab ? 'text-brand-mediumblue' : 'text-brand-darkgrey hover:text-brand-black'}
                     `}
                        >
                           {tab === 'All' ? 'All Feedback' : tab}
                           <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab ? 'bg-brand-mediumblue text-white' : 'bg-gray-100 text-gray-500'}`}>
                              {tab === 'All' ? countContent + countKeywords + countFormatting :
                                 tab === 'Content' ? countContent :
                                    tab === 'Keywords' ? countKeywords : countFormatting}
                           </span>
                           {activeTab === tab && (
                              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-mediumblue rounded-t-full"></div>
                           )}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Feedback Feed */}
               <div className="space-y-4">
                  {feedbackItems.map((item, idx) => {
                     const isHighImpact = item.priority === 'High';
                     const isFormatting = item.category === 'Formatting';
                     // Define logic for highlight border
                     const hasAlert = isHighImpact || isFormatting;

                     return (
                        <div
                           key={idx}
                           className={`
                        rounded-xl p-5 bg-white shadow-sm transition-all duration-300 hover:shadow-md cursor-default
                        ${hasAlert ? 'border-l-4 border-l-brand-red border-y border-r border-gray-200' : 'border border-brand-lightgrey/30'}
                        ${highlightedSection === item.section ? 'ring-2 ring-brand-lightblue bg-brand-lightblue/5' : ''}
                    `}
                           onMouseEnter={() => setHighlightedSection(item.section)}
                           onMouseLeave={() => setHighlightedSection(null)}
                        >
                           <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                 {/* Icon based on priority/type */}
                                 {item.priority === 'High' ? (
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                 ) : item.category === 'Formatting' ? (
                                    <div className="w-8 h-8 rounded-full bg-red-50 text-brand-red flex items-center justify-center shrink-0">
                                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </div>
                                 ) : item.priority === 'Medium' ? (
                                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0">
                                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </div>
                                 ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                 )}
                                 <div>
                                    <h3 className="font-bold text-brand-black">{item.title}</h3>
                                 </div>
                              </div>

                              {/* Priority Badge */}
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${item.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                                 item.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-brand-lightblue/10 text-brand-mediumblue border-brand-lightblue/20'
                                 }`}>
                                 {item.priority === 'High' ? 'High Impact' : item.priority === 'Medium' ? 'Medium Impact' : 'Suggestion'}
                              </span>
                           </div>

                           <p className="text-brand-darkgrey text-sm mb-4 pl-11">{item.description}</p>

                           {/* Content for Missing Keywords */}
                           {item.type === 'missing_keywords' && item.keywords && (
                              <div className="pl-11">
                                 <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                                    <p className="text-xs font-bold text-brand-darkgrey uppercase mb-3">Recommended Keywords:</p>
                                    <div className="flex flex-wrap gap-2">
                                       {item.keywords.map((kw: string, kIdx: number) => (
                                          <span key={kIdx} className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-white border border-brand-lightblue/30 text-brand-mediumblue border-dashed shadow-sm">
                                             <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                             {kw}
                                          </span>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           )}

                           {/* Content for Standard Improvements */}
                           {item.type === 'plan' && item.benefit && (
                              <div className="pl-11 mt-2">
                                 <div className="flex items-center text-xs text-brand-mediumblue font-medium bg-brand-lightblue/5 px-3 py-2 rounded border border-brand-lightblue/10 w-fit">
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    {item.benefit}
                                 </div>
                              </div>
                           )}
                        </div>
                     )
                  })}

                  {feedbackItems.length === 0 && (
                     <div className="text-center py-10 text-brand-darkgrey border-2 border-dashed border-gray-100 rounded-xl">
                        <p>No issues found in this category.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default AnalysisDashboard;