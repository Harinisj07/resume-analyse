import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Trash2,
  ArrowUpRight,
  Clock,
  Award,
  AlertCircle,
  User,
  Layers,
} from 'lucide-react';
import Card, { CardHeader } from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const RecentAnalyses = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'mine'

  const fetchResumes = async (mode = filterMode) => {
    setLoading(true);
    try {
      const params = mode === 'mine' && isAuthenticated ? { mine: 'true' } : {};
      const res = await api.getResumes(params);
      setResumes(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch resume scan history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes(filterMode);
  }, [filterMode, isAuthenticated]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this resume analysis record?')) return;
    try {
      await api.deleteResume(id);
      setResumes(resumes.filter((r) => r._id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleRowClick = (resumeId) => {
    navigate('/analyzer', { state: { resumeId } });
  };

  return (
    <Card>
      <CardHeader
        title="Resume Scans & History"
        subtitle="Click any past scan to inspect full ATS evaluation and skills report"
        icon={FileText}
        action={
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filterMode === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Scans
                </button>
                <button
                  onClick={() => setFilterMode('mine')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filterMode === 'mine'
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  My Resumes
                </button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchResumes(filterMode)}
              icon={Clock}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {loading && (
        <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-slate-600 border-t-brand-400 rounded-full animate-spin" />
          <span>Loading scan records from database...</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>No historical records found or MongoDB collection is initializing.</span>
        </div>
      )}

      {!loading && !error && resumes.length === 0 && (
        <div className="py-8 text-center space-y-2">
          <p className="text-xs text-slate-400">
            {filterMode === 'mine'
              ? "You haven't analyzed any resumes under your account yet."
              : 'No resumes analyzed yet. Head over to the Resume Analyzer to test the NLP pipeline.'}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/analyzer')}
            icon={ArrowUpRight}
          >
            Launch Resume Analyzer
          </Button>
        </div>
      )}

      {!loading && resumes.length > 0 && (
        <div className="divide-y divide-slate-800/80">
          {resumes.slice(0, 8).map((resume) => {
            const score = resume.atsScore ?? 0;
            const scoreVariant = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';

            return (
              <div
                key={resume._id}
                onClick={() => handleRowClick(resume._id)}
                className="py-3 px-3 flex items-center justify-between gap-4 hover:bg-slate-900/60 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-slate-800/80"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 group-hover:bg-brand-600/20 border border-slate-700/80 group-hover:border-brand-500/40 text-slate-300 group-hover:text-brand-400 transition-colors shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-semibold text-slate-200 group-hover:text-white truncate transition-colors">
                        {resume.title || resume.fileName || 'Untitled Resume'}
                      </h5>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {resume.fileType}
                      </span>
                      {resume.userId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                          <User className="w-2.5 h-2.5" />
                          <span>Saved</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      Target Role: <span className="text-slate-300">{resume.targetRole || 'Not specified'}</span> • {resume.extractedSkills?.length || 0} skills detected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={scoreVariant} size="sm">
                    {score} / 100 ATS
                  </Badge>
                  <span className="hidden sm:flex items-center gap-1 text-[11px] text-brand-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>View Report</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(resume._id, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default RecentAnalyses;
