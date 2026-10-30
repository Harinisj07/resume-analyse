import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  DollarSign,
  TrendingUp,
  Briefcase,
  Layers,
  ChevronDown,
  Check,
  Building,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export const TargetRoleCard = ({ targetRole, onRoleChange }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelectRole = (alt) => {
    if (onRoleChange) {
      onRoleChange(alt);
    }
    setDropdownOpen(false);
  };

  return (
    <Card className="flex flex-col justify-between h-full relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Target Role</h3>
              <p className="text-xs text-slate-400">Selected career benchmark objective</p>
            </div>
          </div>
          <Badge variant="warning" size="sm">
            {targetRole?.marketDemand || 'Very High'} Demand
          </Badge>
        </div>

        {/* Selected Role Main Container */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-4 relative">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400/90 font-semibold">
                Active Benchmark
              </span>
              <h4 className="text-lg font-bold text-white mt-0.5">
                {targetRole?.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                {targetRole?.industry}
              </p>
            </div>

            {/* Target Role Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-slate-600 transition-colors text-xs flex items-center gap-1"
                aria-label="Switch Target Role"
              >
                <span>Switch</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-30 animate-fade-in">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Alternate Roles
                  </p>
                  {targetRole?.availableAlternatives?.map((alt) => (
                    <button
                      key={alt.id}
                      onClick={() => handleSelectRole(alt)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                    >
                      <span className="truncate">{alt.title}</span>
                      <span className="text-amber-400 font-semibold text-[11px] ml-2">
                        {alt.matchScore}% fit
                      </span>
                    </button>
                  ))}
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/roles');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800 text-brand-400 hover:text-brand-300 font-semibold flex items-center justify-between transition-colors"
                  >
                    <span>Browse All Target Roles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
            {targetRole?.description}
          </p>
        </div>

        {/* Market Data Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Avg. Compensation
            </span>
            <span className="text-sm font-bold text-white font-mono">
              {targetRole?.avgSalaryRange}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1 mb-1">
              <Briefcase className="w-3.5 h-3.5 text-brand-400" />
              Active Listings
            </span>
            <span className="text-sm font-bold text-white">
              {targetRole?.openMarketRoles}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Seniority: <strong className="text-slate-200">{targetRole?.level}</strong></span>
        <span className="text-amber-400 font-medium">Difficulty: {targetRole?.difficulty}</span>
      </div>
    </Card>
  );
};

export default TargetRoleCard;
