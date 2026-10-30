import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Role category is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Role description is required'],
      trim: true,
    },
    requiredSkills: {
      type: [String],
      required: true,
      default: [],
    },
    preferredSkills: {
      type: [String],
      default: [],
    },
    // Configurable market & seniority metadata for platform depth
    marketDemand: {
      type: String,
      enum: ['Very High', 'High', 'Moderate'],
      default: 'High',
    },
    avgSalary: {
      type: String,
      default: '$110,000 - $160,000',
    },
    level: {
      type: String,
      default: 'Mid - Senior',
    },
    icon: {
      type: String,
      default: 'Code',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Search text index for fast keyword matching
roleSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  requiredSkills: 'text',
  preferredSkills: 'text',
});

export const Role = mongoose.model('Role', roleSchema);
export default Role;
