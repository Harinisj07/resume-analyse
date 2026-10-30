import User from '../models/user.model.js';
import Role from '../models/role.model.js';
import mongoose from 'mongoose';

/**
 * @desc Update candidate target role
 * @route PUT /api/users/target-role or PUT /api/v1/users/target-role
 * @access Optional / Protected (supports both logged-in and guest candidates)
 */
export const updateTargetRole = async (req, res, next) => {
  try {
    const { roleId, targetRole, roleName } = req.body;

    const requestedIdentifier = roleId || targetRole || roleName;
    if (!requestedIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roleId or targetRole to set your career objective',
      });
    }

    // Lookup role document in MongoDB
    let roleDoc = null;
    if (mongoose.Types.ObjectId.isValid(requestedIdentifier)) {
      roleDoc = await Role.findById(requestedIdentifier);
    }

    if (!roleDoc && typeof requestedIdentifier === 'string') {
      roleDoc = await Role.findOne({
        name: { $regex: new RegExp(`^${requestedIdentifier.trim()}$`, 'i') },
      });
    }

    const resolvedRoleName = roleDoc ? roleDoc.name : targetRole || roleName;
    const resolvedRoleId = roleDoc ? roleDoc._id : null;

    let updatedUser = null;

    // If user is authenticated, update record in MongoDB
    if (req.user) {
      const userId = req.user.id || req.user._id;
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          targetRole: resolvedRoleName,
          targetRoleId: resolvedRoleId,
        },
        { new: true, runValidators: true }
      ).select('-password');
    }

    return res.status(200).json({
      success: true,
      message: `Target role successfully updated to ${resolvedRoleName}`,
      data: {
        targetRole: resolvedRoleName,
        targetRoleId: resolvedRoleId,
        role: roleDoc,
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get user's current target role
 * @route GET /api/users/target-role or GET /api/v1/users/target-role
 * @access Optional / Protected
 */
export const getTargetRole = async (req, res, next) => {
  try {
    if (req.user && req.user.targetRoleId) {
      const role = await Role.findById(req.user.targetRoleId);
      if (role) {
        return res.status(200).json({
          success: true,
          data: {
            targetRole: role.name,
            role,
          },
        });
      }
    }

    const fallbackRoleName = req.user?.targetRole || 'Full Stack Software Engineer';
    const role = await Role.findOne({
      name: { $regex: new RegExp(`^${fallbackRoleName}$`, 'i') },
    });

    return res.status(200).json({
      success: true,
      data: {
        targetRole: fallbackRoleName,
        role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  updateTargetRole,
  getTargetRole,
};
