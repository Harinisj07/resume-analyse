import mongoose from 'mongoose';

const skillGapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
      index: true,
    },
    resumeFileName: {
      type: String,
      default: 'Candidate Resume',
      trim: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Target role ID is required'],
      index: true,
    },
    roleName: {
      type: String,
      required: [true, 'Target role name is required'],
      trim: true,
    },
    roleCategory: {
      type: String,
      default: 'General',
      trim: true,
    },
    // Deduplicated skills extracted from resume
    extractedSkills: {
      type: [String],
      default: [],
    },
    // Skills present in extracted skills that match required or preferred
    matchedSkills: {
      type: [String],
      default: [],
    },
    matchedRequiredSkills: {
      type: [String],
      default: [],
    },
    matchedPreferredSkills: {
      type: [String],
      default: [],
    },
    // Missing required skills
    missingRequiredSkills: {
      type: [String],
      default: [],
    },
    // Missing preferred skills
    missingPreferredSkills: {
      type: [String],
      default: [],
    },
    // Detailed categorized gaps with High, Medium, Low priority
    skillGaps: [
      {
        skill: { type: String, required: true },
        type: { type: String, enum: ['required', 'preferred'], required: true },
        priority: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
        reason: { type: String, default: '' },
      },
    ],
    // Transparent score calculations
    matchPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    requiredMatchPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    preferredMatchPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Transparent calculation breakdown
    formulaBreakdown: {
      totalRequired: { type: Number, default: 0 },
      matchedRequired: { type: Number, default: 0 },
      totalPreferred: { type: Number, default: 0 },
      matchedPreferred: { type: Number, default: 0 },
      calculationFormula: {
        type: String,
        default: '((matchedRequired * 2 + matchedPreferred) / (totalRequired * 2 + totalPreferred)) * 100',
      },
    },
  },
  {
    timestamps: true,
  }
);

skillGapSchema.index({ createdAt: -1 });
skillGapSchema.index({ userId: 1, createdAt: -1 });

export const SkillGapAnalysis = mongoose.model('SkillGapAnalysis', skillGapSchema);
export default SkillGapAnalysis;
