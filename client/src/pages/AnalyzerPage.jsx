import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Database,
  Target,
  Compass,
  File,
  X,
  Check,
  Briefcase,
  Award,
  Zap,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  Download,
  Copy,
} from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ResumeUploader from '../components/resume/ResumeUploader';
import { api } from '../api/client';

export const AnalyzerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Input states
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'text'
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [targetJobDescription, setTargetJobDescription] = useState('');
  const [showJdInput, setShowJdInput] = useState(false);
  const [saveToDb, setSaveToDb] = useState(true);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  // Execution states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Reload past resume if navigated with resumeId in location state
  useEffect(() => {
    if (location.state?.resumeId) {
      const loadPastResume = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await api.getResumeById(location.state.resumeId);
          if (res.data) {
            setResult(res);
            if (res.data.targetRole) setTargetRole(res.data.targetRole);
            if (res.data.targetJobDescription) {
              setTargetJobDescription(res.data.targetJobDescription);
              setShowJdInput(true);
            }
          }
        } catch (err) {
          setError('Failed to reload past resume analysis: ' + err.message);
        } finally {
          setLoading(false);
        }
      };
      loadPastResume();
    }
  }, [location.state?.resumeId]);

  const sampleResume = `Alex Morgan
alex.morgan@example.com | (555) 349-8201 | San Francisco, CA
linkedin.com/in/alexmorgan-dev | github.com/alexmorgan-code

PROFESSIONAL SUMMARY
Results-driven Lead Full Stack Engineer with 6+ years of experience designing high-throughput web architectures, microservices, and AI-assisted workflows using React, TypeScript, Node.js, Python, and AWS.

TECHNICAL SKILLS
- Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3, Bash
- Frameworks: React, Vite, Next.js, Node.js, Express, FastAPI, Tailwind CSS
- Cloud & DevOps: Docker, Kubernetes, AWS (ECS, S3, RDS), GitHub Actions, CI/CD, Nginx
- Databases: PostgreSQL, MongoDB, Redis, Mongoose
- Methodologies: System Design, Microservices, REST APIs, GraphQL, Agile, Scrum

WORK EXPERIENCE
Lead Full Stack Developer | Apex Cloud Systems | 2022 - Present
- Architected and scaled distributed backend microservices processing 2.5M+ daily requests, improving 99th percentile response time by 42%.
- Integrated automated NLP evaluation pipelines using FastAPI and Docker, reducing manual screening time by 45%.
- Led frontend redesign migration to React 18, Vite, and TypeScript, cutting client bundle size by 35% and boosting Lighthouse performance score from 68 to 96.
- Mentored a team of 7 software engineers and established standardized TDD & CI/CD workflows across 4 sprint squads.

Senior Software Engineer | Vanguard Digital | 2019 - 2022
- Spearheaded development of real-time collaboration canvas supporting 10,000+ concurrent active users with WebSockets and Redis.
- Orchestrated database migration from legacy MySQL to PostgreSQL and MongoDB, slashing query latency by 50% and saving $85k annually in server costs.
- Built reusable component library in Tailwind CSS and React, accelerating feature rollout cycles by 25%.

EDUCATION & CERTIFICATIONS
- B.S. in Computer Science | University of California, Berkeley | 2019
- AWS Certified Solutions Architect - Associate | 2023`;

  const handleLoadSample = () => {
    setInputMode('text');
    setRawText(sampleResume);
    setError(null);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(ext)) {
      setError(`Unsupported file format (${ext}). Please select a .pdf, .docx, or .txt resume.`);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleClearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError(null);

    if (inputMode === 'upload' && !file) {
      setError('Please choose or drag a PDF, DOCX, or TXT resume file.');
      return;
    }

    if (inputMode === 'text' && (!rawText.trim() || rawText.trim().length < 20)) {
      setError('Please provide at least 20 characters of resume text to analyze.');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (inputMode === 'upload') {
        response = await api.uploadResumeFile(file, targetRole, targetJobDescription);
      } else {
        response = await api.analyzeResume({
          rawText,
          targetRole,
          targetJobDescription,
          saveToDb,
        });
      }
      setResult(response);
    } catch (err) {
      setError(err.message || 'Analysis failed. Ensure all services are online.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToCareerGuide = () => {
    if (!result?.data) return;
    const skillsList = (result.data.extractedSkills || result.data.skills || []).map((s) => s.name);
    navigate('/career-guide', {
      state: {
        targetRole: result.data.targetRole || targetRole,
        currentSkills: skillsList,
        fromAnalysis: true,
      },
    });
  };

  const handleDownloadJSON = () => {
    if (!result?.data) return;
    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_ats_report_${(result.data.title || 'analysis').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    if (!result?.data) return;
    const skillsList = (result.data.extractedSkills || result.data.skills || []).map((s) => s.name);
    const textStrengths = (result.data.strengths || []).map((s) => `- ${s}`).join('\n');
    const textImprovements = (result.data.improvements || []).map((i) => `- ${i}`).join('\n');
    const summary = `# Resume ATS Analysis Report
Candidate Role: ${result.data.targetRole || targetRole}
Composite ATS Score: ${atsScore}/100

## Identified Technical Skills (${skillsList.length})
${skillsList.join(', ')}

## Strengths
${textStrengths}

## Strategic Recommendations
${textImprovements}
`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper for ATS score color scheme
  const getScoreColor = (score) => {
    if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', stroke: '#10b981' };
    if (score >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', stroke: '#f59e0b' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', stroke: '#f43f5e' };
  };

  const atsScore = result?.data?.atsScore ?? result?.data?.ats_score ?? 0;
  const scoreColors = getScoreColor(atsScore);
  const breakdown = result?.data?.scoreBreakdown || result?.data?.score_breakdown || {};
  const contact = result?.data?.contactInfo || result?.data?.contact_info || {};
  const sections = result?.data?.detectedSections || result?.data?.detected_sections || {};
  const extractedSkills = result?.data?.extractedSkills || result?.data?.skills || [];
  const skillsByCategory = result?.data?.skillsByCategory || result?.data?.skills_by_category || {};
  const jobMatch = result?.data?.jobMatch || result?.data?.job_match || {};
  const matchPercentage = jobMatch.match_percentage ?? jobMatch.matchPercentage ?? 0;
  const missingCriticalSkills = jobMatch.missing_critical_skills || jobMatch.missingCriticalSkills || [];
  const strengths = result?.data?.strengths || [];
  const improvements = result?.data?.improvements || [];
  const metricsCount = result?.data?.metricsCount ?? result?.data?.metrics_count ?? 0;
  const verbsCount = result?.data?.actionVerbsCount ?? result?.data?.action_verbs_count ?? 0;
  const wordCount = result?.data?.wordCount ?? result?.data?.word_count ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Resume Intelligence Workspace
            </h1>
            <Badge variant="primary" dot={true}>Phase 2 Engine</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Production NLP extraction, multi-dimensional ATS scoring, and JD semantic keyword matching.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleLoadSample} icon={FileText}>
            Load Sample Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form & Upload */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader
              title="Candidate Resume Input"
              subtitle="Upload document or paste plain text"
              icon={FileText}
            />

            {/* Input Mode Toggle */}
            <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  inputMode === 'upload'
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Document Upload (PDF/DOCX)</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  inputMode === 'text'
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Plain Text</span>
              </button>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4">
              {/* Target Job Role */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-brand-400" />
                  Target Career Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer, Cloud Architect, AI Specialist"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>

              {/* Upload Zone or Textarea */}
              {inputMode === 'upload' ? (
                <div>
                  <ResumeUploader
                    onFileSelect={(selectedFile) => {
                      setFile(selectedFile);
                      setError(null);
                    }}
                    onUploadSuccess={(uploadedData) => {
                      setFile(null);
                      if (uploadedData?.atsScore !== undefined || uploadedData?.ats_score !== undefined) {
                        setResult({ data: uploadedData });
                      }
                    }}
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Resume Plain Text Content
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {rawText.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={11}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste resume text directly here..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono leading-relaxed"
                  />
                </div>
              )}

              {/* Optional Target Job Description Accordion */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <button
                  type="button"
                  onClick={() => setShowJdInput(!showJdInput)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    Target Job Description Matching (Optional)
                  </span>
                  {showJdInput ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {showJdInput && (
                  <div className="p-3.5 pt-0 border-t border-slate-800/60 mt-1">
                    <p className="text-[11px] text-slate-400 mb-2">
                      Paste a specific job posting to evaluate exact keyword match density and missing critical skills.
                    </p>
                    <textarea
                      rows={4}
                      value={targetJobDescription}
                      onChange={(e) => setTargetJobDescription(e.target.value)}
                      placeholder="Paste target job requirements, responsibilities, or keywords..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={saveToDb}
                    onChange={(e) => setSaveToDb(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-brand-500 focus:ring-brand-500"
                  />
                  <span>Persist scan to MongoDB</span>
                </label>

                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  icon={Sparkles}
                >
                  Analyze Resume
                </Button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </Card>
        </div>

        {/* Right Column: Results & Telemetry */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="min-h-[580px] flex flex-col justify-between">
            <div>
              <CardHeader
                title="ATS Telemetry & Evaluation"
                subtitle="Deep NLP extraction and ATS compatibility metrics"
                icon={Sparkles}
                action={
                  result && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={copied ? Check : Copy}
                        onClick={handleCopySummary}
                        className={copied ? 'text-emerald-400' : ''}
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Download}
                        onClick={handleDownloadJSON}
                      >
                        Export JSON
                      </Button>
                      <Badge variant="success" dot={true}>
                        Scan Completed
                      </Badge>
                    </div>
                  )
                }
              />

              {!result && !loading && (
                <div className="py-24 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400 shadow-inner">
                    <Send className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="text-base font-semibold text-slate-200">Awaiting Resume Dispatch</h4>
                    <p className="text-xs text-slate-400">
                      Upload a PDF/Word resume or paste sample content to inspect ATS composite scoring, contact entity parsing, and career roadmap generation.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleLoadSample} icon={FileText}>
                    Try with Alex Morgan Sample Profile
                  </Button>
                </div>
              )}

              {loading && (
                <div className="py-24 text-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-brand-400 animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-200">Executing Deep NLP Pipeline</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Parsing document streams, extracting contact entities, analyzing impact metrics, and calculating ATS scores...
                    </p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-5">
                  {/* Master Score Banner */}
                  <div className={`p-5 rounded-2xl ${scoreColors.bg} border ${scoreColors.border} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                    <div className="flex items-center gap-4">
                      {/* Radial-like visual score */}
                      <div className="relative w-20 h-20 flex items-center justify-center rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl">
                        <div className="text-center">
                          <span className={`text-2xl font-black ${scoreColors.text}`}>
                            {atsScore}
                          </span>
                          <span className="block text-[9px] text-slate-500 uppercase font-semibold">/ 100</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-white">ATS Compatibility Score</h2>
                          <Badge variant={atsScore >= 80 ? 'success' : atsScore >= 60 ? 'warning' : 'danger'}>
                            {atsScore >= 80 ? 'ATS Optimized' : atsScore >= 60 ? 'Needs Polish' : 'Critical Gaps'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Role: <span className="font-semibold text-white">{result.data.targetRole || targetRole}</span>
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleProceedToCareerGuide}
                      icon={Compass}
                    >
                      Generate Career Roadmap
                    </Button>
                  </div>

                  {/* Multi-Dimensional Sub-Score Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Contact Info</p>
                      <p className="text-base font-bold text-slate-100 mt-0.5">{breakdown.contactScore ?? breakdown.contact_score ?? 0}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Structure</p>
                      <p className="text-base font-bold text-slate-100 mt-0.5">{breakdown.structureScore ?? breakdown.structure_score ?? 0}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Metrics & Impact</p>
                      <p className="text-base font-bold text-brand-400 mt-0.5">{breakdown.impactScore ?? breakdown.impact_score ?? 0}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Relevance</p>
                      <p className="text-base font-bold text-cyan-400 mt-0.5">{breakdown.relevanceScore ?? breakdown.relevance_score ?? 0}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center col-span-2 sm:col-span-1">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Formatting</p>
                      <p className="text-base font-bold text-slate-100 mt-0.5">{breakdown.formatScore ?? breakdown.format_score ?? 0}%</p>
                    </div>
                  </div>

                  {/* Metrics Telemetry Strip */}
                  <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <strong className="text-slate-200">{verbsCount}</strong> Action Verbs
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <strong className="text-slate-200">{metricsCount}</strong> Measurable Outcomes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <strong className="text-slate-200">{wordCount}</strong> Words
                    </span>
                    {result.data._id && (
                      <span className="ml-auto font-mono text-[10px] text-slate-500">
                        Record: {result.data._id}
                      </span>
                    )}
                  </div>

                  {/* Contact Info Entities */}
                  {(contact.email || contact.phone || contact.linkedin || contact.github) && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Parsed Contact Entities
                      </h4>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {contact.name && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {contact.name}
                          </span>
                        )}
                        {contact.email && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {contact.email}
                          </span>
                        )}
                        {contact.phone && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {contact.phone}
                          </span>
                        )}
                        {contact.linkedin && (
                          <a
                            href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 hover:border-cyan-500/40"
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                            LinkedIn Profile
                          </a>
                        )}
                        {contact.github && (
                          <a
                            href={contact.github.startsWith('http') ? contact.github : `https://${contact.github}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-purple-400 hover:border-purple-500/40"
                          >
                            <Github className="w-3.5 h-3.5" />
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section Detection Checklist */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      ATS Section Structure
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                      {[
                        { label: 'Summary', active: sections.summary },
                        { label: 'Experience', active: sections.experience },
                        { label: 'Education', active: sections.education },
                        { label: 'Skills', active: sections.skills },
                        { label: 'Projects', active: sections.projects },
                        { label: 'Certifications', active: sections.certifications },
                      ].map((sec) => (
                        <div
                          key={sec.label}
                          className={`p-2 rounded-lg border text-center flex items-center justify-center gap-1.5 ${
                            sec.active
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-slate-900/60 border-slate-800 text-slate-500'
                          }`}
                        >
                          {sec.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span className="font-medium text-[11px]">{sec.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extracted Skills Categorized Cloud */}
                  {extractedSkills.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Extracted Skill Entities ({extractedSkills.length})
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {extractedSkills.map((skill) => (
                          <span
                            key={skill.name}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs flex items-center gap-1.5"
                          >
                            <span>{skill.name}</span>
                            <span className="text-[10px] text-slate-400">
                              {Math.round((skill.confidence || 0.85) * 100)}%
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Match & Skill Gaps */}
                  {missingCriticalSkills && missingCriticalSkills.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Target className="w-4 h-4" />
                          Identified Skill Gaps for {targetRole}
                        </h4>
                        {matchPercentage > 0 && (
                          <Badge variant="warning">
                            {matchPercentage}% Role Match
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Incorporate these high-frequency competencies into your experience bullet points to maximize ATS filtering rank:
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {missingCriticalSkills.map((gap, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs"
                          >
                            + {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths & Actionable Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Strengths */}
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                      <h4 className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Identified Strengths
                      </h4>
                      <ul className="space-y-1.5 text-slate-300">
                        {strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actionable Improvements */}
                    <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 space-y-2">
                      <h4 className="font-semibold text-brand-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        Actionable Recommendations
                      </h4>
                      <ul className="space-y-1.5 text-slate-300">
                        {improvements.map((imp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-brand-400 shrink-0 mt-0.5">→</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Engine: NLP-Engine-v2 Multi-Dimensional</span>
              <span>FastAPI Port: 8000 | Gateway: 5000</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyzerPage;
