import React from 'react';
import {
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  HelpCircle,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import Card from '../common/Card';
import Badge from '../common/Badge';

export const ResumeScoreCard = ({ resumeScore }) => {
  const score = resumeScore?.overallScore || 0;
  const breakdown = resumeScore?.breakdown || {};
  const history = resumeScore?.scoreHistory || [];

  // Color gradient dynamic classes depending on score
  const getScoreColor = (val) => {
    if (val >= 80) return 'text-emerald-400 from-emerald-500 to-teal-400';
    if (val >= 65) return 'text-brand-400 from-brand-500 to-indigo-400';
    return 'text-amber-400 from-amber-500 to-orange-400';
  };

  const getScoreStroke = (val) => {
    if (val >= 80) return '#10b981';
    if (val >= 65) return '#6366f1';
    return '#f59e0b';
  };

  return (
    <Card className="flex flex-col justify-between h-full relative overflow-hidden">
      {/* Decorative ambient aura */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">ATS Resume Score</h3>
              <p className="text-xs text-slate-400">Composite parsing & keyword index</p>
            </div>
          </div>
          <Badge variant="success" size="sm">
            {resumeScore?.grade || 'Excellent'}
          </Badge>
        </div>

        {/* Big Score Hero with Circular Progression & Metric */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-5">
          <div className="flex items-baseline gap-3">
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-baseline">
              <span className={`bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
                {score}
              </span>
              <span className="text-xl sm:text-2xl text-slate-500 font-semibold ml-1">/100</span>
            </div>

            <div className="space-y-1">
              {resumeScore?.trend && (
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 w-fit">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{resumeScore.trend} pts</span>
                </div>
              )}
              <p className="text-[11px] text-slate-400">Top {100 - (resumeScore?.percentileRank || 90)}% of applicants</p>
            </div>
          </div>

          {/* Sparkline chart with Recharts */}
          <div className="h-16 w-full">
            <p className="text-[10px] text-slate-400 mb-1 text-right">Score Progression</p>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getScoreStroke(score)} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={getScoreStroke(score)} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-700 text-xs px-2 py-1 rounded shadow-lg">
                          <span className="text-slate-300">{payload[0].payload.scan}: </span>
                          <span className="font-bold text-white">{payload[0].value}/100</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={getScoreStroke(score)}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreAreaGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ATS Category Breakdown Progress Bars */}
        <div className="space-y-3">
          {Object.entries(breakdown).map(([key, item]) => {
            const labelMap = {
              keywords: 'Keywords Density',
              formatting: 'Clean Formatting',
              contentImpact: 'Content & Impact Metrics',
              relevance: 'Role Relevance',
            };
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{labelMap[key] || key}</span>
                  <span className="font-mono text-slate-200 font-semibold">{item.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-brand-500 to-indigo-400"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="truncate">{resumeScore?.summary || 'High keyword density'}</span>
      </div>
    </Card>
  );
};

export default ResumeScoreCard;
