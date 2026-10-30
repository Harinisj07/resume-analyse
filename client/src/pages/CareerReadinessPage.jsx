import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Target,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
  RefreshCw,
  History,
  Trash2,
  X,
  Info,
  ShieldCheck,
  Zap,
  ArrowRight,
  Flame,
  Clock,
  Layers,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CareerReadinessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Roles & Resumes list
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableResumes, setAvailableResumes] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');

  // Active Readiness Data
  const [readinessData, setReadinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [warningMessage, setWarningMessage] = useState(null);

  // Saved assessment history
  const [savedHistory, setSavedHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [notice, setNotice] = useState(null);

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch available roles
        const rolesRes = await api.getRoles();
        const rolesList = rolesRes.success ? rolesRes.data : [];
        setAvailableRoles(rolesList);

        // 2. Fetch available resumes
        let resumesList = [];
        try {
          const resumesRes = await api.getResumes();
          if (resumesRes.success && Array.isArray(resumesRes.data)) {
            resumesList = resumesRes.data;
          }
        } catch (rErr) {
          console.warn('Could not load resumes list:', rErr.message);
        }
        setAvailableResumes(resumesList);

        // 3. Determine target role
        let initRole = null;
        if (location.state?.roleId) {
          initRole = rolesList.find((r) => r._id === location.state.roleId);
        }
        if (!initRole && location.state?.targetRole) {
          initRole = rolesList.find(
            (r) => r.name.toLowerCase() === String(location.state.targetRole).toLowerCase()
          );
        }
        if (!initRole && user?.targetRoleId) {
          initRole = rolesList.find((r) => r._id === user.targetRoleId);
        }
        if (!initRole && user?.targetRole) {
          initRole = rolesList.find(
            (r) => r.name.toLowerCase() === String(user.targetRole).toLowerCase()
          );
        }
        if (!initRole && localStorage.getItem('targetRole')) {
          const stored = localStorage.getItem('targetRole');
          initRole = rolesList.find((r) => r.name.toLowerCase() === stored.toLowerCase());
        }
        if (!initRole && rolesList.length > 0) {
          initRole = rolesList[0];
        }

        if (initRole) {
          setSelectedRoleId(initRole._id);
        }

        // 4. Determine resume
        let initResume = null;
        if (location.state?.resumeId) {
          initResume = resumesList.find((r) => r._id === location.state.resumeId);
        }
        if (!initResume && resumesList.length > 0) {
          initResume =
            resumesList.find((r) => r.extractedSkills && r.extractedSkills.length > 0) ||
            resumesList[0];
        }

        if (initResume) {
          setSelectedResumeId(initResume._id);
        }

        // 5. Initial calculation
        if (initRole) {
          await runCalculation({
            roleId: initRole._id,
            resumeId: initResume?._id || null,
            save: true,
          });
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to initialize Career Readiness Score module');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [location.state]);

  // Recalculate score (triggers on role/resume changes or manual refresh)
  const runCalculation = async ({ roleId, resumeId, save = true }) => {
    try {
      setCalculating(true);
      setError(null);
      setWarningMessage(null);

      const targetId = roleId || selectedRoleId;
      const targetResId = resumeId !== undefined ? resumeId : selectedResumeId;

      const payload = {
        roleId: targetId,
        resumeId: targetResId || null,
        save,
      };

      const res = await api.calculateCareerReadiness(payload);

      if (res.success && res.data) {
        setReadinessData(res.data);
        if (res.warning) {
          setWarningMessage(res.warning);
        }
        if (save) {
          showNotice('Career readiness score calculated and persisted in database.');
        }
      } else {
        throw new Error(res.message || 'Calculation failed');
      }
    } catch (err) {
      console.error('Calculation error:', err);
      setError(err.message || 'Failed to calculate career readiness score');
    } finally {
      setCalculating(false);
    }
  };

  // Change target role -> trigger recalculation
  const handleRoleChange = (e) => {
    const newRoleId = e.target.value;
    setSelectedRoleId(newRoleId);
    runCalculation({ roleId: newRoleId, resumeId: selectedResumeId });
  };

  // Change resume -> trigger recalculation
  const handleResumeChange = (e) => {
    const newResumeId = e.target.value;
    setSelectedResumeId(newResumeId);
    runCalculation({ roleId: selectedRoleId, resumeId: newResumeId });
  };

  // Load history from MongoDB
  const fetchHistory = async () => {
    try {
      const res = await api.getSavedCareerReadiness({ limit: 15 });
      if (res.success && Array.isArray(res.data)) {
        setSavedHistory(res.data);
        setShowHistoryModal(true);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  // Select historical assessment
  const handleSelectHistory = (item) => {
    setReadinessData(item);
    setSelectedRoleId(item.roleId);
    if (item.resumeId) setSelectedResumeId(item.resumeId);
    setShowHistoryModal(false);
    showNotice(`Loaded saved assessment for ${item.roleName}`);
  };

  // Delete historical assessment
  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteCareerReadiness(id);
      setSavedHistory((prev) => prev.filter((h) => h._id !== id));
      showNotice('Assessment deleted from database.');
    } catch (err) {
      console.error('Failed to delete history record:', err);
    }
  };

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Tier styling helper
  const getTierBadgeStyle = (tier = '') => {
    switch (tier) {
      case 'Highly Competitive':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Job Ready':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'Approaching Ready':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
      case 'Developing':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      default:
        return 'bg-red-50 text-red-800 border-red-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-44 bg-white border border-slate-200 rounded-2xl animate-pulse" />
            <div className="h-44 bg-white border border-slate-200 rounded-2xl animate-pulse" />
            <div className="h-44 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const breakdown = readinessData?.scoreBreakdown || {};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Toast Notification */}
      {notice && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Module Header Bar (Light Theme) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold uppercase tracking-wider mb-2">
                <Compass className="w-3.5 h-3.5" />
                <span>Career Readiness Score Module</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Career Readiness Assessment
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Measures objective qualification alignment against target role benchmarks using your resume analysis and skill-gap results.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={fetchHistory}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>Saved History</span>
              </button>

              <button
                onClick={() => runCalculation({ save: true })}
                disabled={calculating || !selectedRoleId}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
                <span>{calculating ? 'Calculating...' : 'Recalculate & Save'}</span>
              </button>
            </div>
          </div>

          {/* Selectors Bar: Changing either recalculates score */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Role Selector */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Target Role Benchmark
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedRoleId}
                  onChange={handleRoleChange}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  {availableRoles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name} ({role.category})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => navigate('/roles')}
                  className="px-2.5 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg shrink-0 transition-colors"
                >
                  Browse
                </button>
              </div>
            </div>

            {/* Resume Selector */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Analyzed Resume Source
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedResumeId}
                  onChange={handleResumeChange}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Profile Skills / Default</option>
                  {availableResumes.map((resume) => (
                    <option key={resume._id} value={resume._id}>
                      {resume.fileName || resume.title} (ATS: {resume.atsScore || 0})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => navigate('/analyzer')}
                  className="px-2.5 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg shrink-0 transition-colors"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Banner: Missing/Outdated Resume Data Edge Case */}
        {warningMessage && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Missing or Outdated Resume Data</p>
              <p className="text-amber-700">{warningMessage}</p>
              <div className="pt-1">
                <button
                  onClick={() => navigate('/analyzer')}
                  className="font-bold text-amber-900 underline hover:text-amber-950"
                >
                  Upload a complete resume in the Resume Analyzer &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between text-xs text-red-700">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => runCalculation({ save: false })}
              className="font-bold underline text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* Readiness Score Card (Light Theme) */}
        {readinessData && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Overall Qualification Assessment
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {readinessData.readinessScore}
                  </span>
                  <span className="text-xl text-slate-400 font-bold">/ 100</span>
                  <span
                    className={`ml-2 px-3 py-1 rounded-full text-xs font-bold border ${getTierBadgeStyle(
                      readinessData.readinessTier
                    )}`}
                  >
                    {readinessData.readinessTier}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Targeted for: <strong className="text-slate-900">{readinessData.roleName}</strong> (
                  {readinessData.roleCategory})
                </p>
              </div>

              {/* Progress gauge visual */}
              <div className="w-full sm:w-64 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span>Readiness Progress</span>
                  <span className="font-mono">{readinessData.readinessScore}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-700"
                    style={{ width: `${readinessData.readinessScore}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400 block text-right">
                  Score scale: 0 to 100 points
                </span>
              </div>
            </div>

            {/* Documented Scoring Formula Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Documented Scoring Formula & Component Breakdown
                </h3>
              </div>

              {/* Mathematical formula display */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-mono text-xs text-slate-700 space-y-1">
                <p className="text-slate-900 font-bold">
                  Readiness Score = CoreSkills (0–60 pts) + PreferredSkills (0–20 pts) + ResumePrep (0–20 pts) − HighPriorityGapPenalty (0–15 pts)
                </p>
                <p className="text-slate-600 text-[11px]">
                  Applied: {breakdown.coreSkillsScore} pts (Core) + {breakdown.preferredSkillsScore} pts (Preferred) + {breakdown.resumeReadinessScore} pts (Resume) − {breakdown.highPriorityPenalty} pts (Penalty) = <strong className="text-indigo-700">{readinessData.readinessScore} / 100</strong>
                </p>
              </div>

              {/* Components Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Core Required Skills Component */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Core Required Skills</span>
                    <span className="text-slate-900 font-mono">
                      {breakdown.coreSkillsScore} / 60 pts
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full"
                      style={{ width: `${(breakdown.coreSkillsScore / 60) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Matched {breakdown.matchedRequiredCount} of {breakdown.totalRequiredCount} mandatory skills.
                    {breakdown.highPriorityPenalty > 0 && (
                      <span className="text-red-600 block mt-0.5">
                        Includes -{breakdown.highPriorityPenalty} pts deduction for missing high-priority prerequisites.
                      </span>
                    )}
                  </p>
                </div>

                {/* Preferred Skills Component */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Preferred Skills (Bonus)</span>
                    <span className="text-slate-900 font-mono">
                      {breakdown.preferredSkillsScore} / 20 pts
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-600 h-1.5 rounded-full"
                      style={{ width: `${(breakdown.preferredSkillsScore / 20) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Matched {breakdown.matchedPreferredCount} of {breakdown.totalPreferredCount} preferred differentiation competencies.
                  </p>
                </div>

                {/* Resume Structural Alignment Component */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Resume ATS Alignment</span>
                    <span className="text-slate-900 font-mono">
                      {breakdown.resumeReadinessScore} / 20 pts
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${(breakdown.resumeReadinessScore / 20) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Calculated from resume ATS indexing score ({breakdown.atsScore}/100) and section completeness.
                  </p>
                </div>
              </div>
            </div>

            {/* Mandatory Non-Guarantee Employment Disclaimer */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Assessment Disclaimer:</strong> This Career Readiness Score is a diagnostic self-improvement metric measuring objective qualification alignment. It evaluates resume content and role-skill data; it does not constitute an employment guarantee or hiring endorsement.
              </span>
            </div>
          </div>
        )}

        {/* Supporting Details: Strengths, Important Gaps, Areas to Improve */}
        {readinessData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Strengths Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Profile Strengths ({readinessData.strengths?.length || 0})
                </h3>
              </div>

              <div className="space-y-2.5">
                {(readinessData.strengths || []).map((strength, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Important Skill Gaps Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Flame className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Important Skill Gaps ({readinessData.criticalGaps?.length || 0})
                </h3>
              </div>

              {readinessData.criticalGaps?.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No critical required skill gaps identified.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {(readinessData.criticalGaps || []).map((gap, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-red-50/70 border border-red-200/80 text-xs text-red-900 flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-semibold">{gap}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Areas to Improve Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Actionable Areas to Improve ({readinessData.areasToImprove?.length || 0})
                </h3>
              </div>

              <div className="space-y-2.5">
                {(readinessData.areasToImprove || []).map((action, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900 flex items-start gap-2.5"
                  >
                    <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Links / Module Bridges */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-900 block mb-0.5">Explore Connected Modules</span>
            <span>Jump directly to Target Role Selection or Skill Gap Matrix.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/roles')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Target Roles
            </button>
            <button
              onClick={() =>
                navigate('/skill-gap', {
                  state: { roleId: selectedRoleId, resumeId: selectedResumeId },
                })
              }
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold"
            >
              Skill Gap Matrix
            </button>
            <button
              onClick={() =>
                navigate('/roadmap', {
                  state: { roleId: selectedRoleId, resumeId: selectedResumeId },
                })
              }
              className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold"
            >
              Learning Roadmap
            </button>
          </div>
        </div>

        {/* Saved Assessment History Modal (Light Theme) */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Saved Career Readiness History
                  </h3>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {savedHistory.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No saved readiness assessments found in the database.
                </p>
              ) : (
                <div className="space-y-2">
                  {savedHistory.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleSelectHistory(item)}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-colors flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{item.roleName}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-indigo-700 font-mono">
                            {item.readinessScore} / 100
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getTierBadgeStyle(
                              item.readinessTier
                            )}`}
                          >
                            {item.readinessTier}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Source: {item.resumeFileName} • {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteHistory(item._id, e)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                        title="Delete from database"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 text-right">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerReadinessPage;
