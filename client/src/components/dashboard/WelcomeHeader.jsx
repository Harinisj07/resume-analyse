import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  UploadCloud,
  Compass,
  FileCheck,
  Target,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const WelcomeHeader = ({ candidate, targetRole, resumeStatus, onRescan }) => {
  const navigate = useNavigate();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-brand-950/40 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Decorative ambient gradient orbs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Avatar, Greeting, Candidate Summary */}
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Avatar with status indicator */}
          <div className="relative flex-shrink-0">
            {candidate?.avatar ? (
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-brand-500/30 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-lg">
                {candidate?.initials || 'JD'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900" />
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {candidate?.name || 'Candidate'}!
              </h1>
              <Badge variant="primary" size="sm" dot>
                Pro Candidate
              </Badge>
            </div>

            <p className="text-sm text-slate-300 flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-200">{candidate?.currentTitle}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-brand-400" />
                Targeting: <strong className="text-brand-300 font-semibold">{targetRole?.title}</strong>
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Resume: <span className="text-emerald-300 font-medium">{resumeStatus?.parseStatus || 'Parsed'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action CTAs */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
          <Button
            variant="secondary"
            size="md"
            icon={Compass}
            onClick={() => navigate('/career-guide')}
            className="hover:border-cyan-500/40"
          >
            Career Roadmap
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={UploadCloud}
            onClick={() => navigate('/analyzer')}
            className="shadow-lg shadow-brand-600/25"
          >
            Upload New Resume
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
