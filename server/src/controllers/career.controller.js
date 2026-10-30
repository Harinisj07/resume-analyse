import aiService from '../services/ai.service.js';

/**
 * @desc Generate dynamic career roadmap based on skills and target role
 * @route POST /api/v1/career/roadmap
 * @access Public / Authenticated
 */
export const generateRoadmap = async (req, res, next) => {
  try {
    const { targetRole, currentSkills = [], experienceLevel = 'intermediate' } = req.body;

    if (!targetRole || typeof targetRole !== 'string' || targetRole.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid targetRole (e.g., Full Stack Engineer, Cloud Architect, AI Specialist).',
      });
    }

    const aiResult = await aiService.generateCareerRoadmap(targetRole, currentSkills, experienceLevel);

    res.status(200).json({
      success: true,
      data: aiResult.data,
    });
  } catch (error) {
    next(error);
  }
};
