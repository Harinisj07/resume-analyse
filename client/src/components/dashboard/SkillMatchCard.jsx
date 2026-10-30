import React from 'react';
import {
  CheckCircle,
  BarChart3,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Card from '../common/Card';
import Badge from '../common/Badge';

export const SkillMatchCard = ({ skillMatch }) => {
  const overallPercentage = skillMatch?.overallPercentage || 0;
  const categories = skillMatch?.categories || [];

  return (
    <Card className="flex flex-col justify-between h-full relative overflow-hidden">
      {/* Decorative ambient aura */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Skill Match Percentage</h3>
              <p className="text-xs text-slate-400">Candidate skillset vs target requirements</p>
            </div>
          </div>
          <Badge variant="primary" size="sm">
            {skillMatch?.matchedCount}/{skillMatch?.totalRequiredCount} Skills Matched
          </Badge>
        </div>

        {/* Overall Percentage Hero */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-brand-400">
              {overallPercentage}%
            </span>
            <span className="text-xs text-slate-400">Overall Match Score</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              High Compatibility
            </span>
          </div>
        </div>

        {/* Recharts Horizontal Bar Chart */}
        <div className="h-52 w-full -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={categories}
              margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={120}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-xs shadow-xl space-y-1">
                        <p className="font-semibold text-white">{data.name}</p>
                        <p className="text-brand-400">Match: <span className="font-bold">{data.matched}%</span></p>
                        <p className="text-slate-400">Coverage: {data.count}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="matched"
                radius={[0, 6, 6, 0]}
                barSize={12}
                fill="#6366f1"
              >
                {categories.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.matched >= 85 ? '#6366f1' : entry.matched >= 75 ? '#818cf8' : '#a5b4fc'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Required Skills Met: <strong className="text-white">{skillMatch?.matchedCount} of {skillMatch?.totalRequiredCount}</strong></span>
        <span className="text-brand-300 font-medium">Gap: {skillMatch?.totalRequiredCount - skillMatch?.matchedCount} skills</span>
      </div>
    </Card>
  );
};

export default SkillMatchCard;
