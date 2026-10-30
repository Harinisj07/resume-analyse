import mongoose from 'mongoose';
import CareerReadiness from '../models/careerReadiness.model.js';
import Role from '../models/role.model.js';
import Resume from '../models/resume.model.js';
import SkillGapAnalysis from '../models/skillGapAnalysis.model.js';
import { analyzeSkillGap, deduplicateSkills } from '../services/skillGap.service.js';
import { calculateReadiness } from '../services/careerReadiness.service.js';

/**
 * Helper to collect skills from a resume document
 */
const extractSkillsFromResume = (resumeDoc) => {
  if (!resumeDoc) return [];

  const collected = [];
  if (Array.isArray(resumeDoc.extractedSkills)) {
    for (const item of resumeDoc.extractedSkills) {
      if (typeof item === 'string') collected.push(item);
      else if (item && typeof item === 'object' && item.name) collected.push(item.name);
    }
  }

  if (Array.isArray(resumeDoc.structuredAnalysis?.skills)) {
    collected.push(...resumeDoc.structuredAnalysis.skills);
  }

  if (resumeDoc.skillsByCategory) {
    const byCat =
      resumeDoc.skillsByCategory instanceof Map
        ? Object.fromEntries(resumeDoc.skillsByCategory)
        : resumeDoc.skillsByCategory;
    Object.values(byCat).forEach((categoryList) => {
      if (Array.isArray(categoryList)) collected.push(...categoryList);
    });
  }

  return deduplicateSkills(collected);
};

/**
 * @desc Calculate and optionally save Career Readiness Score (0-100)
 * @route POST /api/career-readiness/calculate or POST /api/v1/career-readiness/calculate
 * @access Public / Optional Auth
 */
export const calculateScore = async (req, res, next) => {
  try {
    const { roleId, targetRole, resumeId, skills, save = true } = req.body;

    // 1. Resolve Target Role
    let roleDoc = null;
    const isRoleSpecified = Boolean(roleId || targetRole);

    if (roleId && mongoose.Types.ObjectId.isValid(roleId)) {
      roleDoc = await Role.findById(roleId);
    }

    if (!roleDoc && targetRole && typeof targetRole === 'string') {
      roleDoc = await Role.findOne({
        name: { $regex: new RegExp(`^${targetRole.trim()}$`, 'i') },
      });
    }

    if (isRoleSpecified && !roleDoc) {
      return res.status(404).json({
        success: false,
        message: `Target role not found with identifier '${roleId || targetRole}'.`,
      });
    }

    if (!roleDoc && req.user) {
      if (req.user.targetRoleId) {
        roleDoc = await Role.findById(req.user.targetRoleId);
      }
      if (!roleDoc && req.user.targetRole) {
        roleDoc = await Role.findOne({
          name: { $regex: new RegExp(`^${req.user.targetRole.trim()}$`, 'i') },
        });
      }
    }

    if (!roleDoc) {
      roleDoc = await Role.findOne({ name: 'Software Engineer' });
      if (!roleDoc) {
        roleDoc = await Role.findOne();
      }
    }

    if (!roleDoc) {
      return res.status(404).json({
        success: false,
        message: 'No target role available. Please select a valid target role.',
      });
    }

    // 2. Resolve Resume & Candidate Skills
    let resumeDoc = null;
    let candidateSkills = [];
    const isSkillsExplicitlyPassed = Array.isArray(skills);

    if (isSkillsExplicitlyPassed) {
      candidateSkills = deduplicateSkills(skills);
    } else if (resumeId && mongoose.Types.ObjectId.isValid(resumeId)) {
      resumeDoc = await Resume.findById(resumeId);
      if (resumeDoc) {
        candidateSkills = extractSkillsFromResume(resumeDoc);
      }
    } else if (req.user?._id) {
      resumeDoc = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      if (resumeDoc) {
        candidateSkills = extractSkillsFromResume(resumeDoc);
      } else if (Array.isArray(req.user.skills) && req.user.skills.length > 0) {
        candidateSkills = deduplicateSkills(req.user.skills);
      }
    } else {
      resumeDoc = await Resume.findOne({
        $or: [
          { 'extractedSkills.0': { $exists: true } },
          { 'structuredAnalysis.skills.0': { $exists: true } },
        ],
      }).sort({ createdAt: -1 });

      if (resumeDoc) {
        candidateSkills = extractSkillsFromResume(resumeDoc);
      }
    }

    // 3. Compute or Retrieve Skill Gap Results
    const gapAnalysis = analyzeSkillGap(candidateSkills, roleDoc);

    // 4. Calculate Career Readiness Score
    const readinessData = calculateReadiness({
      gapAnalysis,
      resumeDoc,
      roleDoc,
    });

    const isMissingResume = !resumeDoc && candidateSkills.length === 0;

    const payload = {
      userId: req.user?._id || null,
      resumeId: resumeDoc?._id || null,
      roleId: roleDoc._id,
      resumeFileName: resumeDoc?.fileName || resumeDoc?.title || 'Profile Skills',
      roleName: roleDoc.name,
      roleCategory: roleDoc.category,
      readinessScore: readinessData.readinessScore,
      readinessTier: readinessData.readinessTier,
      scoreBreakdown: readinessData.scoreBreakdown,
      strengths: readinessData.strengths,
      criticalGaps: readinessData.criticalGaps,
      areasToImprove: readinessData.areasToImprove,
      formulaExplanation: readinessData.formulaExplanation,
    };

    // 5. Persist to MongoDB if save is requested
    let savedRecord = null;
    if (save !== false) {
      savedRecord = await CareerReadiness.create(payload);
    }

    return res.status(200).json({
      success: true,
      message: 'Career readiness score calculated successfully',
      data: savedRecord || payload,
      warning: isMissingResume
        ? 'No resume or skills provided. Readiness score calculated at baseline. Upload a resume to evaluate full readiness.'
        : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get saved Career Readiness scores
 * @route GET /api/career-readiness or GET /api/v1/career-readiness
 * @access Public / Optional Auth
 */
export const getScores = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user?._id) {
      filter.userId = req.user._id;
    }

    const limit = parseInt(req.query.limit, 10) || 20;

    const scores = await CareerReadiness.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: scores.length,
      data: scores,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single saved Career Readiness score by ID
 * @route GET /api/career-readiness/:id or GET /api/v1/career-readiness/:id
 * @access Public / Optional Auth
 */
export const getScoreById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid score ID format',
      });
    }

    const scoreDoc = await CareerReadiness.findById(id);
    if (!scoreDoc) {
      return res.status(404).json({
        success: false,
        message: 'Career readiness assessment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: scoreDoc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete saved Career Readiness assessment
 * @route DELETE /api/career-readiness/:id
 * @access Public / Optional Auth
 */
export const deleteScore = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid score ID format',
      });
    }

    const deleted = await CareerReadiness.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Career readiness assessment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Career readiness record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  calculateScore,
  getScores,
  getScoreById,
  deleteScore,
};
