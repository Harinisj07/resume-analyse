import mongoose from 'mongoose';
import Roadmap from '../models/roadmap.model.js';
import Role from '../models/role.model.js';
import Resume from '../models/resume.model.js';
import SkillGapAnalysis from '../models/skillGapAnalysis.model.js';
import CareerReadiness from '../models/careerReadiness.model.js';
import {
  generatePersonalizedRoadmap,
  recalculateProgress,
} from '../services/roadmap.service.js';

/**
 * @desc Generate personalized learning roadmap based on resume, target role, skill gaps, and readiness score
 * @route POST /api/roadmap/generate or POST /api/v1/roadmap/generate
 * @access Public / Authenticated
 */
export const generateRoadmap = async (req, res, next) => {
  try {
    const { resumeId, roleId, targetRole, save = true } = req.body;

    // 1. Resolve Target Role
    let roleDoc = null;
    if (roleId && mongoose.Types.ObjectId.isValid(roleId)) {
      roleDoc = await Role.findById(roleId);
    }

    if (!roleDoc && targetRole && typeof targetRole === 'string') {
      roleDoc = await Role.findOne({
        name: { $regex: new RegExp(`^${targetRole.trim()}$`, 'i') },
      });
    }

    // Fallback to user's saved target role
    if (!roleDoc && req.user?.targetRoleId) {
      roleDoc = await Role.findById(req.user.targetRoleId);
    }
    if (!roleDoc && req.user?.targetRole) {
      roleDoc = await Role.findOne({
        name: { $regex: new RegExp(`^${req.user.targetRole.trim()}$`, 'i') },
      });
    }

    // Fallback: Default to first active role in database
    if (!roleDoc) {
      roleDoc = await Role.findOne().sort({ createdAt: 1 });
    }

    if (!roleDoc) {
      return res.status(404).json({
        success: false,
        code: 'ROLE_NOT_FOUND',
        message: 'No target role found. Please specify a target role or ensure predefined roles exist.',
      });
    }

    // 2. Resolve Candidate Resume
    let resumeDoc = null;
    if (resumeId && mongoose.Types.ObjectId.isValid(resumeId)) {
      resumeDoc = await Resume.findById(resumeId);
    }

    if (!resumeDoc && req.user?._id) {
      resumeDoc = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    // Fallback: Latest uploaded resume
    if (!resumeDoc) {
      resumeDoc = await Resume.findOne().sort({ createdAt: -1 });
    }

    // 3. Retrieve or match existing Skill Gap Analysis
    let skillGapDoc = null;
    if (resumeDoc) {
      skillGapDoc = await SkillGapAnalysis.findOne({
        resumeId: resumeDoc._id,
        roleId: roleDoc._id,
      }).sort({ createdAt: -1 });
    }

    // 4. Retrieve or match existing Career Readiness assessment
    let readinessDoc = null;
    if (resumeDoc) {
      readinessDoc = await CareerReadiness.findOne({
        resumeId: resumeDoc._id,
        roleId: roleDoc._id,
      }).sort({ createdAt: -1 });
    }

    // 5. Generate Roadmap data through service
    const roadmapData = await generatePersonalizedRoadmap({
      resumeDoc,
      roleDoc,
      skillGapDoc,
      readinessDoc,
      userId: req.user?._id || null,
    });

    let savedRoadmap = null;
    if (save !== false) {
      savedRoadmap = await Roadmap.create(roadmapData);
    }

    res.status(201).json({
      success: true,
      message: 'Personalized learning roadmap generated successfully.',
      data: savedRoadmap || roadmapData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get list of saved roadmaps
 * @route GET /api/roadmap or GET /api/v1/roadmap
 * @access Public / Authenticated
 */
export const getRoadmaps = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user?._id) {
      filter.userId = req.user._id;
    }
    if (req.query.roleId && mongoose.Types.ObjectId.isValid(req.query.roleId)) {
      filter.roleId = req.query.roleId;
    }
    if (req.query.resumeId && mongoose.Types.ObjectId.isValid(req.query.resumeId)) {
      filter.resumeId = req.query.resumeId;
    }

    const roadmaps = await Roadmap.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: roadmaps.length,
      data: roadmaps,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single roadmap by ID
 * @route GET /api/roadmap/:id or GET /api/v1/roadmap/:id
 * @access Public / Authenticated
 */
export const getRoadmapById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_ID',
        message: 'Invalid roadmap ID format.',
      });
    }

    const roadmap = await Roadmap.findById(id);
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        code: 'ROADMAP_NOT_FOUND',
        message: 'Learning roadmap not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update task status (Not Started, In Progress, Completed) and recalculate overall progress
 * @route PATCH /api/roadmap/:id/tasks/:taskId or PUT /api/roadmap/:id/tasks/:taskId
 * @access Public / Authenticated
 */
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { id, taskId } = req.params;
    const { status } = req.body;

    const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed'];
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_STATUS',
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_ID',
        message: 'Invalid roadmap ID format.',
      });
    }

    const roadmap = await Roadmap.findById(id);
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        code: 'ROADMAP_NOT_FOUND',
        message: 'Learning roadmap not found.',
      });
    }

    // Locate task across all stages
    let foundTask = null;
    for (const stage of roadmap.stages) {
      for (const skillTask of stage.skills) {
        if (skillTask.id === taskId || skillTask._id?.toString() === taskId) {
          foundTask = skillTask;
          break;
        }
      }
      if (foundTask) break;
    }

    if (!foundTask) {
      return res.status(404).json({
        success: false,
        code: 'TASK_NOT_FOUND',
        message: `Task with ID "${taskId}" not found in this roadmap.`,
      });
    }

    // Update status and timestamp
    foundTask.status = status;
    if (status === 'Completed') {
      foundTask.completedAt = new Date();
    } else {
      foundTask.completedAt = null;
    }

    // Recalculate progress counters
    const progressMetrics = recalculateProgress(roadmap.stages);
    roadmap.totalTasks = progressMetrics.totalTasks;
    roadmap.completedTasks = progressMetrics.completedTasks;
    roadmap.inProgressTasks = progressMetrics.inProgressTasks;
    roadmap.overallProgress = progressMetrics.overallProgress;

    await roadmap.save();

    res.status(200).json({
      success: true,
      message: `Task status updated to "${status}". Overall progress is now ${roadmap.overallProgress}%.`,
      data: roadmap,
      updatedTask: foundTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a saved roadmap
 * @route DELETE /api/roadmap/:id or DELETE /api/v1/roadmap/:id
 * @access Public / Authenticated
 */
export const deleteRoadmap = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_ID',
        message: 'Invalid roadmap ID format.',
      });
    }

    const roadmap = await Roadmap.findByIdAndDelete(id);
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        code: 'ROADMAP_NOT_FOUND',
        message: 'Learning roadmap not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Learning roadmap deleted successfully.',
      id,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  generateRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateTaskStatus,
  deleteRoadmap,
};
