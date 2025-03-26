const mongoose = require('mongoose');

const injurySchema = new mongoose.Schema({
  athleteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Athlete',
    required: true
  },
  injuryType: {
    type: String,
    required: true
  },
  bodyPart: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'severe', 'critical'],
    required: true
  },
  dateOfInjury: {
    type: Date,
    required: true
  },
  diagnosedBy: {
    name: String,
    specialization: String,
    hospital: String,
    contactInfo: String
  },
  symptoms: [String],
  diagnosis: {
    type: String,
    required: true
  },
  treatmentPlan: {
    description: String,
    startDate: Date,
    estimatedRecoveryTime: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
        default: 'days'
      }
    },
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date
    }],
    procedures: [{
      name: String,
      date: Date,
      facility: String,
      notes: String
    }]
  },
  rehabilitationPlan: [{
    phase: {
      type: String,
      enum: ['initial', 'intermediate', 'advanced', 'return-to-play'],
      required: true
    },
    startDate: Date,
    endDate: Date,
    exercises: [{
      name: String,
      sets: Number,
      reps: Number,
      frequency: String,
      notes: String,
      videoReference: String
    }],
    goals: [String],
    restrictions: [String],
    completionStatus: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    }
  }],
  progressNotes: [{
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    painLevel: {
      type: Number,
      min: 0,
      max: 10
    },
    functionalImprovement: {
      type: Number,
      min: 0,
      max: 100
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  returnToPlayAssessment: {
    isCleared: {
      type: Boolean,
      default: false
    },
    clearanceDate: Date,
    clearedBy: {
      name: String,
      role: String
    },
    conditions: [String],
    followUpRequired: Boolean,
    followUpDate: Date
  },
  medicalDocuments: [{
    type: {
      type: String,
      enum: ['report', 'scan', 'prescription', 'other']
    },
    name: String,
    url: String,
    date: Date
  }],
  recurrenceRisk: {
    level: {
      type: String,
      enum: ['low', 'moderate', 'high']
    },
    factors: [String],
    preventionStrategies: [String]
  },
  status: {
    type: String,
    enum: ['active', 'recovering', 'resolved'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for efficient queries
injurySchema.index({ athleteId: 1, dateOfInjury: -1 });
injurySchema.index({ status: 1 });

const Injury = mongoose.model('Injury', injurySchema);

module.exports = Injury;