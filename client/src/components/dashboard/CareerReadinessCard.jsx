import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import Card from '../common/Card';
import Badge from '../common/Badge';

export const CareerReadinessCard = ({ careerReadiness, targetRole }) => {
  const navigate = useNavigate();
  const score = careerReadiness?.score || 0;
  const radarData = careerReadiness?.radarCompetencies || [];

  return (
    <Card className="flex flex-col justify-between h-full relative overflow-hidden">
      {/* Decorative aura */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Career Readiness</h3>
              <p className="text-xs text-slate-400">Target role progression & benchmark</p>
            </div>
          </div>
          <Badge variant="cyan" size="sm">
            {careerReadiness?.tier || 'Senior Tier'}
          </Badge>
        </div>

        {/* Readiness Metric Highlight */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
          <div>
            <span className="text-xs text-slate-400">Preparedness Level</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold text-cyan-400">{score}%</span>
              <span className="text-xs text-slate-300 font-medium">{careerReadiness?.statusLabel}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400">Est. Time to Goal</span>
            <div className="text-sm font-semibold text-white mt-0.5">
              {careerReadiness?.estimatedTimeToGoal || '3 - 4 Weeks'}
            </div>
          </div>
        </div>

        {/* Recharts Radar Chart for Core Competencies */}
        <div className="h-56 w-full -my-2">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#334155" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-xs shadow-xl space-y-1">
                        <p className="font-semibold text-white">{data.subject}</p>
                        <p className="text-cyan-400">Candidate: <span className="font-bold">{data.current}%</span></p>
                        <p className="text-slate-400">Role Benchmark: <span className="font-bold">{data.benchmark}%</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Radar
                name="Candidate"
                dataKey="current"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.35}
              />
              <Radar
                name="Benchmark"
                dataKey="benchmark"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.15}
                strokeDasharray="4 4"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-5 text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            Candidate Competency
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400 opacity-60" />
            Market Benchmark
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          Milestones: {careerReadiness?.milestonesCompleted}/{careerReadiness?.milestonesTotal} Completed
        </span>
        <button
          onClick={() => navigate('/career-readiness')}
          className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
        >
          <span>Full Assessment</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
};

export default CareerReadinessCard;
