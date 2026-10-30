import mongoose from 'mongoose';
import SkillGapAnalysis from '../models/skillGapAnalysis.model.js';
import Role from '../models/role.model.js';
import Resume from '../models/resume.model.js';
import User from '../models/user.model.js';
import { analyzeSkillGap, deduplicateSkills } from '../services/skillGap.service.js';

/**
 * Helper to collect and flatten skills from a resume document
 */
const extractSkillsFromResume = (resumeDoc) => {
  if (!resumeDoc) return [];

  const collected = [];

  // 1. From extractedSkills array (can contain objects or strings)
  if (Array.isArray(resumeDoc.extractedSkills)) {
    for (const item of resumeDoc.extractedSkills) {
      if (typeof item === 'string') collected.push(item);
      else if (item && typeof item === 'object' && item.name) collected.push(item.name);
    }
  }

  // 2. From structuredAnalysis.skills
  if (Array.isArray(resumeDoc.structuredAnalysis?.skills)) {
    collected.push(...resumeDoc.structuredAnalysis.skills);
  }

  // 3. From skillsByCategory Map / object
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
 * @desc Perform skill gap analysis comparing extracted resume skills to target role
 * @route POST /api/skill-gap/analyze or POST /api/v1/skill-gap/analyze
 * @access Public / Optional Auth
 */
export const performAnalysis = async (req, res, next) => {
  try {
    const { resumeId, roleId, targetRole, skills, save = true } = req.body;

    // 1. Retrieve Target Role
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

    // If caller explicitly requested a role that was not found, return 404
    if (isRoleSpecified && !roleDoc) {
      return res.status(404).json({
        success: false,
        message: `Target role not found with identifier '${roleId || targetRole}'.`,
      });
    }

    // Fallback: check authenticated user's target role
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

    // Default fallback to Software Engineer if none specified at all
    if (!roleDoc) {
      roleDoc = await Role.findOne({ name: 'Software Engineer' });
      if (!roleDoc) {
        roleDoc = await Role.findOne();
      }
    }

    if (!roleDoc) {
      return res.status(404).json({
        success: false,
        message: 'Target role not found. Please select a valid target role.',
      });
    }

    // 2. Retrieve Candidate Extracted Skills
    let candidateSkills = [];
    let resumeDoc = null;
    let resumeFileName = 'Candidate Skills Profile';
    const isSkillsExplicitlyPassed = Array.isArray(skills);

    // A) If skills explicitly provided in request body (even if empty)
    if (isSkillsExplicitlyPassed) {
      candidateSkills = deduplicateSkills(skills);
    } else if (resumeId && mongoose.Types.ObjectId.isValid(resumeId)) {
      // B) If resumeId provided, load resume
      resumeDoc = await Resume.findById(resumeId);
      if (resumeDoc) {
        resumeFileName = resumeDoc.fileName || resumeDoc.title || 'Selected Resume';
        candidateSkills = extractSkillsFromResume(resumeDoc);
      }
    } else if (req.user?._id) {
      // C) Check user's most recent uploaded resume
      resumeDoc = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      if (resumeDoc) {
        resumeFileName = resumeDoc.fileName || 'Your Latest Resume';
        candidateSkills = extractSkillsFromResume(resumeDoc);
      } else if (Array.isArray(req.user.skills) && req.user.skills.length > 0) {
        candidateSkills = deduplicateSkills(req.user.skills);
        resumeFileName = 'Candidate Profile Skills';
      }
    } else {
      // D) Check latest resume in system with extracted skills
      resumeDoc = await Resume.findOne({
        $or: [
          { 'extractedSkills.0': { $exists: true } },
          { 'structuredAnalysis.skills.0': { $exists: true } },
        ],
      }).sort({ createdAt: -1 });

      if (resumeDoc) {
        resumeFileName = resumeDoc.fileName || 'Recent Resume';
        candidateSkills = extractSkillsFromResume(resumeDoc);
      }
    }

    // Deduplicate candidate skills
    candidateSkills = deduplicateSkills(candidateSkills);

    // 3. Perform Skill Gap Comparison & Priority Categorization
    const gapResults = analyzeSkillGap(candidateSkills, roleDoc);

    const isMissingResumeData = candidateSkills.length === 0;

    const analysisPayload = {
      userId: req.user?._id || null,
      resumeId: resumeDoc?._id || null,
      resumeFileName,
      roleId: roleDoc._id,
      roleName: roleDoc.name,
      roleCategory: roleDoc.category,
      extractedSkills: gapResults.extractedSkills,
      matchedSkills: gapResults.matchedSkills,
      matchedRequiredSkills: gapResults.matchedRequiredSkills,
      matchedPreferredSkills: gapResults.matchedPreferredSkills,
      missingRequiredSkills: gapResults.missingRequiredSkills,
      missingPreferredSkills: gapResults.missingPreferredSkills,
      skillGaps: gapResults.skillGaps,
      matchPercentage: gapResults.matchPercentage,
      requiredMatchPercentage: gapResults.requiredMatchPercentage,
      preferredMatchPercentage: gapResults.preferredMatchPercentage,
      formulaBreakdown: gapResults.formulaBreakdown,
    };

    // 4. Save results to MongoDB if requested
    let savedRecord = null;
    if (save !== false) {
      savedRecord = await SkillGapAnalysis.create(analysisPayload);
    }

    return res.status(200).json({
      success: true,
      message: 'Skill gap analysis completed successfully',
      data: savedRecord || analysisPayload,
      warning: isMissingResumeData
        ? 'No extracted resume skills found. All role requirements marked as gaps. Upload a resume to evaluate your profile.'
        : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get saved skill gap analyses
 * @route GET /api/skill-gap or GET /api/v1/skill-gap
 * @access Public / Optional Auth
 */
export const getAnalyses = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user?._id) {
      filter.userId = req.user._id;
    }

    const limit = parseInt(req.query.limit, 10) || 20;

    const analyses = await SkillGapAnalysis.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single saved skill gap analysis by ID
 * @route GET /api/skill-gap/:id or GET /api/v1/skill-gap/:id
 * @access Public / Optional Auth
 */
export const getAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid analysis ID format',
      });
    }

    const analysis = await SkillGapAnalysis.findById(id);
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Skill gap analysis not found',
      });
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a saved skill gap analysis
 * @route DELETE /api/skill-gap/:id
 * @access Public / Optional Auth
 */
export const deleteAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid analysis ID format',
      });
    }

    const deleted = await SkillGapAnalysis.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Analysis record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  performAnalysis,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
};
