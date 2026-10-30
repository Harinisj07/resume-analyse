import mongoose from 'mongoose';
import fs from 'fs';
import Resume from '../models/resume.model.js';
import aiService from '../services/ai.service.js';
import { extractResumeDocumentText, ExtractionError } from '../services/textExtraction.service.js';
import path from 'path';

/**
 * @desc Upload resume document (PDF, DOCX, TXT) and run complete NLP analysis
 * @route POST /api/v1/resumes/upload
 * @access Public / Authenticated
 */
export const uploadAndAnalyze = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF, DOCX, or TXT).',
      });
    }

    const { targetRole = 'Full Stack Software Engineer', targetJobDescription = '', title } = req.body;
    const originalName = req.file.originalname;
    const ext = path.extname(originalName).toLowerCase().replace('.', '') || 'raw';

    // Safely resolve file buffer from memory or disk
    const fileBuffer = req.file.buffer || (req.file.path ? fs.readFileSync(req.file.path) : null);
    if (!fileBuffer) {
      return res.status(400).json({
        success: false,
        message: 'Could not read uploaded file content.',
      });
    }

    // Extract text directly via Node.js extraction service if PDF or DOCX
    let extractedText = '';
    let extractedWordCount = 0;
    try {
      if (req.file.path && ['.pdf', '.docx'].includes(path.extname(originalName).toLowerCase())) {
        const extResult = await extractResumeDocumentText(req.file.path, originalName);
        extractedText = extResult.text;
        extractedWordCount = extResult.wordCount;
      }
    } catch (extErr) {
      console.warn('[TextExtraction] Warning during local text extraction:', extErr.message);
    }

    // Call FastAPI microservice with file buffer
    const aiResult = await aiService.analyzeResumeFile(
      fileBuffer,
      originalName,
      req.file.mimetype,
      targetRole,
      targetJobDescription
    );

    const data = aiResult.data;

    // Persist full structured analysis to MongoDB
    const resumeDoc = await Resume.create({
      userId: req.user?._id || null,
      title: title || originalName.replace(/\.[^/.]+$/, ''),
      fileName: originalName,
      filePath: req.file.path || '',
      fileType: ['pdf', 'docx', 'txt'].includes(ext) ? ext : 'raw',
      fileSize: req.file.size || fileBuffer.length || 0,
      rawText: extractedText || data.metadata?.source_filename || originalName,
      extractedText: extractedText || '',
      analysisStatus: 'completed',
      targetRole: targetRole || data.metadata?.target_role,
      targetJobDescription: targetJobDescription || '',
      atsScore: data.ats_score,
      scoreBreakdown: {
        contactScore: data.score_breakdown?.contact_score || 0,
        structureScore: data.score_breakdown?.structure_score || 0,
        impactScore: data.score_breakdown?.impact_score || 0,
        relevanceScore: data.score_breakdown?.relevance_score || 0,
        formatScore: data.score_breakdown?.format_score || 0,
      },
      contactInfo: data.contact_info || {},
      detectedSections: data.detected_sections || {},
      extractedSkills: data.skills || [],
      skillsByCategory: data.skills_by_category || {},
      missingSkills: data.missing_skills || data.job_match?.missing_critical_skills || [],
      jobMatch: {
        matchPercentage: data.job_match?.match_percentage ?? data.jobMatch?.matchPercentage ?? 0,
        matchedSkills: data.job_match?.matched_skills ?? data.jobMatch?.matchedSkills ?? [],
        missingCriticalSkills: data.job_match?.missing_critical_skills ?? data.jobMatch?.missingCriticalSkills ?? [],
        recommendedKeywords: data.job_match?.recommended_keywords ?? data.jobMatch?.recommendedKeywords ?? [],
      },
      strengths: data.strengths || [],
      improvements: data.improvements || [],
      metricsCount: data.metrics_count || 0,
      actionVerbsCount: data.action_verbs_count || 0,
      wordCount: data.word_count || extractedWordCount || 0,
      analysisMetadata: data.metadata || {},
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      data: resumeDoc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Analyze raw resume text and optionally persist
 * @route POST /api/v1/resumes/analyze
 * @access Public / Authenticated
 */
export const analyzeText = async (req, res, next) => {
  try {
    const { rawText, targetRole, targetJobDescription, saveToDb = true, title = 'Direct Text Scan' } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid resume rawText (minimum 10 characters).',
      });
    }

    // Call FastAPI microservice
    const aiResult = await aiService.analyzeResume(rawText, targetRole, targetJobDescription);
    const data = aiResult.data;

    let savedResume = null;
    if (saveToDb) {
      savedResume = await Resume.create({
        userId: req.user?._id || null,
        title,
        fileName: 'raw_text_input',
        fileType: 'raw',
        rawText,
        targetRole: targetRole || data.metadata?.target_role,
        targetJobDescription: targetJobDescription || '',
        atsScore: data.ats_score,
        scoreBreakdown: {
          contactScore: data.score_breakdown?.contact_score || 0,
          structureScore: data.score_breakdown?.structure_score || 0,
          impactScore: data.score_breakdown?.impact_score || 0,
          relevanceScore: data.score_breakdown?.relevance_score || 0,
          formatScore: data.score_breakdown?.format_score || 0,
        },
        contactInfo: data.contact_info || {},
        detectedSections: data.detected_sections || {},
        extractedSkills: data.skills || [],
        skillsByCategory: data.skills_by_category || {},
        missingSkills: data.missing_skills || data.job_match?.missing_critical_skills || [],
        jobMatch: {
          matchPercentage: data.job_match?.match_percentage ?? data.jobMatch?.matchPercentage ?? 0,
          matchedSkills: data.job_match?.matched_skills ?? data.jobMatch?.matchedSkills ?? [],
          missingCriticalSkills: data.job_match?.missing_critical_skills ?? data.jobMatch?.missingCriticalSkills ?? [],
          recommendedKeywords: data.job_match?.recommended_keywords ?? data.jobMatch?.recommendedKeywords ?? [],
        },
        strengths: data.strengths || [],
        improvements: data.improvements || [],
        metricsCount: data.metrics_count || 0,
        actionVerbsCount: data.action_verbs_count || 0,
        wordCount: data.word_count || 0,
        analysisMetadata: data.metadata || {},
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: savedResume || data,
      savedResumeId: savedResume?._id || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all analyzed resumes
 * @route GET /api/v1/resumes
 * @access Public / Authenticated
 */
export const getAllResumes = async (req, res, next) => {
  try {
    const filter = {};

    // If mine=true requested and user is authenticated, filter by userId
    if (req.query.mine === 'true') {
      if (req.user?._id) {
        filter.userId = req.user._id;
      } else {
        // If unauthenticated requested their resumes, return empty list
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }
    }

    const resumes = await Resume.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-rawText'); // Exclude heavy raw text for list view

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single resume analysis details
 * @route GET /api/v1/resumes/:id
 * @access Public / Authenticated
 */
export const getResumeById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume analysis ID format',
      });
    }

    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis not found',
      });
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a saved resume analysis
 * @route DELETE /api/v1/resumes/:id
 * @access Public / Authenticated
 */
export const deleteResume = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume analysis ID format',
      });
    }

    const resume = await Resume.findByIdAndDelete(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume analysis deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc Dedicated resume upload handler (PDF & DOCX with Multer diskStorage)
 * @route POST /api/resume/upload
 * @access Public / Authenticated
 */
export const uploadResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        code: 'FILE_MISSING',
        message: 'No file uploaded. Please select a valid PDF (.pdf) or Word document (.docx).',
      });
    }

    const { originalname, mimetype, path: filePath, size } = req.file;

    // Create MongoDB record conforming to specifications: uploaded -> stored -> ready for extraction
    const resume = await Resume.create({
      userId: req.user?._id || req.user?.id || null,
      fileName: originalname,
      filePath,
      fileType: mimetype,
      extractedText: '',
      analysisStatus: 'uploaded',
      fileSize: size,
    });

    // Optional query parameter: ?extract=true
    if (req.query.extract === 'true') {
      try {
        resume.analysisStatus = 'processing';
        await resume.save();

        const extractionResult = await extractResumeDocumentText(filePath, originalname);
        resume.extractedText = extractionResult.text;
        resume.wordCount = extractionResult.wordCount;
        resume.analysisStatus = 'completed';
        await resume.save();

        return res.status(201).json({
          success: true,
          message: 'Resume uploaded and text extracted successfully.',
          data: {
            id: resume._id,
            resumeId: resume._id,
            fileName: resume.fileName,
            fileType: resume.fileType,
            fileSize: resume.fileSize,
            analysisStatus: resume.analysisStatus,
            processingStatus: resume.analysisStatus,
            extractedText: resume.extractedText,
            wordCount: extractionResult.wordCount,
            characterCount: extractionResult.characterCount,
            pagesCount: extractionResult.pagesCount,
            uploadDate: resume.createdAt,
            updatedAt: resume.updatedAt,
          },
        });
      } catch (extError) {
        resume.analysisStatus = 'failed';
        await resume.save();

        const statusCode = extError.statusCode || extError.status || 400;
        return res.status(statusCode).json({
          success: false,
          code: extError.code || 'EXTRACTION_ERROR',
          message: extError.message || 'Failed to extract text from resume document.',
          analysisStatus: 'failed',
          processingStatus: 'failed',
          data: {
            id: resume._id,
            resumeId: resume._id,
            fileName: resume.fileName,
            fileType: resume.fileType,
            fileSize: resume.fileSize,
            analysisStatus: 'failed',
            processingStatus: 'failed',
          },
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and stored successfully.',
      data: {
        id: resume._id,
        resumeId: resume._id,
        fileName: resume.fileName,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        uploadDate: resume.createdAt,
        analysisStatus: resume.analysisStatus,
        processingStatus: resume.analysisStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc Get the active/latest uploaded resume metadata
 * @route GET /api/resume/my-resume
 * @access Public / Authenticated
 */
export const getMyResume = async (req, res, next) => {
  try {
    const query = req.user?._id ? { userId: req.user._id } : {};
    const resume = await Resume.findOne(query).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found for current user or session.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: resume._id,
        fileName: resume.fileName,
        uploadDate: resume.createdAt,
        analysisStatus: resume.analysisStatus,
        fileSize: resume.fileSize,
        fileType: resume.fileType,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Securely download resume document (Authorization enforced)
 * @route GET /api/resume/:id/download
 * @access Authenticated / Owner only
 */
export const secureDownloadResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid resume ID' });
    }

    const resume = await Resume.findById(id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume document not found' });
    }

    // Security check: If resume is tied to a user, enforce authorization
    if (resume.userId && (!req.user || req.user._id.toString() !== resume.userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to access this private document.',
      });
    }

    res.download(resume.filePath, resume.fileName);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Extract text from uploaded PDF or DOCX resume document
 * @route POST /api/resume/extract/:resumeId
 * @access Public / Authenticated
 */
export const extractResumeText = async (req, res, next) => {
  const { resumeId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_RESUME_ID',
        message: 'Invalid resume ID format.',
      });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({
        success: false,
        code: 'RESUME_NOT_FOUND',
        message: 'Resume document not found.',
      });
    }

    // Step: Processing Status
    resume.analysisStatus = 'processing';
    await resume.save();

    try {
      // Step: Extract text from stored document file (PDF / DOCX)
      const extractionResult = await extractResumeDocumentText(
        resume.filePath,
        resume.fileName
      );

      // Step: Save extractedText in MongoDB
      resume.extractedText = extractionResult.text;
      resume.wordCount = extractionResult.wordCount;
      resume.analysisStatus = 'completed';
      await resume.save();

      // Step: Return processing status
      return res.status(200).json({
        success: true,
        message: 'Resume text extracted successfully.',
        data: {
          id: resume._id,
          resumeId: resume._id,
          fileName: resume.fileName,
          fileType: resume.fileType,
          fileSize: resume.fileSize,
          analysisStatus: resume.analysisStatus,
          processingStatus: resume.analysisStatus,
          extractedText: resume.extractedText,
          wordCount: extractionResult.wordCount,
          characterCount: extractionResult.characterCount,
          pagesCount: extractionResult.pagesCount,
          uploadDate: resume.createdAt,
          updatedAt: resume.updatedAt,
        },
      });
    } catch (extractionError) {
      // Mark analysisStatus as failed in database
      resume.analysisStatus = 'failed';
      await resume.save();

      const statusCode = extractionError.statusCode || extractionError.status || 400;
      return res.status(statusCode).json({
        success: false,
        code: extractionError.code || 'EXTRACTION_ERROR',
        message: extractionError.message || 'Failed to extract text from resume file.',
        analysisStatus: 'failed',
        processingStatus: 'failed',
        data: {
          id: resume._id,
          resumeId: resume._id,
          fileName: resume.fileName,
          fileType: resume.fileType,
          analysisStatus: 'failed',
          processingStatus: 'failed',
          error: extractionError.message,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get extracted resume text and metadata
 * @route GET /api/resume/:resumeId/text
 * @access Public / Authenticated
 */
export const getResumeText = async (req, res, next) => {
  const { resumeId } = req.params;

  try {
    let resume;
    if (resumeId === 'my-resume' || resumeId === 'active') {
      const query = req.user?._id ? { userId: req.user._id } : {};
      resume = await Resume.findOne(query).sort({ createdAt: -1 });
    } else {
      if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid resume ID format.',
        });
      }
      resume = await Resume.findById(resumeId);
    }

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: resume._id,
        fileName: resume.fileName,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        analysisStatus: resume.analysisStatus,
        extractedText: resume.extractedText || '',
        wordCount: resume.wordCount || 0,
        characterCount: (resume.extractedText || '').length,
        uploadDate: resume.createdAt,
        updatedAt: resume.updatedAt,
        structuredAnalysis: resume.structuredAnalysis || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Run NLP analysis on resume text via FastAPI AI Service and persist structured result in MongoDB
 * @route POST /api/resume/analyze-resume/:resumeId
 * @route POST /api/resume/analyze-resume
 * @access Public / Authenticated
 */
export const analyzeResumeWithNLP = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const bodyResumeId = req.body?.resumeId;
    const targetId = resumeId || bodyResumeId;
    let textToAnalyze = req.body?.text || req.body?.rawText;

    let resume = null;

    if (targetId) {
      if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_RESUME_ID',
          message: 'Invalid resume ID format.',
        });
      }

      resume = await Resume.findById(targetId);
      if (!resume) {
        return res.status(404).json({
          success: false,
          code: 'RESUME_NOT_FOUND',
          message: 'Resume record not found.',
        });
      }

      if (!textToAnalyze) {
        textToAnalyze = resume.extractedText;
      }

      // If resume has no extractedText yet, try extracting from file on disk
      if (!textToAnalyze && resume.filePath && fs.existsSync(resume.filePath)) {
        const extraction = await extractResumeDocumentText(resume.filePath, resume.fileName);
        resume.extractedText = extraction.text;
        resume.wordCount = extraction.wordCount;
        textToAnalyze = extraction.text;
      }
    }

    if (!textToAnalyze || typeof textToAnalyze !== 'string' || textToAnalyze.trim().length < 5) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_TEXT',
        message: 'No extractable text found in resume to analyze.',
      });
    }

    // Call Python FastAPI AI Service POST /analyze-resume
    const aiResult = await aiService.analyzeResumeNLP(textToAnalyze);
    const structuredData = aiResult.data;

    // If we have a resume document, persist structured results in MongoDB
    if (resume) {
      resume.structuredAnalysis = structuredData;

      // Also sync extractedSkills with confidence
      if (Array.isArray(structuredData.skills)) {
        resume.extractedSkills = structuredData.skills.map((s) => ({
          name: s,
          category: 'technical',
          confidence: 0.95,
        }));
      }

      resume.analysisStatus = 'completed';
      await resume.save();
    } else {
      // Create new resume record if unassociated direct text analysis
      resume = await Resume.create({
        userId: req.user?._id || null,
        title: req.body?.title || 'Direct NLP Analysis',
        fileName: req.body?.fileName || 'nlp_analysis_input',
        fileType: 'raw',
        extractedText: textToAnalyze,
        structuredAnalysis: structuredData,
        analysisStatus: 'completed',
        wordCount: textToAnalyze.split(/\s+/).filter(Boolean).length,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resume NLP analysis completed and saved successfully.',
      data: resume.structuredAnalysis,
      resumeId: resume._id,
      resume,
    });
  } catch (error) {
    next(error);
  }
};


