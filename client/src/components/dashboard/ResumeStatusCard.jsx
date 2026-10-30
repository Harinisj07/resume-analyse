import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import Card, { CardHeader } from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const ResumeStatusCard = ({ resumeStatus, onRescan }) => {
  const navigate = useNavigate();

  const sections = [
    { key: 'summary', label: 'Summary', active: resumeStatus?.detectedSections?.summary },
    { key: 'experience', label: 'Experience', active: resumeStatus?.detectedSections?.experience },
    { key: 'skills', label: 'Skills', active: resumeStatus?.detectedSections?.skills },
    { key: 'education', label: 'Education', active: resumeStatus?.detectedSections?.education },
    { key: 'certifications', label: 'Certs', active: resumeStatus?.detectedSections?.certifications },
    { key: 'projects', label: 'Projects', active: resumeStatus?.detectedSections?.projects },
  ];

  return (
    <Card className="flex flex-col justify-between h-full relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Resume Status</h3>
              <p className="text-xs text-slate-400">Active parsing and indexing state</p>
            </div>
          </div>
          <Badge variant="success" size="sm" dot>
            {resumeStatus?.health || 'Optimal'}
          </Badge>
        </div>

        {/* File Details Box */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                PDF
              </span>
              <span className="text-sm font-medium text-slate-200 truncate" title={resumeStatus?.fileName}>
                {resumeStatus?.fileName || 'resume_latest.pdf'}
              </span>
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">{resumeStatus?.fileSize}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Scanned: <strong className="text-slate-300 font-normal">{resumeStatus?.lastScanned}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Length: <strong className="text-slate-300 font-normal">{resumeStatus?.wordCount} words ({resumeStatus?.pageCount}p)</strong></span>
            </div>
          </div>
        </div>

        {/* ATS Sections Coverage Checklist */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium text-slate-300">ATS Section Coverage</span>
            <span className="text-emerald-400 font-semibold">{resumeStatus?.sectionsCoverage || 100}% Complete</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {sections.map((sec) => (
              <div
                key={sec.key}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border ${
                  sec.active
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : 'bg-slate-800/40 text-slate-500 border-slate-800'
                }`}
              >
                {sec.active ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-slate-500 flex-shrink-0" />
                )}
                <span className="truncate">{sec.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={onRescan}
          className="text-xs"
        >
          Re-Scan
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={ExternalLink}
          onClick={() => navigate('/analyzer')}
          className="text-xs text-brand-400 hover:text-brand-300 hover:bg-brand-500/10"
        >
          View Full Breakdown
        </Button>
      </div>
    </Card>
  );
};

export default ResumeStatusCard;
