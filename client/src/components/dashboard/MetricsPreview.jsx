import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import Card, { CardHeader } from '../common/Card';
import { BarChart3, Target } from 'lucide-react';

const mockAtsData = [
  { category: 'Formatting', score: 92, target: 85 },
  { category: 'Keywords', score: 74, target: 80 },
  { category: 'Experience', score: 88, target: 85 },
  { category: 'Hard Skills', score: 81, target: 90 },
  { category: 'Education', score: 95, target: 70 },
  { category: 'Impact Metrics', score: 65, target: 75 },
];

const mockRadarData = [
  { subject: 'Frontend', A: 90, fullMark: 100 },
  { subject: 'Backend', A: 85, fullMark: 100 },
  { subject: 'Cloud & DevOps', A: 65, fullMark: 100 },
  { subject: 'Data & AI', A: 75, fullMark: 100 },
  { subject: 'Testing', A: 70, fullMark: 100 },
  { subject: 'System Design', A: 80, fullMark: 100 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-700 shadow-xl backdrop-blur-md text-xs">
        <p className="font-semibold text-slate-100 mb-1">{label}</p>
        <p className="text-brand-400">Score: {payload[0].value}%</p>
        {payload[1] && <p className="text-slate-400">Target: {payload[1].value}%</p>}
      </div>
    );
  }
  return null;
};

export const MetricsPreview = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ATS Category Breakdown */}
      <Card>
        <CardHeader
          title="ATS Optimization Breakdown"
          subtitle="Real-time category scoring benchmarked against industry standards"
          icon={BarChart3}
        />
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockAtsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="target" fill="#334155" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Candidate Skill Vector Radar */}
      <Card>
        <CardHeader
          title="Skill Vector Radar"
          subtitle="Extracted technical competency mapping across primary domains"
          icon={Target}
        />
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={mockRadarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
              <Radar
                name="Proficiency"
                dataKey="A"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default MetricsPreview;
