import React from 'react';
import {
  BrainCircuit,
  MessageSquare,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const InterviewReadinessCard = ({ interviewReadiness }) => {
  const overallScore = interviewReadiness?.overallScore || 0;
  const domains = interviewReadiness?.domains || [];

  return (
    <Card className="flex flex-col justify-between h-full relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Interview Readiness</h3>
              <p className="text-xs text-slate-400">Technical & architectural interview benchmarks</p>
            </div>
          </div>
          <Badge variant="primary" size="sm">
            {interviewReadiness?.statusText || 'Competitive'}
          </Badge>
        </div>

        {/* Score Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-purple-400">
              {overallScore}%
            </span>
            <span className="text-xs text-slate-400">Overall Technical Readiness</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Mock Sessions</span>
            <div className="text-xs font-semibold text-white">
              {interviewReadiness?.mockInterviewsCompleted || 0} Completed
            </div>
          </div>
        </div>

        {/* 4 Domain Readiness Bars */}
        <div className="space-y-3 mb-4">
          {domains.map((dom) => {
            const getColor = (val) => {
              if (val >= 85) return 'bg-emerald-500';
              if (val >= 75) return 'bg-brand-500';
              return 'bg-amber-500';
            };

            return (
              <div key={dom.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{dom.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{dom.rating}</span>
                    <span className="font-mono text-slate-200 font-bold">{dom.score}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getColor(dom.score)}`}
                    style={{ width: `${dom.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommended Action Highlight */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Recommended Focus: </span>
            <span className="text-slate-400">{interviewReadiness?.nextRecommendedAction}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Tailored for Senior / Staff System Design</span>
        <span className="text-purple-400 font-medium">Ready for Screening</span>
      </div>
    </Card>
  );
};

export default InterviewReadinessCard;
