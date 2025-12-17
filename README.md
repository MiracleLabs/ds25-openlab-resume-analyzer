# AI Resume Analyzer

An intelligent resume analysis tool powered by Google's Gemini AI that provides comprehensive feedback on resume quality, ATS compatibility, and actionable improvement recommendations.

## Features

- **ATS Score Analysis**: Get an overall ATS (Applicant Tracking System) compatibility score (0-100)
- **Parsability Assessment**: Measure how easily ATS systems can extract data from your resume
- **Keyword Matching**: Score based on industry-standard keywords for your role
- **Resume Parsing**: Automatic extraction of:
  - Candidate name and professional title
  - Contact information (email, phone, location)
  - Professional summary
  - Work experience with descriptions
  - Extracted skills
- **Detailed Feedback**:
  - Missing critical keywords for your role
  - Resume strengths and weaknesses
  - Formatting issues identification
  - Skill breakdown by category
- **Improvement Plan**: Prioritized actionable recommendations (High/Medium/Low) organized by category (Content/Keywords/Formatting)
- **Visual Dashboard**: Interactive charts and analytics to visualize your resume performance
- **PDF Export**: Download your analysis report as a PDF

## Tech Stack

- **Frontend**: Vite + React 19 with TypeScript
- **AI**: Google Gemini API (@google/genai)


## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository:
   git clone <repository-url>
   cd ai-resume-analyzer
  

2. Install dependencies: 
   npm install

3. Set up environment variables:
   Create a \.env.local\ file in the root directory and add your Google Gemini API key:
   \\\
   VITE_GEMINI_API_KEY=your_api_key_here
   \\\

### Development

Run the development server:
npm run dev

The application will be available at http://localhost:5173


## Usage

1. **Upload Resume**: Drag and drop a PDF file or click to browse and select your resume
2. **Wait for Analysis**: The AI will analyze your resume using Gemini AI
3. **Review Results**: Examine your scores, feedback, and recommendations on the dashboard
4. **Implement Improvements**: Use the improvement plan to enhance your resume
5. **Export Report**: Download your analysis as a PDF for future reference

## Analysis Metrics

### ATS Score (0-100)

Overall compatibility with Applicant Tracking Systems. Most resumes score between 40-80.

### Parsability Score (0-100)

How easily ATS can extract data. Penalizes use of:

- Multiple columns
- Tables
- Icons and graphics
- Complex layouts

### Keyword Match Score (0-100)

Industry-standard keyword coverage for the inferred role with emphasis on hard skills.
