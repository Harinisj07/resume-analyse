import Role from '../models/role.model.js';
import mongoose from 'mongoose';

/**
 * @desc Get all roles with search, category filter, and sorting
 * @route GET /api/roles or GET /api/v1/roles
 * @access Public
 */
export const getRoles = async (req, res, next) => {
  try {
    const { search, category, skill, sort = 'name' } = req.query;

    const query = {};

    // Filter by Category
    if (category && category !== 'All' && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // Filter by Specific Skill
    if (skill) {
      query.$or = [
        { requiredSkills: { $regex: new RegExp(skill.trim(), 'i') } },
        { preferredSkills: { $regex: new RegExp(skill.trim(), 'i') } },
      ];
    }

    // Search query across name, description, category, and skills
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { requiredSkills: { $in: [searchRegex] } },
        { preferredSkills: { $in: [searchRegex] } },
      ];
    }

    // Sorting options
    let sortOptions = { name: 1 };
    if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'demand') {
      sortOptions = { marketDemand: -1, name: 1 };
    } else if (sort === 'category') {
      sortOptions = { category: 1, name: 1 };
    }

    const roles = await Role.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single role by ID or canonical name
 * @route GET /api/roles/:id or GET /api/v1/roles/:id
 * @access Public
 */
export const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let role = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      role = await Role.findById(id);
    }

    // Fallback: search by exact name if not a valid ObjectId or not found
    if (!role) {
      role = await Role.findOne({
        name: { $regex: new RegExp(`^${decodeURIComponent(id).trim()}$`, 'i') },
      });
    }

    if (!role) {
      return res.status(404).json({
        success: false,
        message: `Role not found with identifier '${id}'`,
      });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get available role categories for filtering
 * @route GET /api/roles/categories
 * @access Public
 */
export const getRoleCategories = async (req, res, next) => {
  try {
    const categories = await Role.distinct('category');
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getRoles,
  getRoleById,
  getRoleCategories,
};
