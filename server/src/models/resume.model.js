import mongoose from 'mongoose';

/**
 * Resume Schema
 * Required Fields:
 * - userId: User identifier (ObjectId ref to User, optional for guest sessions)
 * - fileName: Original document name
 * - filePath: Secure filesystem path on server (not publicly accessible)
 * - fileType: MIME type or extension (PDF, DOCX)
 * - extractedText: Parsed raw text content
 * - analysisStatus: Enum ['uploaded', 'processing', 'completed', 'failed']
 * - createdAt, updatedAt: Managed via timestamps
 */
const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    analysisStatus: {
      type: String,
      enum: ['uploaded', 'processing', 'completed', 'failed'],
      default: 'uploaded',
      index: true,
    },
    // Metadata fields
    fileSize: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      default: 'My Resume',
      trim: true,
    },
    targetRole: {
      type: String,
      default: 'Full Stack Software Engineer',
    },
    targetJobDescription: {
      type: String,
      default: '',
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    scoreBreakdown: {
      contactScore: { type: Number, default: 0 },
      structureScore: { type: Number, default: 0 },
      impactScore: { type: Number, default: 0 },
      relevanceScore: { type: Number, default: 0 },
      formatScore: { type: Number, default: 0 },
    },
    contactInfo: {
      name: { type: String, default: null },
      email: { type: String, default: null },
      phone: { type: String, default: null },
      linkedin: { type: String, default: null },
      github: { type: String, default: null },
      portfolio: { type: String, default: null },
    },
    detectedSections: {
      summary: { type: Boolean, default: false },
      experience: { type: Boolean, default: false },
      education: { type: Boolean, default: false },
      skills: { type: Boolean, default: false },
      projects: { type: Boolean, default: false },
      certifications: { type: Boolean, default: false },
    },
    extractedSkills: [
      {
        name: String,
        category: String,
        confidence: Number,
      },
    ],
    skillsByCategory: {
      type: Map,
      of: [String],
      default: {},
    },
    missingSkills: [String],
    jobMatch: {
      matchPercentage: { type: Number, default: 0 },
      matchedSkills: [String],
      missingCriticalSkills: [String],
      recommendedKeywords: [String],
    },
    strengths: [String],
    improvements: [String],
    metricsCount: { type: Number, default: 0 },
    actionVerbsCount: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
    analysisMetadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Structured NLP Analysis Output from FastAPI AI Service
    structuredAnalysis: {
      skills: { type: [String], default: [] },
      programmingLanguages: { type: [String], default: [] },
      frameworks: { type: [String], default: [] },
      databases: { type: [String], default: [] },
      cloudTechnologies: { type: [String], default: [] },
      devopsTools: { type: [String], default: [] },
      certifications: { type: [mongoose.Schema.Types.Mixed], default: [] },
      education: { type: [mongoose.Schema.Types.Mixed], default: [] },
      projects: { type: [mongoose.Schema.Types.Mixed], default: [] },
      experience: { type: [mongoose.Schema.Types.Mixed], default: [] },
      softSkills: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
resumeSchema.index({ createdAt: -1 });
resumeSchema.index({ userId: 1, createdAt: -1 });

export const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
