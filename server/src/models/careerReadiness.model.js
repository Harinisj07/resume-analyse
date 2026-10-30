import mongoose from 'mongoose';

const careerReadinessSchema = new mongoose.Schema(
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
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Target role ID is required'],
      index: true,
    },
    skillGapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillGapAnalysis',
      default: null,
    },
    resumeFileName: {
      type: String,
      default: 'Candidate Resume',
      trim: true,
    },
    roleName: {
      type: String,
      required: [true, 'Target role name is required'],
      trim: true,
    },
    roleCategory: {
      type: String,
      default: 'Engineering',
      trim: true,
    },
    // Overall readiness score (0-100)
    readinessScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    // Qualitative status tier
    readinessTier: {
      type: String,
      enum: [
        'Highly Competitive',
        'Job Ready',
        'Approaching Ready',
        'Developing',
        'Needs Preparation',
      ],
      default: 'Developing',
    },
    // Transparent component breakdown
    scoreBreakdown: {
      coreSkillsScore: { type: Number, default: 0 }, // Out of 60
      preferredSkillsScore: { type: Number, default: 0 }, // Out of 20
      resumeReadinessScore: { type: Number, default: 0 }, // Out of 20
      highPriorityPenalty: { type: Number, default: 0 }, // 0 to 15 deduction
      matchedRequiredCount: { type: Number, default: 0 },
      totalRequiredCount: { type: Number, default: 0 },
      matchedPreferredCount: { type: Number, default: 0 },
      totalPreferredCount: { type: Number, default: 0 },
      atsScore: { type: Number, default: 0 },
    },
    // Specific strengths
    strengths: {
      type: [String],
      default: [],
    },
    // Important skill gaps
    criticalGaps: {
      type: [String],
      default: [],
    },
    // Actionable areas to improve
    areasToImprove: {
      type: [String],
      default: [],
    },
    // Documented formula explanation string
    formulaExplanation: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

careerReadinessSchema.index({ createdAt: -1 });
careerReadinessSchema.index({ userId: 1, createdAt: -1 });

export const CareerReadiness = mongoose.model('CareerReadiness', careerReadinessSchema);
export default CareerReadiness;
