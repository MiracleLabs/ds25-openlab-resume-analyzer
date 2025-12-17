import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { SkillBreakdown } from '../types';

interface ScoreChartProps {
  score: number;
  skillBreakdown: SkillBreakdown[];
}

const ScoreChart: React.FC<ScoreChartProps> = ({ score, skillBreakdown }) => {
  // Brand colors mapping
  const BRAND_MEDIUM_BLUE = '#2368a0'; // High score / Good
  const BRAND_LIGHT_BLUE = '#00aae7';  // Medium score
  const BRAND_RED = '#ef4048';         // Low score / Bad

  const getScoreColor = (val: number) => {
    if (val >= 80) return BRAND_MEDIUM_BLUE;
    if (val >= 60) return BRAND_LIGHT_BLUE;
    return BRAND_RED;
  };

  const scoreData = [
    { name: 'Max', value: 100, fill: 'transparent' },
    { name: 'Score', value: score, fill: getScoreColor(score) }
  ];

  // Data for radar chart
  const radarData = skillBreakdown.map(item => ({
    subject: item.category,
    A: item.score,
    fullMark: 100,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* ATS Score Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-lightgrey/30 flex flex-col items-center justify-center relative overflow-hidden">
        <h3 className="text-lg font-bold text-brand-darkblue mb-2 uppercase tracking-wide">Overall ATS Score</h3>
        <div className="relative h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              barSize={20}
              data={scoreData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                background={{ fill: '#f1f5f9' }}
                dataKey="value"
                cornerRadius={30}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[10%] text-center">
            <span className="text-6xl font-bold" style={{ color: getScoreColor(score) }}>
              {score}
            </span>
            <p className="text-brand-lightgrey font-medium">/ 100</p>
          </div>
        </div>
        <p className="text-center text-brand-darkgrey text-sm mt-[-2rem] font-medium">
          {score >= 80 ? "Excellent! Your resume is highly optimized." : score >= 60 ? "Good start, but needs refinement." : "Significant improvements recommended."}
        </p>
      </div>

      {/* Skills Radar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-lightgrey/30">
        <h3 className="text-lg font-bold text-brand-darkblue mb-4 text-center uppercase tracking-wide">Category Breakdown</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8c8c8c', fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Skill Level"
                dataKey="A"
                stroke={BRAND_LIGHT_BLUE}
                strokeWidth={2}
                fill={BRAND_LIGHT_BLUE}
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ScoreChart;