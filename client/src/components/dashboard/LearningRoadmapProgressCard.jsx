import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const LearningRoadmapProgressCard = ({ learningRoadmap }) => {
  const navigate = useNavigate();
  const overallProgress = learningRoadmap?.overallProgress || 0;
  const stages = learningRoadmap?.stages || [];

  return (
    <Card className="flex flex-col justify-between h-full relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Learning Roadmap Progress</h3>
              <p className="text-xs text-slate-400">Skill acquisition trajectory for target role</p>
            </div>
          </div>
          <Badge variant="primary" size="sm">
            {learningRoadmap?.completedHours || 0} / {learningRoadmap?.totalEstimatedHours || 0} hrs
          </Badge>
        </div>

        {/* Overall Progress Bar */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Overall Completion</span>
              <span className="text-xs text-brand-300 font-mono font-bold">({overallProgress}%)</span>
            </div>
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Target: <strong className="text-slate-300 font-normal">{learningRoadmap?.targetCompletionDate}</strong>
            </span>
          </div>

          <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-cyan-400 transition-all duration-700 shadow-md shadow-brand-500/30"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          <p className="text-xs text-slate-400 mt-2.5 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Active: <span className="text-slate-200 font-medium">{learningRoadmap?.currentStageName}</span>
          </p>
        </div>

        {/* 4-Stage Stepper Progression */}
        <div className="space-y-3">
          {stages.map((stage) => {
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress';

            return (
              <div
                key={stage.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isInProgress
                    ? 'bg-brand-950/20 border-brand-500/30 shadow-md shadow-brand-900/10'
                    : isCompleted
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
                    : 'bg-slate-900/20 border-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stage.stageNumber}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-semibold text-slate-200">
                          {stage.title}
                        </h4>
                        {isInProgress && (
                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                            In Progress ({stage.progress}%)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{stage.description}</p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {stage.skillsCovered?.map((sk) => (
                          <span
                            key={sk}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800/70 text-slate-300 border border-slate-700/50"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 whitespace-nowrap">{stage.hours}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400">Step-by-step curriculum and resource links</span>
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowRight}
          onClick={() => navigate('/roadmap')}
          className="text-xs text-brand-400 hover:text-brand-300 hover:bg-brand-500/10"
        >
          View Full Curriculum
        </Button>
      </div>
    </Card>
  );
};

export default LearningRoadmapProgressCard;
