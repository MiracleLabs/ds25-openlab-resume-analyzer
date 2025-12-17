import { GoogleGenAI, Type, type Schema } from "@google/genai";
import type { AnalysisResult } from "../types";

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    atsScore: {
      type: Type.NUMBER,
      description:
        "Overall ATS score (0-100). Be critical. Most resumes should score between 40-80.",
    },
    parsabilityScore: {
      type: Type.NUMBER,
      description:
        "Score (0-100) indicating how easily an ATS can extract data. Penalize columns, tables, icons, and complex layouts.",
    },
    keywordMatchScore: {
      type: Type.NUMBER,
      description:
        "Score (0-100) based on industry standards for the inferred role. Check for hard skills coverage.",
    },
    candidateName: {
      type: Type.STRING,
      description:
        "Candidate's full name extracted exactly as it appears at the top.",
    },
    candidateTitle: {
      type: Type.STRING,
      description:
        "The professional title inferred from the resume (e.g., 'Senior Product Manager') or the most recent role.",
    },
    contactInfo: {
      type: Type.OBJECT,
      properties: {
        email: { type: Type.STRING, description: "Extracted email address." },
        phone: { type: Type.STRING, description: "Extracted phone number." },
        location: {
          type: Type.STRING,
          description: "City and State/Country inferred from the resume.",
        },
      },
      required: ["email", "phone", "location"],
      description: "Candidate's contact information.",
    },
    professionalSummary: {
      type: Type.STRING,
      description:
        "The summary section text. If missing, generate a concise professional summary based on experience.",
    },
    workExperience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          company: { type: Type.STRING },
          duration: { type: Type.STRING },
          description: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["role", "company", "duration", "description"],
      },
      description: "Chronological work history extracted from the resume.",
    },
    extractedSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Comprehensive list of extracted technical and soft skills.",
    },
    missingKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Critical keywords missing for this specific role/industry that are commonly found in Job Descriptions for this role.",
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List 3-5 strong selling points of the candidate.",
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "List 3-5 areas where the resume falls short (e.g., passive voice, lack of metrics).",
    },
    formattingIssues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Specific formatting errors (e.g., 'Header in footer', 'Tables used', 'Font too small').",
    },
    improvementPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          category: {
            type: Type.STRING,
            enum: ["Content", "Keywords", "Formatting"],
          },
          action: {
            type: Type.STRING,
            description: "Short actionable title, e.g., 'Quantify Impact'.",
          },
          explanation: {
            type: Type.STRING,
            description: "Detailed explanation of what to fix and why.",
          },
          expectedBenefit: {
            type: Type.STRING,
            description: "E.g., 'Could boost score by ~5 points'.",
          },
        },
        required: [
          "priority",
          "category",
          "action",
          "explanation",
          "expectedBenefit",
        ],
      },
      description: "Actionable improvement steps prioritized by impact.",
    },
    skillBreakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          score: { type: Type.NUMBER },
        },
        required: ["category", "score"],
      },
    },
  },
  required: [
    "atsScore",
    "parsabilityScore",
    "keywordMatchScore",
    "candidateName",
    "candidateTitle",
    "contactInfo",
    "professionalSummary",
    "workExperience",
    "extractedSkills",
    "missingKeywords",
    "strengths",
    "weaknesses",
    "formattingIssues",
    "improvementPlan",
    "skillBreakdown",
  ],
};

export const analyzeResumeWithGemini = async (
  base64Pdf: string
): Promise<AnalysisResult> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "API Key is missing. Please check your environment configuration."
    );
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Pdf,
            },
          },
          {
            text: `PLACE YOUR PROMPT FOR RESUME ANALYSIS HERE`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response extracted from Gemini.");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
