const mongoose = require('mongoose');

const athleteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  sports: [{
    type: String,
    required: true
  }],
  primarySport: {
    type: String,
    required: true
  },
  height: {
    value: Number,
    unit: {
      type: String,
      enum: ['cm', 'ft'],
      default: 'cm'
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'lb'],
      default: 'kg'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  achievements: [{
    title: String,
    date: Date,
    description: String,
    level: {
      type: String,
      enum: ['district', 'state', 'national', 'international']
    },
    position: String,
    verificationDocument: String
  }],
  currentTeam: {
    name: String,
    joinedDate: Date,
    role: String
  },
  coaches: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    startDate: Date,
    endDate: Date
  }],
  educationalBackground: [{
    institution: String,
    degree: String,
    field: String,
    startYear: Number,
    endYear: Number,
    isCompleted: Boolean
  }],
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    email: String
  }],
  documents: [{
    type: {
      type: String,
      enum: ['idProof', 'certificate', 'medicalRecord', 'contract', 'other']
    },
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date
  }],
  socialMedia: {
    instagram: String,
    twitter: String,
    facebook: String,
    youtube: String,
    linkedin: String
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    url: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

const Athlete = mongoose.model('Athlete', athleteSchema);

module.exports = Athlete;