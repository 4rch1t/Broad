const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Validate request body against schema
 * @param {Object} schema - Joi schema
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      logger.debug('Validation error:', error.details);
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }
    next();
  };
};

/**
 * Registration validation schema
 */
const registrationSchema = Joi.object({
  firstName: Joi.string().required().trim().min(2).max(50),
  lastName: Joi.string().required().trim().min(2).max(50),
  email: Joi.string().required().email().trim().lowercase(),
  password: Joi.string().required().min(8).max(30).pattern(
    new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$')
  ).message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  phone: Joi.string().allow('').trim(),
  role: Joi.string().valid('athlete', 'coach', 'admin', 'organization', 'scout', 'physiotherapist', 'nutritionist'),
  preferredLanguage: Joi.string().valid('english', 'hindi', 'tamil', 'telugu', 'bengali', 'marathi', 'gujarati', 'kannada', 'malayalam', 'punjabi')
});

/**
 * Login validation schema
 */
const loginSchema = Joi.object({
  email: Joi.string().required().email().trim().lowercase(),
  password: Joi.string().required()
});

/**
 * Athlete profile validation schema
 */
const athleteProfileSchema = Joi.object({
  dateOfBirth: Joi.date().required(),
  gender: Joi.string().required().valid('male', 'female', 'other'),
  sports: Joi.array().items(Joi.string()).required(),
  primarySport: Joi.string().required(),
  height: Joi.object({
    value: Joi.number().required(),
    unit: Joi.string().valid('cm', 'ft').default('cm')
  }),
  weight: Joi.object({
    value: Joi.number().required(),
    unit: Joi.string().valid('kg', 'lb').default('kg')
  }),
  address: Joi.object({
    street: Joi.string().allow(''),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().allow(''),
    country: Joi.string().default('India')
  }),
  bio: Joi.string().max(1000),
  emergencyContacts: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().email().allow('')
    })
  ),
  socialMedia: Joi.object({
    instagram: Joi.string().allow(''),
    twitter: Joi.string().allow(''),
    facebook: Joi.string().allow(''),
    youtube: Joi.string().allow(''),
    linkedin: Joi.string().allow('')
  })
});

/**
 * Performance entry validation schema
 */
const performanceEntrySchema = Joi.object({
  athleteId: Joi.string().required(),
  sport: Joi.string().required(),
  date: Joi.date().default(Date.now),
  sessionType: Joi.string().required().valid('training', 'competition', 'assessment', 'recovery'),
  metrics: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      value: Joi.required(),
      unit: Joi.string().allow(''),
      benchmark: Joi.object({
        personal: Joi.any(),
        team: Joi.any(),
        national: Joi.any(),
        international: Joi.any()
      })
    })
  ),
  notes: Joi.string().allow(''),
  rating: Joi.number().min(1).max(10),
  coach: Joi.string().allow(''),
  location: Joi.object({
    name: Joi.string().allow(''),
    coordinates: Joi.object({
      latitude: Joi.number(),
      longitude: Joi.number()
    })
  }),
  weather: Joi.object({
    condition: Joi.string().allow(''),
    temperature: Joi.number(),
    humidity: Joi.number(),
    windSpeed: Joi.number()
  }),
  equipment: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      details: Joi.string().allow('')
    })
  ),
  skillAssessment: Joi.array().items(
    Joi.object({
      skill: Joi.string().required(),
      rating: Joi.number().min(1).max(10).required(),
      feedback: Joi.string().allow(''),
      improvementAreas: Joi.array().items(Joi.string())
    })
  ),
  trainingLoad: Joi.object({
    external: Joi.number(),
    internal: Joi.number(),
    acuteLoad: Joi.number(),
    chronicLoad: Joi.number(),
    acuteChronicRatio: Joi.number()
  }),
  fatigue: Joi.object({
    level: Joi.number().min(1).max(10),
    symptoms: Joi.array().items(Joi.string())
  }),
  tags: Joi.array().items(Joi.string())
});

/**
 * Injury record validation schema
 */
const injuryRecordSchema = Joi.object({
  athleteId: Joi.string().required(),
  injuryType: Joi.string().required(),
  bodyPart: Joi.string().required(),
  severity: Joi.string().required().valid('minor', 'moderate', 'severe', 'critical'),
  dateOfInjury: Joi.date().required(),
  diagnosedBy: Joi.object({
    name: Joi.string().required(),
    specialization: Joi.string().allow(''),
    hospital: Joi.string().allow(''),
    contactInfo: Joi.string().allow('')
  }),
  symptoms: Joi.array().items(Joi.string()),
  diagnosis: Joi.string().required(),
  treatmentPlan: Joi.object({
    description: Joi.string().required(),
    startDate: Joi.date(),
    estimatedRecoveryTime: Joi.object({
      value: Joi.number().required(),
      unit: Joi.string().valid('days', 'weeks', 'months').default('days')
    }),
    medications: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        dosage: Joi.string().required(),
        frequency: Joi.string().required(),
        startDate: Joi.date(),
        endDate: Joi.date()
      })
    ),
    procedures: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        date: Joi.date(),
        facility: Joi.string().allow(''),
        notes: Joi.string().allow('')
      })
    )
  })
});

/**
 * Financial record validation schema
 */
const financialRecordSchema = Joi.object({
  athleteId: Joi.string().required(),
  type: Joi.string().required().valid('income', 'expense'),
  source: Joi.string().when('type', {
    is: 'income',
    then: Joi.string().required().valid('salary', 'prize', 'sponsorship', 'endorsement', 'grant', 'scholarship', 'appearance', 'other'),
    otherwise: Joi.string().optional()
  }),
  category: Joi.string().when('type', {
    is: 'expense',
    then: Joi.string().required().valid('training', 'equipment', 'travel', 'accommodation', 'nutrition', 'medical', 'coaching', 'competition', 'education', 'other'),
    otherwise: Joi.string().optional()
  }),
  amount: Joi.number().required().positive(),
  currency: Joi.string().default('INR'),
  date: Joi.date().required(),
  description: Joi.string().allow(''),
  recurring: Joi.object({
    isRecurring: Joi.boolean().default(false),
    frequency: Joi.string().valid('weekly', 'monthly', 'quarterly', 'annually'),
    endDate: Joi.date()
  }),
  taxable: Joi.boolean(),
  taxDeductible: Joi.boolean(),
  paymentMethod: Joi.string().valid('cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'other'),
  paymentStatus: Joi.string().valid('pending', 'partial', 'completed')
});

/**
 * Career record validation schema
 */
const careerRecordSchema = Joi.object({
  athleteId: Joi.string().required(),
  currentStatus: Joi.string().valid('amateur', 'semi-professional', 'professional', 'elite', 'retired', 'injured'),
  careerGoal: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    targetDate: Joi.date(),
    category: Joi.string().required().valid('performance', 'skill', 'competition', 'education', 'financial', 'personal'),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    milestones: Joi.array().items(
      Joi.object({
        title: Joi.string().required(),
        targetDate: Joi.date(),
        isCompleted: Joi.boolean().default(false)
      })
    )
  })
});

// Export validation middlewares
exports.validateRegistration = validateRequest(registrationSchema);
exports.validateLogin = validateRequest(loginSchema);
exports.validateAthleteProfile = validateRequest(athleteProfileSchema);
exports.validatePerformanceEntry = validateRequest(performanceEntrySchema);
exports.validateInjuryRecord = validateRequest(injuryRecordSchema);
exports.validateFinancialRecord = validateRequest(financialRecordSchema);
exports.validateCareerRecord = validateRequest(careerRecordSchema);