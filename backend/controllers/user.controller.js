import User from '../models/User.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import path from 'path';
import fs from 'fs';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { username, fullName, bio } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if username is being changed and is already taken
  if (username && username !== user.username) {
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }
    user.username = username;
  }

  if (fullName) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: user.getSafeUser()
  });
});

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Update avatar
// @route   PUT /api/users/avatar
// @access  Private
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Delete old avatar if it exists and is not a default one
  if (user.avatar && !user.avatar.includes('ui-avatars.com')) {
    const oldAvatarPath = path.join(process.cwd(), user.avatar);
    if (fs.existsSync(oldAvatarPath)) {
      fs.unlinkSync(oldAvatarPath);
    }
  }

  // Set new avatar path
  user.avatar = `/uploads/avatars/${req.file.filename}`;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Avatar updated successfully',
    avatar: user.avatar
  });
});

// @desc    Search users
// @route   GET /api/users/search?q=query
// @access  Private
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const users = await User.find({
    _id: { $ne: req.user._id }, // Exclude current user
    $or: [
      { username: { $regex: q, $options: 'i' } },
      { fullName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ]
  })
    .select('username fullName email avatar status lastSeen')
    .limit(20);

  res.status(200).json({
    success: true,
    count: users.length,
    users
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshToken');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    user
  });
});

// @desc    Update user status
// @route   PUT /api/users/status
// @access  Private
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['online', 'offline', 'away', 'busy'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { status, lastSeen: new Date() },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Status updated',
    status: user.status
  });
});

// @desc    Update theme
// @route   PUT /api/users/theme
// @access  Private
export const updateTheme = asyncHandler(async (req, res) => {
  const { theme } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { theme },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Theme updated',
    theme: user.theme
  });
});

// @desc    Update settings
// @route   PUT /api/users/settings
// @access  Private
export const updateSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { settings },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Settings updated',
    settings: user.settings
  });
});
