import aiService from '../services/ai.service.js';
import Resume from '../models/resume.model.js';

/**
 * @desc Check AI Microservice connection directly
 * @route GET /api/v1/ai/health
 * @access Public
 */
export const getAIHealth = async (req, res, next) => {
  try {
    const health = await aiService.checkHealth();
    res.status(health.status === 'online' ? 200 : 503).json({
      success: health.status === 'online',
      ...health,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Forward resume text to AI service for parsing & analysis
 * @route POST /api/v1/ai/analyze
 * @access Public (Scaffolded)
 */
export const analyzeResume = async (req, res, next) => {
  try {
    const { rawText, targetRole, targetJobDescription, saveToDb = false } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid resume rawText (minimum 10 characters).',
      });
    }

    // Call FastAPI service
    const aiResult = await aiService.analyzeResume(rawText, targetRole, targetJobDescription);

    let savedResumeId = null;
    if (saveToDb) {
      const resumeDoc = await Resume.create({
        rawText,
        targetRole: targetRole || '',
        atsScore: aiResult.data.ats_score,
        extractedSkills: aiResult.data.skills,
        missingSkills: aiResult.data.missing_skills,
        strengths: aiResult.data.strengths,
        improvements: aiResult.data.improvements,
        analysisMetadata: aiResult.data.metadata,
      });
      savedResumeId = resumeDoc._id;
    }

    res.status(200).json({
      success: true,
      message: 'Resume analysis completed successfully',
      data: aiResult.data,
      savedResumeId,
    });
  } catch (error) {
    next(error);
  }
};
