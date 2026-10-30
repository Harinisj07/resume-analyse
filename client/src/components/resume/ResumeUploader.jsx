import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Clock,
  ShieldCheck,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { uploadResume, getMyResume } from '../../services/resumeService';

export const ResumeUploader = ({ onUploadSuccess, onFileSelect }) => {
  const fileInputRef = useRef(null);

  // States
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Allowed configurations
  const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

  // Check if there is already an uploaded resume
  useEffect(() => {
    let isMounted = true;
    const fetchExisting = async () => {
      try {
        const res = await getMyResume();
        if (isMounted && res?.data) {
          setUploadedResume(res.data);
        }
      } catch (err) {
        // No existing resume found or backend not running yet
      } finally {
        if (isMounted) setCheckingExisting(false);
      }
    };
    fetchExisting();
    return () => {
      isMounted = false;
    };
  }, []);

  // Validation function
  const validateFile = (selectedFile) => {
    if (!selectedFile) return 'Please select a file to upload.';

    const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
    const mime = selectedFile.type.toLowerCase();

    // Check extension and mime
    const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);
    const isMimeAllowed = mime ? ALLOWED_MIME_TYPES.includes(mime) : true;

    if (!isExtAllowed || !isMimeAllowed) {
      return `Unsupported file format "${ext}". Only PDF (.pdf) and Word documents (.docx) are supported.`;
    }

    // Check size
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(1);
      return `File size (${sizeMB} MB) exceeds maximum allowed limit of 10 MB.`;
    }

    return null;
  };

  // Handle selected file
  const handleSelectFile = (candidateFile) => {
    setError(null);
    const validationError = validateFile(candidateFile);
    if (validationError) {
      setError(validationError);
      setFile(null);
      if (onFileSelect) onFileSelect(null);
      return;
    }
    setFile(candidateFile);
    if (onFileSelect) onFileSelect(candidateFile);
  };

  // Drag event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (uploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleSelectFile(e.target.files[0]);
    }
  };

  // Upload action
  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a valid PDF or DOCX resume to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const response = await uploadResume(file, (progress) => {
        setUploadProgress(progress);
      });

      if (response && response.data) {
        setUploadedResume(response.data);
        setFile(null);
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Upload failed. Please verify your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className="relative overflow-hidden border border-slate-800 bg-slate-900/70 backdrop-blur-xl">
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleInputChange}
        className="hidden"
        disabled={uploading}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Resume Upload Module</h3>
            <p className="text-xs text-slate-400">
              Upload your document in PDF or DOCX format for ATS parsing & evaluation
            </p>
          </div>
        </div>
        <Badge variant="primary" size="sm">
          PDF & DOCX Only
        </Badge>
      </div>

      {/* Error Alert Message */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start justify-between gap-3 text-xs text-rose-300 animate-fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 p-0.5"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUCCESS STATE: Display Active / Uploaded Resume Metadata */}
      {uploadedResume && !file && (
        <div className="mb-6 p-5 rounded-2xl bg-slate-950/70 border border-emerald-500/20 relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                  Active Document Ready
                </span>
                <h4 className="text-base font-bold text-white truncate max-w-md" title={uploadedResume.fileName}>
                  {uploadedResume.fileName}
                </h4>
              </div>
            </div>
            <Badge variant="success" size="sm" dot>
              {uploadedResume.analysisStatus === 'uploaded' ? 'Uploaded' : uploadedResume.analysisStatus}
            </Badge>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs py-3 border-y border-slate-800/80 mb-4">
            <div>
              <span className="text-slate-500 block mb-0.5">Resume Name</span>
              <span className="font-semibold text-slate-200 truncate block">
                {uploadedResume.fileName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Upload Date</span>
              <span className="font-medium text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {formatDate(uploadedResume.uploadDate || uploadedResume.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Processing Status</span>
              <span className="font-medium text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {uploadedResume.analysisStatus === 'uploaded'
                  ? 'Uploaded (Awaiting NLP)'
                  : uploadedResume.analysisStatus}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              Stored in secure private storage (Not publicly accessible)
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs"
            >
              Upload New Version
            </Button>
          </div>
        </div>
      )}

      {/* DRAG AND DROP ZONE */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`p-4 rounded-2xl transition-all ${
              isDragging
                ? 'bg-brand-500/20 text-brand-300 scale-110'
                : 'bg-slate-800/60 text-slate-400'
            }`}
          >
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">
              <span className="text-brand-400 hover:text-brand-300 underline underline-offset-2">
                Click to browse
              </span>{' '}
              or drag & drop your resume
            </p>
            <p className="text-xs text-slate-400">
              Supported file formats: <strong className="text-slate-300">PDF (.pdf)</strong> or{' '}
              <strong className="text-slate-300">DOCX (.docx)</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
              Max size: 10 MB
            </span>
            <span className="text-[11px] text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
              Confidential & Secure
            </span>
          </div>
        </div>
      </div>

      {/* SELECTED FILE PREVIEW & UPLOAD ACTION */}
      {file && (
        <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 truncate">
              <div className="p-2.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-semibold text-slate-200 truncate">{file.name}</h4>
                <p className="text-[11px] text-slate-400">{formatFileSize(file.size)}</p>
              </div>
            </div>

            {!uploading && (
              <button
                onClick={handleReset}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Remove selected file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-300 font-medium flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Uploading resume document...
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/80">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              disabled={uploading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpload}
              loading={uploading}
              icon={UploadCloud}
              className="text-xs shadow-lg shadow-brand-600/20"
            >
              {uploading ? `Uploading (${uploadProgress}%)` : 'Upload Resume'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ResumeUploader;
