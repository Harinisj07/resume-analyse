import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle,
  Clock,
  ExternalLink,
  BookOpen,
  Filter,
  Check,
  RotateCw,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const RoadmapPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Selection state
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableResumes, setAvailableResumes] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');

  // Active Roadmap state
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Filters
  const [stageFilter, setStageFilter] = useState('ALL'); // ALL | Beginner | Intermediate | Advanced
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // ALL | High | Medium | Low
  const [expandedSkills, setExpandedSkills] = useState({});

  // 1. Initial Load: Fetch Roles, Resumes, and active/latest Roadmap
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch roles
        const rolesRes = await api.getRoles();
        const rolesList = rolesRes.success ? rolesRes.data : [];
        if (isMounted) setAvailableRoles(rolesList);

        // Fetch resumes
        let resumesList = [];
        try {
          const resumesRes = await api.getResumes();
          if (resumesRes.success && Array.isArray(resumesRes.data)) {
            resumesList = resumesRes.data;
            if (isMounted) setAvailableResumes(resumesList);
          }
        } catch (rErr) {
          console.warn('Could not load resumes list:', rErr.message);
        }

        // Determine default role & resume IDs
        let initialRoleId = location.state?.roleId || '';
        let initialResumeId = location.state?.resumeId || '';

        if (!initialRoleId && user?.targetRoleId) {
          initialRoleId = user.targetRoleId;
        } else if (!initialRoleId && rolesList.length > 0) {
          initialRoleId = rolesList[0]._id;
        }

        if (!initialResumeId && resumesList.length > 0) {
          initialResumeId = resumesList[0]._id;
        }

        if (isMounted) {
          setSelectedRoleId(initialRoleId);
          setSelectedResumeId(initialResumeId);
        }

        // Check if saved roadmap exists for this resume and role
        const savedRoadmapsRes = await api.getSavedRoadmaps({
          ...(initialRoleId ? { roleId: initialRoleId } : {}),
          ...(initialResumeId ? { resumeId: initialResumeId } : {}),
        });

        if (savedRoadmapsRes.success && savedRoadmapsRes.data?.length > 0) {
          if (isMounted) setRoadmap(savedRoadmapsRes.data[0]);
        } else if (initialRoleId) {
          // Auto-generate roadmap if none saved yet
          const genRes = await api.generatePersonalizedRoadmap({
            roleId: initialRoleId,
            resumeId: initialResumeId,
          });
          if (isMounted && genRes.success) {
            setRoadmap(genRes.data);
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to initialize learning roadmap.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialize();
    return () => {
      isMounted = false;
    };
  }, [location.state, user]);

  // Expand all skills by default when roadmap loads
  useEffect(() => {
    if (roadmap?.stages) {
      const initialExpanded = {};
      roadmap.stages.forEach((stage) => {
        stage.skills.forEach((skill) => {
          initialExpanded[skill.id] = true;
        });
      });
      setExpandedSkills(initialExpanded);
    }
  }, [roadmap?._id]);

  // Handle Generate Roadmap
  const handleGenerateRoadmap = async () => {
    try {
      setGenerating(true);
      setError(null);
      setNotice(null);

      const res = await api.generatePersonalizedRoadmap({
        roleId: selectedRoleId,
        resumeId: selectedResumeId,
      });

      if (res.success && res.data) {
        setRoadmap(res.data);
        setNotice('Personalized learning roadmap generated successfully.');
        setTimeout(() => setNotice(null), 4000);
      } else {
        throw new Error(res.message || 'Roadmap generation failed.');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  // Handle Task Status Update (Not Started, In Progress, Completed)
  const handleStatusChange = async (taskId, newStatus) => {
    if (!roadmap?._id || !taskId) return;

    try {
      setUpdatingTaskId(taskId);
      setError(null);

      const res = await api.updateRoadmapTaskStatus(roadmap._id, taskId, newStatus);
      if (res.success && res.data) {
        setRoadmap(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to update task status.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const toggleSkillExpand = (skillId) => {
    setExpandedSkills((prev) => ({
      ...prev,
      [skillId]: !prev[skillId],
    }));
  };

  // Filter stages and skills based on current filters
  const filteredStages = useMemo(() => {
    if (!roadmap?.stages) return [];

    return roadmap.stages
      .map((stage) => {
        if (stageFilter !== 'ALL' && stage.stageName !== stageFilter) {
          return null;
        }

        const filteredSkills = stage.skills.filter((skill) => {
          if (priorityFilter !== 'ALL' && skill.priority !== priorityFilter) {
            return false;
          }
          return true;
        });

        if (filteredSkills.length === 0) return null;

        return {
          ...stage,
          skills: filteredSkills,
        };
      })
      .filter(Boolean);
  }, [roadmap, stageFilter, priorityFilter]);

  // Priority color helper (light theme)
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Stage badge color helper (light theme)
  const getStageBadgeClass = (stageName) => {
    switch (stageName) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Intermediate':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Advanced':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Light Theme Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Header Section */}
        <div className="border-b border-slate-200 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                  <Compass className="w-5 h-5" />
                </span>
                <h1 className="text-2xl font-bold text-slate-900">Personalized Learning Roadmap</h1>
              </div>
              <p className="text-sm text-slate-600">
                Actionable learning curriculum prioritized by your resume skills, target role, and career readiness.
              </p>
            </div>

            {roadmap && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  Target: <strong>{roadmap.roleName}</strong>
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                  Readiness: <strong>{roadmap.readinessScore}%</strong> ({roadmap.readinessTier})
                </span>
              </div>
            )}
          </div>

          {/* Controls: Role Selector, Resume Selector, Generate Button */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Career Role
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                {availableRoles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name} ({role.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Evaluated Resume
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                {availableResumes.length > 0 ? (
                  availableResumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.fileName || 'Candidate Resume'}
                    </option>
                  ))
                ) : (
                  <option value="">Default Extracted Profile</option>
                )}
              </select>
            </div>

            <div className="sm:col-span-3">
              <button
                onClick={handleGenerateRoadmap}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                <RotateCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                {generating ? 'Generating...' : 'Regenerate Roadmap'}
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {notice && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center text-slate-500">
            <RotateCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
            <p className="text-sm font-medium">Loading your personalized roadmap...</p>
          </div>
        )}

        {/* Main Content Area */}
        {!loading && roadmap && (
          <div>
            {/* Overall Progress Panel */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Overall Roadmap Progress</h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Completed <strong>{roadmap.completedTasks}</strong> of <strong>{roadmap.totalTasks}</strong> learning tasks
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-sky-600">{roadmap.overallProgress}%</span>
                  <span className="text-xs text-slate-500">
                    ({roadmap.summary?.estimatedTotalWeeks || '8-12 weeks'} total)
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-sky-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${roadmap.overallProgress}%` }}
                />
              </div>

              {/* Priority Count Metrics */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200 text-center">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 block">High Priority</span>
                  <span className="text-base font-bold text-red-700">
                    {roadmap.summary?.highPriorityCount || 0}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 block">Medium Priority</span>
                  <span className="text-base font-bold text-amber-700">
                    {roadmap.summary?.mediumPriorityCount || 0}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 block">Low Priority</span>
                  <span className="text-base font-bold text-slate-700">
                    {roadmap.summary?.lowPriorityCount || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
              {/* Stage Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" /> Stage:
                </span>
                {['ALL', 'Beginner', 'Intermediate', 'Advanced'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStageFilter(st)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors border ${
                      stageFilter === st
                        ? 'bg-sky-600 text-white border-sky-600 font-medium'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-600 mr-1">Priority:</span>
                {['ALL', 'High', 'Medium', 'Low'].map((pr) => (
                  <button
                    key={pr}
                    onClick={() => setPriorityFilter(pr)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors border ${
                      priorityFilter === pr
                        ? 'bg-slate-800 text-white border-slate-800 font-medium'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pr}
                  </button>
                ))}
              </div>
            </div>

            {/* Stages & Skills List */}
            <div className="space-y-8">
              {filteredStages.map((stage) => (
                <div key={stage.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {/* Stage Header */}
                  <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getStageBadgeClass(stage.stageName)}`}>
                          {stage.stageName}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{stage.title}</h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{stage.description}</p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {stage.estimatedWeeks}
                    </span>
                  </div>

                  {/* Skills within this stage */}
                  <div className="divide-y divide-slate-100">
                    {stage.skills.map((skill) => {
                      const isExpanded = !!expandedSkills[skill.id];
                      const isUpdating = updatingTaskId === skill.id;

                      return (
                        <div key={skill.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                          {/* Skill Card Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h4 className="text-base font-bold text-slate-900">{skill.skillName}</h4>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${getPriorityBadgeClass(skill.priority)}`}>
                                {skill.priority} Priority
                              </span>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {skill.estimatedTime}
                              </span>
                            </div>

                            {/* Task Status Selector */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">Status:</span>
                              <select
                                value={skill.status}
                                onChange={(e) => handleStatusChange(skill.id, e.target.value)}
                                disabled={isUpdating}
                                className={`text-xs font-medium rounded-lg px-2.5 py-1.5 border transition-all focus:outline-none ${
                                  skill.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : skill.status === 'In Progress'
                                    ? 'bg-sky-50 text-sky-800 border-sky-300'
                                    : 'bg-white text-slate-700 border-slate-300'
                                }`}
                              >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>

                              <button
                                onClick={() => toggleSkillExpand(skill.id)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors"
                                title={isExpanded ? 'Collapse' : 'Expand'}
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Collapsible Details */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                              {/* Learning Objectives */}
                              {skill.learningObjectives?.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Learning Objectives
                                  </h5>
                                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                                    {skill.learningObjectives.map((obj, i) => (
                                      <li key={i}>{obj}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Prerequisites */}
                              {skill.prerequisites?.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Prerequisites
                                  </h5>
                                  <div className="flex flex-wrap gap-1.5">
                                    {skill.prerequisites.map((req, i) => (
                                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                        {req}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Practical Exercises */}
                              {skill.practicalExercises?.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Practical Exercises
                                  </h5>
                                  <div className="space-y-1.5">
                                    {skill.practicalExercises.map((ex, i) => (
                                      <div key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                        <span className="font-semibold text-sky-600">{i + 1}.</span>
                                        <span>{ex}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Practice Project Task */}
                              {skill.projectTask && (
                                <div className="p-3.5 rounded-lg bg-sky-50/50 border border-sky-100">
                                  <h5 className="text-xs font-bold text-sky-900 mb-1 flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-sky-600" />
                                    Project Task: {skill.projectTask.title}
                                  </h5>
                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    {skill.projectTask.description}
                                  </p>
                                </div>
                              )}

                              {/* Verified Reliable Resources */}
                              {skill.resources?.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                                    Recommended Learning Resources
                                  </h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {skill.resources.map((res, i) => (
                                      <a
                                        key={i}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/30 transition-all flex items-center justify-between text-xs group"
                                      >
                                        <div className="truncate pr-2">
                                          <p className="font-medium text-slate-800 truncate group-hover:text-sky-700">
                                            {res.title}
                                          </p>
                                          <p className="text-[11px] text-slate-500 mt-0.5">
                                            {res.platform} • <span className="text-emerald-600 font-medium">Verified Link</span>
                                          </p>
                                        </div>
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredStages.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm font-medium text-slate-700">No tasks match your selected filter criteria.</p>
                  <p className="text-xs text-slate-500 mt-1">Try resetting the Stage or Priority filter.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapPage;
