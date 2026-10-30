import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    platform: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, default: 'documentation' },
    verified: { type: Boolean, default: true },
  },
  { _id: false }
);

const projectTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const skillTaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    skillName: { type: String, required: true },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      required: true,
      index: true,
    },
    stage: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
      default: 'Beginner',
    },
    learningObjectives: {
      type: [String],
      default: [],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    practicalExercises: {
      type: [String],
      default: [],
    },
    estimatedTime: {
      type: String,
      default: '8-10 hours',
    },
    projectTask: {
      type: projectTaskSchema,
      required: true,
    },
    resources: {
      type: [resourceSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const stageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    stageNumber: { type: Number, required: true },
    stageName: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    estimatedWeeks: { type: String, default: '2-4 weeks' },
    skills: {
      type: [skillTaskSchema],
      default: [],
    },
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
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
      default: null,
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
    targetRole: {
      type: String,
      trim: true,
    },
    readinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    readinessTier: {
      type: String,
      default: 'Developing',
    },
    skillGapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillGapAnalysis',
      default: null,
    },
    careerReadinessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerReadiness',
      default: null,
    },
    // Stages: Beginner, Intermediate, Advanced
    stages: {
      type: [stageSchema],
      default: [],
    },
    // Overall Progress Counters
    totalTasks: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    inProgressTasks: {
      type: Number,
      default: 0,
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Summary Metrics
    summary: {
      totalSkillsCount: { type: Number, default: 0 },
      highPriorityCount: { type: Number, default: 0 },
      mediumPriorityCount: { type: Number, default: 0 },
      lowPriorityCount: { type: Number, default: 0 },
      estimatedTotalWeeks: { type: String, default: '6-12 weeks' },
    },
  },
  {
    timestamps: true,
  }
);

roadmapSchema.index({ createdAt: -1 });
roadmapSchema.index({ userId: 1, createdAt: -1 });
roadmapSchema.index({ resumeId: 1, roleId: 1 });

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;
