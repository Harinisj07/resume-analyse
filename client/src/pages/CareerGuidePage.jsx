import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Milestone,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Code,
  Award,
  Layers,
  Clock,
  Target,
  RefreshCw,
  Plus,
  X,
  Zap,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { api } from '../api/client';

export const CareerGuidePage = () => {
  const location = useLocation();

  const [targetRole, setTargetRole] = useState('Full Stack AI Engineer');
  const [currentSkills, setCurrentSkills] = useState([
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'SQL',
    'Docker',
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');

  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);
  const [completedStages, setCompletedStages] = useState(new Set());
  const [copied, setCopied] = useState(false);

  // If redirected from AnalyzerPage with scanned skills
  useEffect(() => {
    if (location.state?.currentSkills && location.state.currentSkills.length > 0) {
      setCurrentSkills(location.state.currentSkills);
    }
    if (location.state?.targetRole) {
      setTargetRole(location.state.targetRole);
    }
    // Auto-trigger generation if coming from an analysis
    if (location.state?.fromAnalysis) {
      fetchRoadmap(
        location.state.targetRole || targetRole,
        location.state.currentSkills || currentSkills
      );
    }
  }, [location.state]);

  const popularRoles = [
    'Full Stack AI Engineer',
    'Cloud Solutions Architect',
    'DevOps & Platform Engineer',
    'Data Scientist & ML Engineer',
    'Frontend & Mobile Architect',
    'Cybersecurity Analyst',
  ];

  const fetchRoadmap = async (roleToFetch, skillsToFetch) => {
    setLoading(true);
    setError(null);
    setCompletedStages(new Set()); // Reset progress for new roadmap
    try {
      const response = await api.generateCareerRoadmap(
        roleToFetch || targetRole,
        skillsToFetch || currentSkills,
        experienceLevel
      );
      setRoadmap(response.data);
    } catch (err) {
      setError(err.message || 'Failed to generate career roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStage = (stageNum) => {
    setCompletedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stageNum)) {
        next.delete(stageNum);
      } else {
        next.add(stageNum);
      }
      return next;
    });
  };

  const handleDownloadRoadmap = () => {
    if (!roadmap) return;
    const blob = new Blob([JSON.stringify(roadmap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career_roadmap_${roadmap.target_role.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyRoadmap = () => {
    if (!roadmap) return;
    const stagesText = (roadmap.stages || [])
      .map(
        (s) =>
          `### Stage ${s.stage_number}: ${s.title} (${s.duration})\n` +
          `Objective: ${s.objective}\n` +
          `Skills to Acquire: ${s.skills_to_acquire?.join(', ')}\n` +
          `Portfolio Project: ${s.hands_on_project} - ${s.project_description}\n`
      )
      .join('\n');

    const certsText = (roadmap.certifications || [])
      .map((c) => `- ${c.name} (${c.issuer}) - ${c.relevance}`)
      .join('\n');

    const text = `# Tailored Career Guidance Roadmap: ${roadmap.target_role}
Readiness Score: ${roadmap.readiness_score}%
Estimated Completion: ${roadmap.estimated_timeline}

## Learning Milestones
${stagesText}

## Recommended Certifications
${certsText}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    fetchRoadmap(targetRole, currentSkills);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkillInput.trim() && !currentSkills.includes(newSkillInput.trim())) {
      setCurrentSkills([...currentSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setCurrentSkills(currentSkills.filter((s) => s !== skillToRemove));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Personalized Career Guidance
            </h1>
            <Badge variant="cyan" dot={true}>Dynamic Engine</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Tailored learning milestone roadmaps, hands-on portfolio projects, and certification tracks matching your skill profile.
          </p>
        </div>
      </div>

      {/* Query Customizer Card */}
      <Card>
        <CardHeader
          title="Roadmap Parameters"
          subtitle="Configure target destination and candidate verified skills"
          icon={Target}
        />

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Target Role Input */}
            <div className="md:col-span-8">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack AI Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />

              {/* Quick Select Role Pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {popularRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      targetRole === role
                        ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level Selector */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                <option value="entry">Entry / Junior (0-2 Yrs)</option>
                <option value="intermediate">Mid-Level (2-5 Yrs)</option>
                <option value="senior">Senior / Lead (5+ Yrs)</option>
              </select>
            </div>
          </div>

          {/* Current Verified Skills Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Candidate Current Skills ({currentSkills.length})
            </label>
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center gap-1.5 min-h-[48px]">
              {currentSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Add Skill mini-input */}
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                  placeholder="+ Add skill"
                  className="bg-transparent text-xs text-slate-200 placeholder-slate-500 px-2 py-1 outline-none w-24 focus:w-32 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={Sparkles}
            >
              Generate Tailored Roadmap
            </Button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}
        </form>
      </Card>

      {/* Initial Empty State before generation */}
      {!roadmap && !loading && (
        <Card>
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">
              Ready to Chart Your Career Trajectory
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click "Generate Tailored Roadmap" to run gap analysis against industry benchmarks and formulate step-by-step milestones.
            </p>
            <Button variant="secondary" size="sm" onClick={handleGenerate} icon={Sparkles}>
              Generate with Default Profile
            </Button>
          </div>
        </Card>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <Card>
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-300 font-medium">
              Generating dynamic career milestones, gap remediation, and project briefs...
            </p>
          </div>
        </Card>
      )}

      {/* Generated Roadmap Display */}
      {roadmap && (
        <div className="space-y-6">
          {/* Summary Readiness & Timeline Card */}
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                  Target Destination
                </span>
                <h2 className="text-2xl font-bold text-white">{roadmap.target_role}</h2>
                <p className="text-xs text-slate-400">
                  Estimated Timeline: <strong className="text-slate-200">{roadmap.estimated_timeline}</strong>
                </p>
              </div>

              {/* Readiness Meter */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">
                  Role Readiness Benchmark
                </p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-3xl font-black text-cyan-400">
                    {roadmap.readiness_score}%
                  </span>
                  <Badge variant={roadmap.readiness_score >= 70 ? 'success' : 'cyan'}>
                    {roadmap.readiness_score >= 70 ? 'High Competency' : 'Moderate Overlap'}
                  </Badge>
                </div>
              </div>

              {/* Overlap vs Gaps */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Verified Skills Overlap: </span>
                  <span className="text-emerald-400 font-semibold">{roadmap.skills_overlap?.length || 0} skills</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Priority Gap Competencies: </span>
                  <span className="text-amber-400 font-semibold">{roadmap.critical_gap_skills?.length || 0} skills</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {roadmap.critical_gap_skills?.map((gap, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300">
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Phased Roadmap Stages */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Milestone className="w-5 h-5 text-brand-400" />
                <h3 className="text-lg font-bold text-white">Sequential Learning Milestones</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {completedStages.size} / {roadmap.stages?.length || 0} Done
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={copied ? Check : Copy}
                  onClick={handleCopyRoadmap}
                  className={copied ? 'text-emerald-400' : ''}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Download}
                  onClick={handleDownloadRoadmap}
                >
                  Export Roadmap
                </Button>
              </div>
            </div>

            {/* Visual Progress Bar */}
            {roadmap.stages?.length > 0 && (
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-brand-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.round((completedStages.size / roadmap.stages.length) * 100)}%`,
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {roadmap.stages?.map((stage) => {
                const isDone = completedStages.has(stage.stage_number);
                return (
                  <Card
                    key={stage.stage_number}
                    className={`relative overflow-hidden transition-all ${
                      isDone ? 'border-emerald-500/30 bg-emerald-950/10' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-sm shadow-md transition-colors ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : 'bg-brand-500/20 border border-brand-500/30 text-brand-400'
                          }`}
                        >
                          {isDone ? <Check className="w-4 h-4" /> : stage.stage_number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-slate-100">{stage.title}</h4>
                            {isDone && (
                              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{stage.objective}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="cyan" size="sm">
                          <Clock className="w-3 h-3" />
                          {stage.duration}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => handleToggleStage(stage.stage_number)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                            isDone
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
                          }`}
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-400' : 'text-slate-500'}`}
                          />
                          <span>{isDone ? 'Finished' : 'Mark Done'}</span>
                        </button>
                      </div>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                    {/* Skills & Topics */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Target Competencies to Acquire
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {stage.skills_to_acquire?.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20 text-brand-300 text-[11px]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Key Curriculum Topics
                        </p>
                        <ul className="space-y-1 text-slate-300 text-[11px]">
                          {stage.recommended_topics?.map((topic, tIdx) => (
                            <li key={tIdx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Hands-on Project */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                          <Code className="w-3.5 h-3.5" />
                          <span>Portfolio Project: {stage.hands_on_project}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed mt-1">
                          {stage.project_description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Milestone Deliverable</span>
                        <span className="text-emerald-400 font-medium">Ready for GitHub / Portfolio</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
            </div>
          </div>

          {/* Certifications & Interview Focus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Industry Certifications */}
            <Card>
              <CardHeader
                title="Recommended Certifications"
                subtitle="Industry credentials to validate expertise"
                icon={Award}
              />
              <div className="space-y-3">
                {roadmap.certifications?.map((cert, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h5 className="font-semibold text-slate-200">{cert.name}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cert.issuer} • {cert.relevance}</p>
                    </div>
                    <Badge variant="cyan" size="sm">
                      {cert.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Technical Interview Focus */}
            <Card>
              <CardHeader
                title="Interview Focus Areas"
                subtitle="Core technical & system design themes"
                icon={Target}
              />
              <div className="space-y-2.5 text-xs">
                {roadmap.interview_focus_areas?.map((focus, fIdx) => (
                  <div
                    key={fIdx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {fIdx + 1}
                    </span>
                    <span className="leading-relaxed">{focus}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerGuidePage;
