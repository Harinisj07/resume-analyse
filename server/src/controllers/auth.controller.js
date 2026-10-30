import User from '../models/user.model.js';
import authService from '../services/auth.service.js';

/**
 * @desc Register a new user
 * @route POST /api/auth/register or POST /api/v1/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, targetRole, skills, role, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long',
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Format skills array if string
    let formattedSkills = [];
    if (Array.isArray(skills)) {
      formattedSkills = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === 'string' && skills.trim()) {
      formattedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      targetRole: targetRole ? targetRole.trim() : 'Full Stack Software Engineer',
      skills: formattedSkills,
      role: role || 'candidate',
      bio: bio ? bio.trim() : '',
    });

    const token = authService.generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          targetRole: user.targetRole,
          skills: user.skills,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login or POST /api/v1/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = authService.generateToken({ id: user._id, role: user.role });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          targetRole: user.targetRole,
          skills: user.skills,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get current user profile
 * @route GET /api/auth/me or GET /api/v1/auth/me
 * @access Protected
 */
export const getMe = async (req, res, next) => {
  try {
    if (req.user) {
      return res.status(200).json({
        success: true,
        data: req.user,
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Unauthorized',
    });
  }
};

/**
 * @desc Update user profile
 * @route PUT /api/auth/profile or PUT /api/v1/auth/profile
 * @access Protected
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { name, targetRole, skills, bio, role } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (targetRole !== undefined) updates.targetRole = targetRole.trim();
    if (skills !== undefined) {
      updates.skills = Array.isArray(skills)
        ? skills.map((s) => String(s).trim()).filter(Boolean)
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }
    if (bio !== undefined) updates.bio = bio.trim();
    if (role && ['candidate', 'recruiter', 'admin'].includes(role)) updates.role = role;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

