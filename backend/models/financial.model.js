const mongoose = require('mongoose');

const financialSchema = new mongoose.Schema({
  athleteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Athlete',
    required: true
  },
  income: [{
    source: {
      type: String,
      enum: ['salary', 'prize', 'sponsorship', 'endorsement', 'grant', 'scholarship', 'appearance', 'other'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    date: {
      type: Date,
      required: true
    },
    description: String,
    recurring: {
      isRecurring: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'annually']
      },
      endDate: Date
    },
    taxable: {
      type: Boolean,
      default: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'completed'],
      default: 'pending'
    },
    documents: [{
      name: String,
      url: String,
      type: {
        type: String,
        enum: ['contract', 'invoice', 'receipt', 'other']
      }
    }]
  }],
  expenses: [{
    category: {
      type: String,
      enum: ['training', 'equipment', 'travel', 'accommodation', 'nutrition', 'medical', 'coaching', 'competition', 'education', 'other'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    date: {
      type: Date,
      required: true
    },
    description: String,
    recurring: {
      isRecurring: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'annually']
      },
      endDate: Date
    },
    taxDeductible: {
      type: Boolean,
      default: false
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'other']
    },
    receipt: {
      name: String,
      url: String
    }
  }],
  sponsorships: [{
    sponsor: {
      name: String,
      industry: String,
      contactPerson: {
        name: String,
        email: String,
        phone: String
      },
      logo: String
    },
    contractDetails: {
      startDate: Date,
      endDate: Date,
      value: Number,
      currency: {
        type: String,
        default: 'INR'
      },
      paymentSchedule: [{
        dueDate: Date,
        amount: Number,
        status: {
          type: String,
          enum: ['pending', 'paid', 'overdue'],
          default: 'pending'
        }
      }]
    },
    obligations: [{
      type: {
        type: String,
        enum: ['social_media', 'appearance', 'competition', 'advertisement', 'other']
      },
      description: String,
      dueDate: Date,
      completionStatus: {
        type: String,
        enum: ['pending', 'completed', 'missed'],
        default: 'pending'
      }
    }],
    contractDocument: {
      name: String,
      url: String
    },
    notes: String
  }],
  investments: [{
    type: {
      type: String,
      enum: ['stocks', 'mutual_funds', 'fixed_deposit', 'real_estate', 'ppf', 'nps', 'other']
    },
    institution: String,
    accountNumber: String,
    investmentDate: Date,
    initialAmount: Number,
    currentValue: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    maturityDate: Date,
    interestRate: Number,
    documents: [{
      name: String,
      url: String
    }],
    notes: String
  }],
  taxes: [{
    financialYear: String,
    filingStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'filed', 'paid', 'refund_received'],
      default: 'not_started'
    },
    totalIncome: Number,
    taxableIncome: Number,
    taxPaid: Number,
    filingDate: Date,
    dueDate: Date,
    documents: [{
      name: String,
      url: String,
      type: {
        type: String,
        enum: ['return', 'receipt', 'form16', 'other']
      }
    }],
    notes: String
  }],
  insurance: [{
    type: {
      type: String,
      enum: ['health', 'life', 'accident', 'travel', 'property', 'other']
    },
    provider: String,
    policyNumber: String,
    startDate: Date,
    endDate: Date,
    premium: {
      amount: Number,
      frequency: {
        type: String,
        enum: ['monthly', 'quarterly', 'semi-annually', 'annually']
      },
      nextDueDate: Date
    },
    coverageAmount: Number,
    beneficiaries: [{
      name: String,
      relationship: String,
      percentage: Number
    }],
    documents: [{
      name: String,
      url: String
    }]
  }],
  financialGoals: [{
    title: String,
    description: String,
    targetAmount: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    currentAmount: {
      type: Number,
      default: 0
    },
    targetDate: Date,
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
    notes: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
financialSchema.index({ athleteId: 1 });
financialSchema.index({ 'income.date': -1 });
financialSchema.index({ 'expenses.date': -1 });

const Financial = mongoose.model('Financial', financialSchema);

module.exports = Financial;