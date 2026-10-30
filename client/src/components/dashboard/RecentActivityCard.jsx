import React from 'react';
import {
  History,
  FileCheck,
  Target,
  CheckCircle2,
  Briefcase,
  Upload,
  ArrowRight,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export const RecentActivityCard = ({ recentActivity = [] }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'scan':
        return <FileCheck className="w-4 h-4 text-emerald-400" />;
      case 'target_role':
        return <Target className="w-4 h-4 text-brand-400" />;
      case 'milestone':
        return <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
      case 'match':
        return <Briefcase className="w-4 h-4 text-amber-400" />;
      case 'upload':
        return <Upload className="w-4 h-4 text-indigo-400" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Card className="flex flex-col justify-between h-full relative overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Recent Activity</h3>
              <p className="text-xs text-slate-400">Timeline of scans, updates, and milestones</p>
            </div>
          </div>
          <Badge variant="default" size="sm">
            {recentActivity.length} Events
          </Badge>
        </div>

        {/* Timeline Events List */}
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700/80 transition-all"
            >
              {/* Event Icon */}
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0 mt-0.5">
                {getIcon(activity.type)}
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-200 truncate">
                    {activity.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {activity.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {activity.description}
                </p>
              </div>

              <Badge variant={activity.badgeVariant || 'default'} size="sm">
                {activity.badge}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Logged automatically by AI Resume Analyzer</span>
        <span className="text-slate-300 font-medium">Real-time Telemetry</span>
      </div>
    </Card>
  );
};

export default RecentActivityCard;
