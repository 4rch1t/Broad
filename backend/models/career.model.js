const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  athleteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Athlete',
    required: true
  },
  currentStatus: {
    type: String,
    enum: ['amateur', 'semi-professional', 'professional', 'elite', 'retired', 'injured'],
    required: true
  },
  careerGoals: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    targetDate: Date,
    category: {
      type: String,
      enum: ['performance', 'skill', 'competition', 'education', 'financial', 'personal'],
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'achieved', 'abandoned'],
      default: 'not_started'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    milestones: [{
      title: String,
      targetDate: Date,
      isCompleted: {
        type: Boolean,
        default: false
      },
      completionDate: Date
    }]
  }],
  skillAssessments: [{
    skill: {
      type: String,
      required: true
    },
    category: String,
    currentLevel: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    targetLevel: {
      type: Number,
      min: 1,
      max: 10
    },
    assessmentDate: {
      type: Date,
      default: Date.now
    },
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    developmentPlan: {
      exercises: [String],
      resources: [String],
      timeframe: String
    }
  }],
  competitions: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['district', 'state', 'national', 'international', 'olympic', 'other'],
      required: true
    },
    location: String,
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    registrationDeadline: Date,
    registrationStatus: {
      type: String,
      enum: ['not_registered', 'registered', 'confirmed', 'cancelled'],
      default: 'not_registered'
    },
    result: {
      position: String,
      performance: mongoose.Schema.Types.Mixed,
      notes: String
    },
    documents: [{
      name: String,
      url: String,
      type: {
        type: String,
        enum: ['registration', 'invitation', 'result', 'certificate', 'other']
      }
    }]
  }],
  trainingPrograms: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startDate: Date,
    endDate: Date,
    frequency: String,
    focus: [String],
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'cancelled'],
      default: 'upcoming'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    notes: String
  }],
  mentors: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    expertise: [String],
    relationship: {
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
      }
    },
    meetingFrequency: String,
    notes: String
  }],
  educationPlans: [{
    course: {
      type: String,
      required: true
    },
    institution: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['planned', 'applied', 'enrolled', 'completed', 'dropped'],
      default: 'planned'
    },
    relevance: String,
    certificate: {
      name: String,
      url: String,
      issueDate: Date
    }
  }],
  opportunities: [{
    type: {
      type: String,
      enum: ['scholarship', 'sponsorship', 'team_selection', 'training_camp', 'job', 'other'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    organization: String,
    description: String,
    applicationDeadline: Date,
    applicationStatus: {
      type: String,
      enum: ['not_applied', 'applied', 'shortlisted', 'accepted', 'rejected', 'expired'],
      default: 'not_applied'
    },
    applicationDate: Date,
    documents: [{
      name: String,
      url: String
    }],
    notes: String
  }],
  careerTransition: {
    isPlanning: {
      type: Boolean,
      default: false
    },
    targetProfession: String,
    requiredSkills: [String],
    requiredQualifications: [String],
    timeline: String,
    mentors: [String],
    notes: String
  },
  recommendedPathways: [{
    title: String,
    description: String,
    steps: [{
      order: Number,
      description: String,
      timeframe: String,
      resources: [String],
      isCompleted: {
        type: Boolean,
        default: false
      }
    }],
    generatedDate: {
      type: Date,
      default: Date.now
    },
    generatedBy: {
      type: String,
      enum: ['system', 'coach', 'admin'],
      default: 'system'
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
careerSchema.index({ athleteId: 1 });
careerSchema.index({ 'competitions.startDate': -1 });
careerSchema.index({ 'skillAssessments.assessmentDate': -1 });

const Career = mongoose.model('Career', careerSchema);

module.exports = Career;