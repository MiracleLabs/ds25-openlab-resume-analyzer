export interface SkillBreakdown {
  category: string;
  score: number; // 0-100
}

export interface WorkExperience {
  role: string;
  company: string;
  duration: string;
  description: string[];
}

export interface AnalysisResult {
  atsScore: number;
  parsabilityScore: number; // 0-100
  keywordMatchScore: number; // 0-100
  candidateName: string;
  candidateTitle: string; // e.g., "Product Manager"
  contactInfo: {
    email: string;
    phone: string;
    location: string;
  };
  professionalSummary: string;
  workExperience: WorkExperience[];
  extractedSkills: string[];
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  formattingIssues: string[];
  improvementPlan: {
    priority: 'High' | 'Medium' | 'Low';
    category: 'Content' | 'Keywords' | 'Formatting';
    action: string;
    explanation: string;
    expectedBenefit: string;
  }[];
  skillBreakdown: SkillBreakdown[];
}

export type AnalysisStatus = 'idle' | 'analyzing' | 'success' | 'error';