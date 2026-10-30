import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Target,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Clock,
  History,
  Trash2,
  X,
  Plus,
  Info,
  ChevronDown,
  Check,
  Award,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const SkillGapPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State: Roles & Resumes
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableResumes, setAvailableResumes] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');

  // Active target role object
  const [targetRole, setTargetRole] = useState(null);

  // Analysis result state
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [warningMessage, setWarningMessage] = useState(null);

  // Filter for skill gaps table: 'all' | 'High' | 'Medium' | 'Low'
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Saved analyses history drawer/modal
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [savingNotice, setSavingNotice] = useState(null);

  // Load available roles & resumes on initial mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch available target roles from database
        const rolesRes = await api.getRoles();
        const rolesList = rolesRes.success ? rolesRes.data : [];
        setAvailableRoles(rolesList);

        // 2. Fetch available user/system resumes from database
        let resumesList = [];
        try {
          const resumesRes = await api.getResumes();
          if (resumesRes.success && Array.isArray(resumesRes.data)) {
            resumesList = resumesRes.data;
          }
        } catch (resErr) {
          console.warn('Could not fetch resumes list:', resErr.message);
        }
        setAvailableResumes(resumesList);

        // 3. Determine initial Target Role
        let initialRole = null;
        if (location.state?.roleId) {
          initialRole = rolesList.find((r) => r._id === location.state.roleId);
        }
        if (!initialRole && location.state?.targetRole) {
          initialRole = rolesList.find(
            (r) => r.name.toLowerCase() === String(location.state.targetRole).toLowerCase()
          );
        }
        if (!initialRole && user?.targetRoleId) {
          initialRole = rolesList.find((r) => r._id === user.targetRoleId);
        }
        if (!initialRole && user?.targetRole) {
          initialRole = rolesList.find(
            (r) => r.name.toLowerCase() === String(user.targetRole).toLowerCase()
          );
        }
        if (!initialRole && localStorage.getItem('targetRole')) {
          const stored = localStorage.getItem('targetRole');
          initialRole = rolesList.find((r) => r.name.toLowerCase() === stored.toLowerCase());
        }
        if (!initialRole && rolesList.length > 0) {
          initialRole = rolesList[0];
        }

        if (initialRole) {
          setTargetRole(initialRole);
          setSelectedRoleId(initialRole._id);
        }

        // 4. Determine initial Resume
        let initialResume = null;
        if (location.state?.resumeId) {
          initialResume = resumesList.find((r) => r._id === location.state.resumeId);
        }
        if (!initialResume && resumesList.length > 0) {
          // Prefer resume with extractedSkills
          const withSkills = resumesList.find(
            (r) => Array.isArray(r.extractedSkills) && r.extractedSkills.length > 0
          );
          initialResume = withSkills || resumesList[0];
        }

        if (initialResume) {
          setSelectedResumeId(initialResume._id);
        }

        // 5. Run initial skill gap analysis if role is resolved
        if (initialRole) {
          await runAnalysis({
            roleId: initialRole._id,
            resumeId: initialResume?._id || null,
            skills: location.state?.currentSkills || null,
          });
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to initialize Skill Gap Analysis module');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [location.state]);

  // Run skill gap comparison API and save to database
  const runAnalysis = async ({ roleId, resumeId, skills, save = true }) => {
    try {
      setAnalyzing(true);
      setError(null);
      setWarningMessage(null);

      const targetId = roleId || selectedRoleId;
      const targetResId = resumeId !== undefined ? resumeId : selectedResumeId;

      const payload = {
        roleId: targetId,
        resumeId: targetResId || null,
        skills: skills || null,
        save,
      };

      const response = await api.analyzeSkillGap(payload);

      if (response.success && response.data) {
        setAnalysis(response.data);
        if (response.warning) {
          setWarningMessage(response.warning);
        }
        if (save) {
          showNotice('Skill gap analysis computed and saved to database.');
        }
      } else {
        throw new Error(response.message || 'Analysis calculation failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to perform skill gap analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  // Change target role
  const handleRoleChange = (e) => {
    const newRoleId = e.target.value;
    setSelectedRoleId(newRoleId);
    const found = availableRoles.find((r) => r._id === newRoleId);
    if (found) {
      setTargetRole(found);
      runAnalysis({ roleId: found._id, resumeId: selectedResumeId });
    }
  };

  // Change source resume
  const handleResumeChange = (e) => {
    const newResumeId = e.target.value;
    setSelectedResumeId(newResumeId);
    runAnalysis({ roleId: selectedRoleId, resumeId: newResumeId });
  };

  // Load saved analyses history from MongoDB
  const fetchSavedHistory = async () => {
    try {
      const res = await api.getSavedSkillGaps({ limit: 15 });
      if (res.success && Array.isArray(res.data)) {
        setSavedAnalyses(res.data);
        setShowHistoryModal(true);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Could not retrieve saved analyses history.');
    }
  };

  // Load an analysis from history
  const handleSelectHistorical = (item) => {
    setAnalysis(item);
    setSelectedRoleId(item.roleId);
    const foundRole = availableRoles.find((r) => r._id === item.roleId);
    if (foundRole) setTargetRole(foundRole);
    if (item.resumeId) setSelectedResumeId(item.resumeId);
    setShowHistoryModal(false);
    showNotice(`Loaded saved analysis for ${item.roleName}`);
  };

  // Delete saved analysis
  const handleDeleteHistorical = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteSkillGap(id);
      setSavedAnalyses((prev) => prev.filter((a) => a._id !== id));
      showNotice('Analysis record deleted from database.');
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const showNotice = (msg) => {
    setSavingNotice(msg);
    setTimeout(() => setSavingNotice(null), 3500);
  };

  // Filtered skill gaps based on priority tab
  const filteredGaps = useMemo(() => {
    if (!analysis?.skillGaps) return [];
    if (priorityFilter === 'all') return analysis.skillGaps;
    return analysis.skillGaps.filter((gap) => gap.priority === priorityFilter);
  }, [analysis, priorityFilter]);

  // Counts of gaps by priority
  const gapCounts = useMemo(() => {
    if (!analysis?.skillGaps) return { High: 0, Medium: 0, Low: 0, total: 0 };
    const counts = { High: 0, Medium: 0, Low: 0, total: analysis.skillGaps.length };
    analysis.skillGaps.forEach((gap) => {
      if (counts[gap.priority] !== undefined) counts[gap.priority]++;
    });
    return counts;
  }, [analysis]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-36 bg-white border border-slate-200 rounded-2xl animate-pulse" />
            <div className="h-36 bg-white border border-slate-200 rounded-2xl animate-pulse" />
            <div className="h-36 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Toast Notification */}
      {savingNotice && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{savingNotice}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Module Header Bar (Light Theme) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
                <Target className="w-3.5 h-3.5" />
                <span>Skill Gap Analysis Module</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Skill Gap & Role Alignment
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Compare your extracted resume skills against target role requirements. Identify matching proficiencies, prioritize missing skills, and calculate a transparent alignment score.
              </p>
            </div>

            {/* History & Re-analyze actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={fetchSavedHistory}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                title="View past skill gap analyses saved in database"
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>Saved History</span>
              </button>

              <button
                onClick={() => runAnalysis({ save: true })}
                disabled={analyzing || !selectedRoleId}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
                <span>{analyzing ? 'Evaluating...' : 'Recalculate & Save'}</span>
              </button>
            </div>
          </div>

          {/* Controls Selector Ribbon */}
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
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                  title="Browse target roles"
                >
                  Browse
                </button>
              </div>
            </div>

            {/* Resume Source Selector */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Extracted Skills Source (Resume)
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedResumeId}
                  onChange={handleResumeChange}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Profile Skills / Default</option>
                  {availableResumes.map((resume) => (
                    <option key={resume._id} value={resume._id}>
                      {resume.fileName || resume.title} ({resume.extractedSkills?.length || 0} skills)
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => navigate('/analyzer')}
                  className="px-2.5 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg shrink-0 transition-colors"
                  title="Upload a new resume"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Banner: Missing Resume Data Edge Case */}
        {warningMessage && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Missing Resume Skills Detected</p>
              <p className="text-amber-700">{warningMessage}</p>
              <div className="pt-1">
                <button
                  onClick={() => navigate('/analyzer')}
                  className="font-bold text-amber-900 underline hover:text-amber-950"
                >
                  Go to Resume Analyzer to upload and extract skills &rarr;
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
              onClick={() => runAnalysis({ save: false })}
              className="font-bold underline text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Metrics & Transparent Score Calculation Card */}
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Overall Score Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Skill Match
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    analysis.matchPercentage >= 70
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : analysis.matchPercentage >= 40
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {analysis.matchPercentage >= 70
                    ? 'Strong Fit'
                    : analysis.matchPercentage >= 40
                    ? 'Moderate Gap'
                    : 'Significant Gap'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 font-mono">
                  {analysis.matchPercentage}%
                </span>
                <span className="text-xs text-slate-400">weighted match</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.matchPercentage}%` }}
                />
              </div>
            </div>

            {/* Required Skills Match Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Required Skills
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {analysis.matchedRequiredSkills?.length || 0}
                </span>
                <span className="text-xs text-slate-500">
                  of {analysis.formulaBreakdown?.totalRequired || 0} matched
                </span>
              </div>
              <div className="text-xs text-slate-600">
                Match Rate: <strong className="text-slate-900">{analysis.requiredMatchPercentage}%</strong>
              </div>
              <div className="text-[11px] text-red-600 font-semibold">
                {analysis.missingRequiredSkills?.length || 0} missing required
              </div>
            </div>

            {/* Preferred Skills Match Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Preferred Skills
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {analysis.matchedPreferredSkills?.length || 0}
                </span>
                <span className="text-xs text-slate-500">
                  of {analysis.formulaBreakdown?.totalPreferred || 0} matched
                </span>
              </div>
              <div className="text-xs text-slate-600">
                Match Rate: <strong className="text-slate-900">{analysis.preferredMatchPercentage}%</strong>
              </div>
              <div className="text-[11px] text-blue-600 font-semibold">
                {analysis.missingPreferredSkills?.length || 0} missing additions
              </div>
            </div>

            {/* Actionable Gaps Summary Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Total Gap Priorities
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 font-bold">
                  {gapCounts.High} High
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                  {gapCounts.Medium} Med
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  {gapCounts.Low} Low
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                {gapCounts.total} total role skills missing from extracted resume.
              </p>
            </div>
          </div>
        )}

        {/* Transparent Formula Explanation Banner */}
        {analysis?.formulaBreakdown && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block">
                Transparent Skill-Match Calculation Formula:
              </span>
              <p className="font-mono text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                {analysis.formulaBreakdown.calculationText ||
                  '((MatchedRequired × 2) + (MatchedPreferred × 1)) / ((TotalRequired × 2) + (TotalPreferred × 1))'}
              </p>
              <p className="text-[11px] text-slate-500">
                Calculation rule: Required skills carry <strong>2x weighting</strong> as mandatory qualifications, while preferred skills carry <strong>1x weighting</strong>. No unverified job-market weights are applied.
              </p>
            </div>
          </div>
        )}

        {/* Categorized Skill Gaps Section */}
        {analysis && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Prioritized Skill Gaps for {analysis.roleName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Categorized as High, Medium, or Low priority based strictly on role requirements.
                </p>
              </div>

              {/* Priority Filters */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setPriorityFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    priorityFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({gapCounts.total})
                </button>
                <button
                  onClick={() => setPriorityFilter('High')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    priorityFilter === 'High'
                      ? 'bg-red-50 text-red-700 shadow-sm border border-red-200'
                      : 'text-slate-600 hover:text-red-700'
                  }`}
                >
                  High ({gapCounts.High})
                </button>
                <button
                  onClick={() => setPriorityFilter('Medium')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    priorityFilter === 'Medium'
                      ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-200'
                      : 'text-slate-600 hover:text-amber-700'
                  }`}
                >
                  Medium ({gapCounts.Medium})
                </button>
                <button
                  onClick={() => setPriorityFilter('Low')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    priorityFilter === 'Low'
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200'
                      : 'text-slate-600 hover:text-blue-700'
                  }`}
                >
                  Low ({gapCounts.Low})
                </button>
              </div>
            </div>

            {/* Skill Gaps List */}
            {filteredGaps.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  No skill gaps in this priority filter category!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredGaps.map((gap, index) => {
                  const isHigh = gap.priority === 'High';
                  const isMedium = gap.priority === 'Medium';

                  return (
                    <div
                      key={`${gap.skill}_${index}`}
                      className="p-4 rounded-xl border bg-white flex flex-col justify-between space-y-3 transition-shadow hover:shadow-sm"
                      style={{
                        borderColor: isHigh ? '#fecdd3' : isMedium ? '#fde68a' : '#bfdbfe',
                      }}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                              isHigh
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : isMedium
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {gap.priority} Priority
                          </span>
                          <span className="text-[10px] font-mono uppercase text-slate-400">
                            {gap.type === 'required' ? 'Required' : 'Preferred'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900">{gap.skill}</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{gap.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Matching Skills & Extracted Skills Inventory */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Matching Skills Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Matching Skills Identified ({analysis.matchedSkills?.length || 0})
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Verified
                </span>
              </div>

              {analysis.matchedSkills?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No matching skills found between extracted resume text and target role.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Extracted Resume Skills Inventory */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Extracted Resume Skills ({analysis.extractedSkills?.length || 0})
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">Deduplicated</span>
              </div>

              {analysis.extractedSkills?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No extracted skills found in this resume.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                  {analysis.extractedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Saved Analyses History Modal (Light Theme) */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Saved Skill Gap Analyses History
                  </h3>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {savedAnalyses.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No saved analyses found in the database.
                </p>
              ) : (
                <div className="space-y-2">
                  {savedAnalyses.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleSelectHistorical(item)}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-colors flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{item.roleName}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono">
                            {item.matchPercentage}% match
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Source: {item.resumeFileName} • {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteHistorical(item._id, e)}
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

export default SkillGapPage;
