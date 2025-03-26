const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  athleteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Athlete',
    required: true
  },
  sport: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  sessionType: {
    type: String,
    enum: ['training', 'competition', 'assessment', 'recovery'],
    required: true
  },
  metrics: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    unit: String,
    benchmark: {
      personal: mongoose.Schema.Types.Mixed,
      team: mongoose.Schema.Types.Mixed,
      national: mongoose.Schema.Types.Mixed,
      international: mongoose.Schema.Types.Mixed
    }
  }],
  videoAnalysis: [{
    url: String,
    title: String,
    duration: Number,
    annotations: [{
      timestamp: Number,
      note: String,
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  }],
  notes: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 10
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number,
    windSpeed: Number
  },
  equipment: [{
    name: String,
    details: String
  }],
  skillAssessment: [{
    skill: String,
    rating: {
      type: Number,
      min: 1,
      max: 10
    },
    feedback: String,
    improvementAreas: [String]
  }],
  trainingLoad: {
    external: Number,
    internal: Number,
    acuteLoad: Number,
    chronicLoad: Number,
    acuteChronicRatio: Number
  },
  fatigue: {
    level: {
      type: Number,
      min: 1,
      max: 10
    },
    symptoms: [String]
  },
  tags: [String]
}, {
  timestamps: true
});

// Index for efficient queries
performanceSchema.index({ athleteId: 1, date: -1 });
performanceSchema.index({ sport: 1 });

const Performance = mongoose.model('Performance', performanceSchema);

module.exports = Performance;