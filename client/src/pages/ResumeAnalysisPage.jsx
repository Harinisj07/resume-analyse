import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Download,
  Search,
  RefreshCw,
  Eye,
  FileCode,
  FileSpreadsheet,
  FileCheck2,
  Database,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Hash,
  WrapText,
  Sparkles,
  Code2,
  Terminal,
  Cloud,
  Cpu,
  GraduationCap,
  Award,
  Briefcase,
  FolderGit2,
  Zap,
} from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  uploadResume,
  extractResumeText,
  getResumeText,
  getAllResumes,
  executeExtractionPipeline,
  analyzeResumeNLP,
} from '../services/resumeService';

export const ResumeAnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const textContainerRef = useRef(null);

  // File & Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Workflow Pipeline State: 'idle' | 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed'
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [activeResume, setActiveResume] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  // NLP Structured Analysis States
  const [nlpAnalysis, setNlpAnalysis] = useState(null);
  const [nlpLoading, setNlpLoading] = useState(false);
  const [nlpError, setNlpError] = useState(null);

  // Tab View: 'nlp' | 'preview'
  const [activeTab, setActiveTab] = useState('nlp');

  // UI & Preview Configuration States
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapText, setWrapText] = useState(true);
  const [isMonospace, setIsMonospace] = useState(false);
  const [recentResumes, setRecentResumes] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  // Load past resume if passed via location state or fetch latest
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setLoadingRecent(true);
        const listRes = await getAllResumes();
        if (isMounted && listRes?.data) {
          setRecentResumes(listRes.data);
        }
      } catch (e) {
        // Soft fail for recent list
      } finally {
        if (isMounted) setLoadingRecent(false);
      }

      // If navigated with a resumeId
      const targetId = location.state?.resumeId;
      if (targetId) {
        loadResumeData(targetId);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [location.state?.resumeId]);

  // Load a resume by ID from backend
  const loadResumeData = async (resumeId) => {
    setErrorDetails(null);
    setNlpError(null);
    setProcessingStatus('processing');
    try {
      const res = await getResumeText(resumeId);
      if (res?.data) {
        setActiveResume(res.data);
        if (res.data.structuredAnalysis) {
          setNlpAnalysis(res.data.structuredAnalysis);
          setActiveTab('nlp');
        }
        setProcessingStatus(res.data.analysisStatus || 'completed');
      }
    } catch (err) {
      setErrorDetails({
        code: 'FETCH_ERROR',
        message: err.message || 'Failed to retrieve resume details from server.',
      });
      setProcessingStatus('failed');
    }
  };

  // Client-side file validation before uploading
  const validateFile = (file) => {
    if (!file) return 'Please select a document to upload.';

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const validExtensions = ['.pdf', '.docx'];

    if (!validExtensions.includes(ext)) {
      return {
        code: 'UNSUPPORTED_FORMAT',
        message: `Unsupported file type "${ext}". Only PDF (.pdf) and Word documents (.docx) are supported.`,
      };
    }

    if (file.size === 0) {
      return {
        code: 'EMPTY_DOCUMENT',
        message: 'The selected file is empty (0 bytes). Please select a valid document with content.',
      };
    }

    if (file.size > 10 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        code: 'FILE_TOO_LARGE',
        message: `File size (${sizeMB} MB) exceeds maximum allowed limit of 10 MB.`,
      };
    }

    return null;
  };

  // Handle file drop / selection
  const handleSelectFile = (file) => {
    setErrorDetails(null);
    setNlpError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setErrorDetails(validationError);
      setSelectedFile(null);
      setProcessingStatus('failed');
      return;
    }
    setSelectedFile(file);
    setProcessingStatus('idle');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!['uploading', 'processing'].includes(processingStatus)) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (['uploading', 'processing'].includes(processingStatus)) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  // Step 1: Upload and Store File
  const handleUploadOnly = async () => {
    if (!selectedFile) return;

    setErrorDetails(null);
    setNlpError(null);
    setProcessingStatus('uploading');
    setUploadProgress(0);

    try {
      const uploadRes = await uploadResume(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      if (uploadRes?.data) {
        setActiveResume({
          id: uploadRes.data.id || uploadRes.data.resumeId,
          resumeId: uploadRes.data.id || uploadRes.data.resumeId,
          fileName: uploadRes.data.fileName,
          fileType: uploadRes.data.fileType,
          fileSize: uploadRes.data.fileSize,
          analysisStatus: uploadRes.data.analysisStatus || 'uploaded',
          extractedText: '',
          uploadDate: uploadRes.data.uploadDate,
        });
        setProcessingStatus('uploaded');
        getAllResumes().then((r) => r?.data && setRecentResumes(r.data));
      }
    } catch (err) {
      setErrorDetails({
        code: err.code || 'UPLOAD_ERROR',
        message: err.message || 'File upload failed.',
      });
      setProcessingStatus('failed');
    }
  };

  // Step 2: Trigger Text Extraction via POST /api/resume/extract/:resumeId
  const handleExtractText = async () => {
    const resumeId = activeResume?.id || activeResume?.resumeId;
    if (!resumeId) {
      setErrorDetails({
        code: 'MISSING_RESUME_ID',
        message: 'No uploaded resume found to extract text from. Please upload a document first.',
      });
      return;
    }

    setErrorDetails(null);
    setNlpError(null);
    setProcessingStatus('processing');

    try {
      const extractRes = await extractResumeText(resumeId);
      if (extractRes?.data) {
        setActiveResume((prev) => ({
          ...prev,
          ...extractRes.data,
          extractedText: extractRes.data.extractedText,
          analysisStatus: extractRes.data.analysisStatus || 'completed',
          processingStatus: extractRes.data.processingStatus || 'completed',
        }));
        setProcessingStatus('completed');
        getAllResumes().then((r) => r?.data && setRecentResumes(r.data));
      }
    } catch (err) {
      setErrorDetails({
        code: err.code || 'EXTRACTION_ERROR',
        message: err.message || 'Text extraction failed.',
      });
      setProcessingStatus('failed');
      if (activeResume) {
        setActiveResume((prev) => ({ ...prev, analysisStatus: 'failed' }));
      }
    }
  };

  // Step 3: Trigger Python FastAPI NLP Resume Analysis
  const handleRunNlpAnalysis = async () => {
    const resumeId = activeResume?.id || activeResume?.resumeId;
    const text = activeResume?.extractedText;

    if (!resumeId && !text) {
      setNlpError({
        code: 'MISSING_TEXT',
        message: 'No resume text available for NLP parsing. Please upload a PDF or DOCX file and extract text first.',
      });
      return;
    }

    setNlpLoading(true);
    setNlpError(null);

    try {
      const res = await analyzeResumeNLP(resumeId, text);
      if (res?.data) {
        setNlpAnalysis(res.data);
        setActiveTab('nlp');
        setActiveResume((prev) => ({
          ...prev,
          structuredAnalysis: res.data,
          extractedSkills: res.data.skills || [],
        }));
        getAllResumes().then((r) => r?.data && setRecentResumes(r.data));
      }
    } catch (err) {
      setNlpError({
        code: err.code || 'NLP_ANALYSIS_FAILED',
        message: err.message || 'Failed to analyze resume with Python FastAPI AI service.',
      });
    } finally {
      setNlpLoading(false);
    }
  };

  // Full Pipeline: Upload -> Store -> Extract -> Run NLP Analysis
  const handleFullExtractionPipeline = async () => {
    if (!selectedFile) return;

    setErrorDetails(null);
    setNlpError(null);
    setUploadProgress(0);

    try {
      const result = await executeExtractionPipeline(
        selectedFile,
        (progress) => setUploadProgress(progress),
        (status) => setProcessingStatus(status)
      );

      if (result?.data) {
        const resumeData = result.data;
        setActiveResume(resumeData);
        setProcessingStatus('completed');
        setSelectedFile(null);
        getAllResumes().then((r) => r?.data && setRecentResumes(r.data));

        // Automatically trigger NLP analysis on newly extracted text
        const targetResumeId = resumeData.id || resumeData.resumeId;
        if (targetResumeId && resumeData.extractedText) {
          setNlpLoading(true);
          try {
            const nlpRes = await analyzeResumeNLP(targetResumeId, resumeData.extractedText);
            if (nlpRes?.data) {
              setNlpAnalysis(nlpRes.data);
              setActiveTab('nlp');
              setActiveResume((prev) => ({
                ...prev,
                structuredAnalysis: nlpRes.data,
              }));
            }
          } catch (nlpErr) {
            setNlpError({
              code: nlpErr.code || 'NLP_ANALYSIS_FAILED',
              message: nlpErr.message || 'Extracted text saved, but NLP entity structuring failed.',
            });
          } finally {
            setNlpLoading(false);
          }
        }
      }
    } catch (err) {
      setErrorDetails({
        code: err.code || 'PIPELINE_ERROR',
        message: err.message || 'Resume extraction pipeline failed.',
      });
      setProcessingStatus('failed');
    }
  };

  // Copy extracted text to clipboard
  const handleCopyText = () => {
    if (!activeResume?.extractedText) return;
    navigator.clipboard.writeText(activeResume.extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download extracted text as .txt file
  const handleDownloadTxt = () => {
    if (!activeResume?.extractedText) return;
    const blob = new Blob([activeResume.extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const baseName = (activeResume.fileName || 'extracted_resume').replace(/\.[^/.]+$/, '');
    a.href = url;
    a.download = `${baseName}_extracted_text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Highlight search terms in extracted text preview
  const filteredLines = useMemo(() => {
    const raw = activeResume?.extractedText || '';
    if (!raw) return [];
    return raw.split('\n');
  }, [activeResume?.extractedText]);

  const searchMatchesCount = useMemo(() => {
    if (!searchQuery.trim() || !activeResume?.extractedText) return 0;
    try {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = activeResume.extractedText.match(regex);
      return matches ? matches.length : 0;
    } catch (e) {
      return 0;
    }
  }, [searchQuery, activeResume?.extractedText]);

  // Format timestamps
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateStr));
    } catch {
      return String(dateStr);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Status Badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" size="md" dot>
            Completed & Saved
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="primary" size="md" dot>
            Processing...
          </Badge>
        );
      case 'uploaded':
        return (
          <Badge variant="cyan" size="md" dot>
            Stored on Server
          </Badge>
        );
      case 'uploading':
        return (
          <Badge variant="warning" size="md" dot>
            Uploading File...
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="danger" size="md" dot>
            Processing Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="md">
            Ready
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(e) => e.target.files?.[0] && handleSelectFile(e.target.files[0])}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-brand-500/15 text-brand-300 border border-brand-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Python FastAPI AI Service
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                POST /analyze-resume
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              NLP Resume Analysis
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Extract raw document text and run advanced NLP entity parsing using our FastAPI microservice.
              Detects normalized skills (e.g. JS → JavaScript), programming languages, frameworks,
              databases, cloud, DevOps, certifications, projects, and education.
            </p>
          </div>

          {/* Quick Stats or Status summary */}
          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
            <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Pipeline State</p>
              <div className="mt-0.5">{getStatusBadge(processingStatus)}</div>
            </div>
          </div>
        </div>

        {/* WORKFLOW PIPELINE STEPPER */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            {
              step: '1',
              title: 'Resume Upload',
              desc: 'PDF / DOCX selection',
              active: ['uploading', 'uploaded', 'processing', 'completed'].includes(processingStatus),
              done: ['uploaded', 'processing', 'completed'].includes(processingStatus),
            },
            {
              step: '2',
              title: 'Store File',
              desc: 'Private disk storage',
              active: ['uploaded', 'processing', 'completed'].includes(processingStatus),
              done: ['uploaded', 'processing', 'completed'].includes(processingStatus),
            },
            {
              step: '3',
              title: 'Extract Text',
              desc: 'pdf-parse / mammoth',
              active: ['processing', 'completed'].includes(processingStatus),
              done: processingStatus === 'completed',
            },
            {
              step: '4',
              title: 'Save in MongoDB',
              desc: 'extractedText field',
              active: processingStatus === 'completed',
              done: processingStatus === 'completed',
            },
            {
              step: '5',
              title: 'NLP Entity Parsing',
              desc: 'FastAPI AI Engine',
              active: nlpLoading || Boolean(nlpAnalysis),
              done: Boolean(nlpAnalysis),
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`p-3 rounded-xl border transition-all ${
                item.done
                  ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
                  : item.active
                  ? 'bg-brand-500/10 border-brand-500/40 text-brand-300 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  Step {item.step}
                </span>
                {item.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : item.active ? (
                  <RefreshCw className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-200">{item.title}</p>
              <p className="text-[11px] text-slate-400 truncate">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ERROR BANNER IF EXTRACTION / UPLOAD ENCOUNTERED AN ISSUE */}
      {errorDetails && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-4 animate-fade-in shadow-lg shadow-rose-950/30">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-rose-200">
                  Document Extraction Error
                </h4>
                {errorDetails.code && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/60 uppercase">
                    {errorDetails.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-rose-300 mt-1 leading-relaxed">
                {errorDetails.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setErrorDetails(null)}
            className="p-1 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors"
            aria-label="Dismiss error"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* NLP ERROR BANNER */}
      {nlpError && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4 animate-fade-in shadow-lg shadow-amber-950/30">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-amber-200">
                  NLP Analysis Error
                </h4>
                {nlpError.code && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60 uppercase">
                    {nlpError.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-300 mt-1 leading-relaxed">
                {nlpError.message}
              </p>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunNlpAnalysis}
                  icon={RefreshCw}
                  className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                >
                  Retry NLP Analysis
                </Button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setNlpError(null)}
            className="p-1 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-amber-500/20 transition-colors"
            aria-label="Dismiss error"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKFLOW SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Upload Module & Recent Documents (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* File Upload Drop Zone Card */}
          <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-xl">
            <CardHeader
              title="Resume Document Upload"
              subtitle="Select PDF (.pdf) or Word (.docx) to process"
            />

            {/* Drag & Drop Surface */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-4 border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950/80'
              } ${['uploading', 'processing'].includes(processingStatus) ? 'pointer-events-none opacity-60' : ''}`}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div
                  className={`p-3 rounded-2xl transition-all ${
                    isDragging
                      ? 'bg-brand-500/20 text-brand-300 scale-110'
                      : 'bg-slate-800/80 text-slate-400'
                  }`}
                >
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">
                    <span className="text-brand-400 underline underline-offset-2">
                      Click to choose file
                    </span>{' '}
                    or drag & drop
                  </p>
                  <p className="text-xs text-slate-400">PDF (.pdf) or Word (.docx) up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Selected File Card Preview */}
            {selectedFile && (
              <div className="mt-4 p-3 rounded-xl bg-slate-950/90 border border-brand-500/30 flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3 truncate">
                  <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 flex-shrink-0">
                    {selectedFile.name.endsWith('.docx') ? (
                      <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-brand-400" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-200 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatFileSize(selectedFile.size)} • Ready for processing
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Upload Progress Indicator */}
            {processingStatus === 'uploading' && (
              <div className="mt-4 space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-300 font-medium flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Uploading & storing document...
                  </span>
                  <span className="font-mono text-white font-bold">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Extraction Running Spinner */}
            {processingStatus === 'processing' && (
              <div className="mt-4 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-3 animate-fade-in">
                <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                <div>
                  <p className="text-xs font-bold text-indigo-200">
                    Extracting Plain Text...
                  </p>
                  <p className="text-[11px] text-indigo-300/80">
                    Executing POST /api/resume/extract/:resumeId
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons for Step-by-Step or All-In-One */}
            <div className="mt-5 space-y-2.5">
              <Button
                variant="primary"
                size="md"
                onClick={handleFullExtractionPipeline}
                disabled={!selectedFile || ['uploading', 'processing'].includes(processingStatus)}
                loading={['uploading', 'processing'].includes(processingStatus)}
                icon={UploadCloud}
                className="w-full shadow-lg shadow-brand-600/20"
              >
                {['uploading', 'processing'].includes(processingStatus)
                  ? 'Processing Document...'
                  : 'Upload & Run Full Pipeline'}
              </Button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleUploadOnly}
                  disabled={!selectedFile || ['uploading', 'processing'].includes(processingStatus)}
                  className="text-xs"
                >
                  Step 1: Store File
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExtractText}
                  disabled={
                    (!activeResume?.id && !activeResume?.resumeId) ||
                    ['uploading', 'processing'].includes(processingStatus)
                  }
                  className="text-xs"
                >
                  Step 2: Extract Text
                </Button>
              </div>

              {/* Dedicated NLP Analysis Trigger */}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRunNlpAnalysis}
                disabled={
                  (!activeResume?.extractedText && !activeResume?.id) ||
                  nlpLoading ||
                  ['uploading', 'processing'].includes(processingStatus)
                }
                loading={nlpLoading}
                icon={Sparkles}
                className="w-full text-xs bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200"
              >
                {nlpLoading ? 'Analyzing NLP Entities...' : 'Run NLP Resume Analysis'}
              </Button>
            </div>
          </Card>

          {/* Quick Test / Sample Resumes Drawer */}
          <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Resumes in MongoDB
                </h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                onClick={() => {
                  setLoadingRecent(true);
                  getAllResumes()
                    .then((r) => r?.data && setRecentResumes(r.data))
                    .finally(() => setLoadingRecent(false));
                }}
                className="text-xs h-7 px-2"
              >
                Refresh
              </Button>
            </div>

            {loadingRecent ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-brand-400" />
                Loading saved documents...
              </div>
            ) : recentResumes.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 rounded-xl bg-slate-950/40 border border-slate-800/80">
                No resumes found in database yet. Upload a document above to see it appear here.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {recentResumes.slice(0, 8).map((resume) => (
                  <div
                    key={resume._id || resume.id}
                    onClick={() => loadResumeData(resume._id || resume.id)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      activeResume?.id === (resume._id || resume.id) ||
                      activeResume?.resumeId === (resume._id || resume.id)
                        ? 'bg-brand-500/10 border-brand-500/40 text-brand-200'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-slate-200 truncate" title={resume.fileName}>
                          {resume.fileName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {formatDate(resume.createdAt || resume.uploadDate)} •{' '}
                          {resume.wordCount ? `${resume.wordCount} words` : 'Unparsed'}
                        </p>
                      </div>
                    </div>
                    <div>{getStatusBadge(resume.analysisStatus)}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: Active Document Metadata, Tabbed NLP Results & Text Preview (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Document Details Card */}
          <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-xl">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Target Document
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-400" />
                  {activeResume?.fileName || 'No Document Selected'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(activeResume?.analysisStatus || processingStatus)}
              </div>
            </div>

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 block mb-0.5">Resume Name</span>
                <span className="font-semibold text-slate-200 truncate block" title={activeResume?.fileName}>
                  {activeResume?.fileName || 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 block mb-0.5">Processing Status</span>
                <span className="font-semibold text-emerald-400 uppercase tracking-wide block">
                  {activeResume?.analysisStatus || processingStatus || 'idle'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 block mb-0.5">Word Count</span>
                <span className="font-semibold text-slate-200 block">
                  {activeResume?.wordCount || 0} words
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 block mb-0.5">Skills Extracted</span>
                <span className="font-semibold text-brand-400 block">
                  {nlpAnalysis?.skills?.length || 0} normalized
                </span>
              </div>
            </div>
          </Card>

          {/* TAB CONTROLS: Structured NLP Analysis vs Raw Extracted Text */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('nlp')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'nlp'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Structured NLP Analysis</span>
                {nlpAnalysis && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white">
                    {nlpAnalysis.skills?.length || 0}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Extracted Text Preview</span>
                {activeResume?.extractedText && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {filteredLines.length} lines
                  </span>
                )}
              </button>
            </div>

            {activeTab === 'nlp' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRunNlpAnalysis}
                disabled={(!activeResume?.extractedText && !activeResume?.id) || nlpLoading}
                loading={nlpLoading}
                icon={RefreshCw}
                className="text-xs h-7 text-brand-400 hover:text-brand-300"
              >
                Re-Analyze NLP
              </Button>
            )}
          </div>

          {/* TAB 1: STRUCTURED NLP ANALYSIS VIEW */}
          {activeTab === 'nlp' && (
            <div className="space-y-6">
              {/* LOADING STATE */}
              {nlpLoading && (
                <Card className="border-indigo-500/30 bg-indigo-950/20 backdrop-blur-xl p-8 text-center animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 mx-auto flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 animate-spin" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Analyzing Resume with FastAPI AI Engine...
                  </h4>
                  <p className="text-xs text-indigo-200/80 max-w-md mx-auto mb-6">
                    Parsing document semantics, normalizing skill synonyms (e.g. JS → JavaScript),
                    and structuring education, experience, and projects.
                  </p>

                  <div className="space-y-2 max-w-sm mx-auto text-left">
                    <div className="flex items-center gap-2.5 text-xs text-indigo-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Extracting technical entities & skill taxonomy</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-indigo-300">
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
                      <span>Parsing degrees, universities, and GPA</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-indigo-300">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>Structuring work history and project portfolio</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* EMPTY STATE IF NOT YET ANALYZED */}
              {!nlpLoading && !nlpAnalysis && (
                <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-400 mx-auto flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-brand-400" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">
                    No Structured NLP Analysis Yet
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
                    Click the button below to send the extracted resume text to our Python FastAPI AI service
                    to extract normalized skills, programming languages, frameworks, cloud, DevOps,
                    certifications, and projects.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleRunNlpAnalysis}
                    disabled={!activeResume?.extractedText && !activeResume?.id}
                    icon={Sparkles}
                    className="shadow-lg shadow-brand-600/20"
                  >
                    Run NLP Resume Analysis
                  </Button>
                </Card>
              )}

              {/* RENDER STRUCTURED NLP DATA */}
              {!nlpLoading && nlpAnalysis && (
                <div className="space-y-6 animate-fade-in">
                  {/* 1. TECHNICAL SKILLS (Unified Normalized Cloud) */}
                  <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                          <Code2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Technical Skills</h4>
                          <p className="text-[11px] text-slate-400">All normalized technical proficiencies</p>
                        </div>
                      </div>
                      <Badge variant="primary" size="sm">
                        {nlpAnalysis.skills?.length || 0} detected
                      </Badge>
                    </div>

                    {(!nlpAnalysis.skills || nlpAnalysis.skills.length === 0) ? (
                      <p className="text-xs text-slate-500 italic">No technical skills detected in document.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {nlpAnalysis.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/20 font-medium hover:border-brand-500/40 transition-colors"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* 2. CATEGORIZED TECHNICAL MATRICES (Languages, Frameworks, Databases, Cloud, DevOps) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Programming Languages */}
                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-emerald-400" />
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                            Programming Languages
                          </h5>
                        </div>
                        <Badge variant="success" size="sm">
                          {nlpAnalysis.programmingLanguages?.length || 0}
                        </Badge>
                      </div>
                      {(!nlpAnalysis.programmingLanguages || nlpAnalysis.programmingLanguages.length === 0) ? (
                        <p className="text-xs text-slate-500 italic">None detected.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {nlpAnalysis.programmingLanguages.map((lang, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>

                    {/* Frameworks & Libraries */}
                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                            Frameworks & Web
                          </h5>
                        </div>
                        <Badge variant="cyan" size="sm">
                          {nlpAnalysis.frameworks?.length || 0}
                        </Badge>
                      </div>
                      {(!nlpAnalysis.frameworks || nlpAnalysis.frameworks.length === 0) ? (
                        <p className="text-xs text-slate-500 italic">None detected.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {nlpAnalysis.frameworks.map((fw, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                            >
                              {fw}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>

                    {/* Databases */}
                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-cyan-400" />
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                            Databases
                          </h5>
                        </div>
                        <Badge variant="cyan" size="sm">
                          {nlpAnalysis.databases?.length || 0}
                        </Badge>
                      </div>
                      {(!nlpAnalysis.databases || nlpAnalysis.databases.length === 0) ? (
                        <p className="text-xs text-slate-500 italic">None detected.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {nlpAnalysis.databases.map((db, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                            >
                              {db}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>

                    {/* Cloud Technologies */}
                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                        <div className="flex items-center gap-2">
                          <Cloud className="w-4 h-4 text-sky-400" />
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                            Cloud Platforms
                          </h5>
                        </div>
                        <Badge variant="cyan" size="sm">
                          {nlpAnalysis.cloudTechnologies?.length || 0}
                        </Badge>
                      </div>
                      {(!nlpAnalysis.cloudTechnologies || nlpAnalysis.cloudTechnologies.length === 0) ? (
                        <p className="text-xs text-slate-500 italic">None detected.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {nlpAnalysis.cloudTechnologies.map((cloud, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20"
                            >
                              {cloud}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>

                    {/* DevOps Tools */}
                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-amber-400" />
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                            DevOps & Infrastructure
                          </h5>
                        </div>
                        <Badge variant="warning" size="sm">
                          {nlpAnalysis.devopsTools?.length || 0}
                        </Badge>
                      </div>
                      {(!nlpAnalysis.devopsTools || nlpAnalysis.devopsTools.length === 0) ? (
                        <p className="text-xs text-slate-500 italic">None detected.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {nlpAnalysis.devopsTools.map((devops, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            >
                              {devops}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>

                    {/* Soft Skills */}
                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-rose-400" />
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                            Soft Skills & Leadership
                          </h5>
                        </div>
                        <Badge variant="danger" size="sm">
                          {nlpAnalysis.softSkills?.length || 0}
                        </Badge>
                      </div>
                      {(!nlpAnalysis.softSkills || nlpAnalysis.softSkills.length === 0) ? (
                        <p className="text-xs text-slate-500 italic">None detected.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {nlpAnalysis.softSkills.map((soft, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20"
                            >
                              {soft}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* 3. CERTIFICATIONS */}
                  <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Certifications & Licenses</h4>
                          <p className="text-[11px] text-slate-400">Industry verified credentials and accreditations</p>
                        </div>
                      </div>
                      <Badge variant="warning" size="sm">
                        {nlpAnalysis.certifications?.length || 0}
                      </Badge>
                    </div>

                    {(!nlpAnalysis.certifications || nlpAnalysis.certifications.length === 0) ? (
                      <p className="text-xs text-slate-500 italic">No certifications detected in resume.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {nlpAnalysis.certifications.map((cert, i) => {
                          const certName = typeof cert === 'object' ? cert.name : cert;
                          const certIssuer = typeof cert === 'object' ? cert.issuer : 'Accredited Issuer';
                          const certYear = typeof cert === 'object' ? cert.year : 'Verified';

                          return (
                            <div
                              key={i}
                              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <p className="text-xs font-bold text-slate-200 truncate" title={certName}>
                                  {certName}
                                </p>
                                <p className="text-[11px] text-amber-400/90 font-medium">
                                  {certIssuer}
                                </p>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                                {certYear}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>

                  {/* 4. PROJECTS */}
                  <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <FolderGit2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Technical Projects</h4>
                          <p className="text-[11px] text-slate-400">Software initiatives and portfolio highlights</p>
                        </div>
                      </div>
                      <Badge variant="cyan" size="sm">
                        {nlpAnalysis.projects?.length || 0}
                      </Badge>
                    </div>

                    {(!nlpAnalysis.projects || nlpAnalysis.projects.length === 0) ? (
                      <p className="text-xs text-slate-500 italic">No structured projects extracted.</p>
                    ) : (
                      <div className="space-y-3">
                        {nlpAnalysis.projects.map((proj, i) => {
                          const title = typeof proj === 'object' ? proj.title : `Project ${i + 1}`;
                          const desc = typeof proj === 'object' ? proj.description : String(proj);
                          const techs = typeof proj === 'object' && Array.isArray(proj.technologies) ? proj.technologies : [];

                          return (
                            <div
                              key={i}
                              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2"
                            >
                              <h5 className="text-xs font-bold text-white flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                {title}
                              </h5>
                              {desc && (
                                <p className="text-xs text-slate-300 leading-relaxed">
                                  {desc}
                                </p>
                              )}
                              {techs.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {techs.map((t, ti) => (
                                    <span
                                      key={ti}
                                      className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>

                  {/* 5. EDUCATION */}
                  <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Education & Academics</h4>
                          <p className="text-[11px] text-slate-400">Degrees, academic institutions, and graduation records</p>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">
                        {nlpAnalysis.education?.length || 0}
                      </Badge>
                    </div>

                    {(!nlpAnalysis.education || nlpAnalysis.education.length === 0) ? (
                      <p className="text-xs text-slate-500 italic">No academic history extracted.</p>
                    ) : (
                      <div className="space-y-3">
                        {nlpAnalysis.education.map((edu, i) => {
                          const deg = typeof edu === 'object' ? edu.degree : 'Degree';
                          const inst = typeof edu === 'object' ? edu.institution : 'University';
                          const field = typeof edu === 'object' ? edu.field : '';
                          const yr = typeof edu === 'object' ? edu.year : '';
                          const gpa = typeof edu === 'object' ? edu.gpa : '';

                          return (
                            <div
                              key={i}
                              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <h5 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                                  {deg} {field ? `in ${field}` : ''}
                                </h5>
                                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                  <span>{inst}</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-2 self-start sm:self-center">
                                {gpa && (
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                    GPA: {gpa}
                                  </span>
                                )}
                                {yr && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                    {yr}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>

                  {/* 6. WORK EXPERIENCE */}
                  {nlpAnalysis.experience && nlpAnalysis.experience.length > 0 && (
                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">Work Experience</h4>
                            <p className="text-[11px] text-slate-400">Professional career history</p>
                          </div>
                        </div>
                        <Badge variant="cyan" size="sm">
                          {nlpAnalysis.experience.length}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        {nlpAnalysis.experience.map((exp, i) => {
                          const title = typeof exp === 'object' ? exp.title : 'Role';
                          const company = typeof exp === 'object' ? exp.company : '';
                          const duration = typeof exp === 'object' ? exp.duration : '';
                          const resps = typeof exp === 'object' && Array.isArray(exp.responsibilities) ? exp.responsibilities : [];

                          return (
                            <div
                              key={i}
                              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <h5 className="text-xs font-bold text-white">
                                  {title} {company ? `• ${company}` : ''}
                                </h5>
                                {duration && (
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {duration}
                                  </span>
                                )}
                              </div>
                              {resps.length > 0 && (
                                <ul className="space-y-1 pt-1 text-xs text-slate-300">
                                  {resps.map((r, ri) => (
                                    <li key={ri} className="flex items-start gap-2">
                                      <span className="text-brand-400 font-bold">•</span>
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXTRACTED TEXT PREVIEW VIEWER CARD */}
          {activeTab === 'preview' && (
            <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl relative overflow-hidden">
              {/* Header with Search and Viewer Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-brand-400" />
                  <h3 className="text-sm font-bold text-white">Extracted Text Preview</h3>
                  {activeResume?.extractedText && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {filteredLines.length} lines
                    </span>
                  )}
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Find in text..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-36 sm:w-44 pl-8 pr-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                    {searchQuery && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-brand-400">
                        {searchMatchesCount}
                      </span>
                    )}
                  </div>

                  {/* Line Numbers Toggle */}
                  <button
                    onClick={() => setShowLineNumbers(!showLineNumbers)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      showLineNumbers
                        ? 'bg-brand-500/10 border-brand-500/30 text-brand-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Toggle Line Numbers"
                  >
                    <Hash className="w-3.5 h-3.5" />
                  </button>

                  {/* Monospace Toggle */}
                  <button
                    onClick={() => setIsMonospace(!isMonospace)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      isMonospace
                        ? 'bg-brand-500/10 border-brand-500/30 text-brand-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Toggle Monospace / Sans Font"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                  </button>

                  {/* Wrap Text Toggle */}
                  <button
                    onClick={() => setWrapText(!wrapText)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      wrapText
                        ? 'bg-brand-500/10 border-brand-500/30 text-brand-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Toggle Word Wrap"
                  >
                    <WrapText className="w-3.5 h-3.5" />
                  </button>

                  {/* Copy Text Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyText}
                    disabled={!activeResume?.extractedText}
                    icon={copied ? Check : Copy}
                    className="text-xs h-7 px-2.5"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>

                  {/* Download Text Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTxt}
                    disabled={!activeResume?.extractedText}
                    icon={Download}
                    className="text-xs h-7 px-2.5"
                  >
                    Export .txt
                  </Button>
                </div>
              </div>

              {/* PREVIEW CONTAINER */}
              <div
                ref={textContainerRef}
                className={`mt-4 rounded-xl bg-slate-950 border border-slate-800/80 p-4 h-[480px] overflow-y-auto ${
                  wrapText ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'
                } ${isMonospace ? 'font-mono text-xs leading-relaxed' : 'font-sans text-xs sm:text-sm leading-relaxed text-slate-300'}`}
              >
                {!activeResume?.extractedText ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="max-w-xs space-y-1">
                      <p className="text-sm font-semibold text-slate-300">
                        No Extracted Text Yet
                      </p>
                      <p className="text-xs text-slate-500">
                        Upload a PDF or DOCX file to extract its raw text content and inspect the preview here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {filteredLines.map((line, index) => {
                      const isBlank = !line.trim();

                      // Search highlighter
                      let lineContent = line;
                      if (searchQuery.trim()) {
                        const parts = line.split(
                          new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
                        );
                        lineContent = parts.map((part, i) =>
                          part.toLowerCase() === searchQuery.toLowerCase() ? (
                            <mark
                              key={i}
                              className="bg-amber-400 text-slate-950 font-bold px-0.5 rounded"
                            >
                              {part}
                            </mark>
                          ) : (
                            part
                          )
                        );
                      }

                      return (
                        <div
                          key={index}
                          className={`flex items-start gap-3 hover:bg-slate-900/60 rounded px-1 transition-colors ${
                            isBlank ? 'h-4' : ''
                          }`}
                        >
                          {showLineNumbers && (
                            <span className="w-9 flex-shrink-0 text-right font-mono text-[10px] text-slate-600 select-none pt-0.5">
                              {index + 1}
                            </span>
                          )}
                          <span className="flex-1 text-slate-300">{lineContent}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Status Bar */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Extracted text stored securely in MongoDB (Resume.extractedText)
                </span>
                <span>
                  {activeResume?.wordCount || 0} words •{' '}
                  {activeResume?.characterCount || (activeResume?.extractedText || '').length || 0} characters
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysisPage;
