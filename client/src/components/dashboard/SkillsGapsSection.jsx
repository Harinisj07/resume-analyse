import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  AlertTriangle,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const SkillsGapsSection = ({ missingSkills = [], highPrioritySkills = [] }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('high_priority'); // 'high_priority' | 'missing'

  return (
    <Card className="h-full flex flex-col justify-between relative overflow-hidden">
      {/* Decorative ambient aura */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header & View Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Skills Gap & Target Priorities</h3>
              <p className="text-xs text-slate-400">Target role prerequisites & high-impact additions</p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('high_priority')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'high_priority'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              High-Priority ({highPrioritySkills.length})
            </button>
            <button
              onClick={() => setActiveTab('missing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'missing'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Missing Gaps ({missingSkills.length})
            </button>
          </div>
        </div>

        {/* Tab 1: High-Priority Skills */}
        {activeTab === 'high_priority' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Acquiring these unlocks the top 10% candidate tier
              </span>
              <span className="text-emerald-400 font-semibold">+21% Total Match Boost</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {highPrioritySkills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">{skill.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          skill.priorityLevel === 1
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {skill.priorityTag}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {skill.matchBoost} Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{skill.reason}</p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                    <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/60">
                      Demand: <strong className="text-slate-200">{skill.demandScore}/100</strong>
                    </span>
                    <span className="text-xs font-medium text-brand-300 bg-brand-500/10 px-2 py-1 rounded-md border border-brand-500/20">
                      {skill.learningStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Missing Skills */}
        {activeTab === 'missing' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3 flex items-center justify-between text-xs text-slate-300">
              <span>Skills present in job postings but not detected in resume</span>
              <span className="text-brand-300 font-semibold">{missingSkills.length} identified</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {missingSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-white">{skill.name}</h4>
                      <Badge
                        variant={skill.importance === 'Critical' ? 'danger' : 'warning'}
                        size="sm"
                      >
                        {skill.importance}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{skill.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {skill.estimatedWeeks}
                    </span>
                    <span className="text-emerald-400 font-semibold">{skill.matchBoost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer link to skill gap and career guide */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-400">Add missing skills directly to your personalized plan</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/skill-gap')}
            className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
          >
            <span>In-Depth Gap Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate('/career-guide')}
            className="text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
          >
            <span>Career Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default SkillsGapsSection;
