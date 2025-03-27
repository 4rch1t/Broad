const Financial = require('../models/financial.model');
const Athlete = require('../models/athlete.model');
const logger = require('../utils/logger');

// Get financial profile for an athlete
exports.getAthleteFinancials = async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, their financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view financial information for this athlete'
      });
    }
    
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { financial }
    });
  } catch (error) {
    logger.error(`Error fetching financial profile for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch financial profile'
    });
  }
};

// Create or update financial profile
exports.createOrUpdateFinancialProfile = async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, their financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to manage financial information for this athlete'
      });
    }
    
    // Check if financial profile already exists
    let financial = await Financial.findOne({ athlete: athleteId });
    
    if (financial) {
      // Update existing profile
      financial = await Financial.findOneAndUpdate(
        { athlete: athleteId },
        req.body,
        { new: true, runValidators: true }
      );
      
      res.status(200).json({
        status: 'success',
        data: { financial }
      });
    } else {
      // Create new profile
      financial = await Financial.create({
        athlete: athleteId,
        ...req.body
      });
      
      res.status(201).json({
        status: 'success',
        data: { financial }
      });
    }
  } catch (error) {
    logger.error(`Error creating/updating financial profile for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create/update financial profile'
    });
  }
};

// Add income record
exports.addIncomeRecord = async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, their financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add income records for this athlete'
      });
    }
    
    // Get financial profile or create if it doesn't exist
    let financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      financial = await Financial.create({
        athlete: athleteId,
        income: []
      });
    }
    
    const newIncome = {
      ...req.body,
      recordedBy: req.user.id,
      recordedAt: Date.now()
    };
    
    financial.income.push(newIncome);
    await financial.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        income: financial.income[financial.income.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding income record for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add income record'
    });
  }
};

// Update income record
exports.updateIncomeRecord = async (req, res) => {
  try {
    const { athleteId, incomeId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get financial profile
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    // Find income index
    const incomeIndex = financial.income.findIndex(
      income => income._id.toString() === incomeId
    );
    
    if (incomeIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Income record not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, person who recorded it, financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      financial.income[incomeIndex].recordedBy.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this income record'
      });
    }
    
    // Update income record
    financial.income[incomeIndex] = {
      ...financial.income[incomeIndex].toObject(),
      ...req.body,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    };
    
    await financial.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        income: financial.income[incomeIndex]
      }
    });
  } catch (error) {
    logger.error(`Error updating income record for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update income record'
    });
  }
};

// Delete income record
exports.deleteIncomeRecord = async (req, res) => {
  try {
    const { athleteId, incomeId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get financial profile
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    // Find income index
    const incomeIndex = financial.income.findIndex(
      income => income._id.toString() === incomeId
    );
    
    if (incomeIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Income record not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, person who recorded it, financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      financial.income[incomeIndex].recordedBy.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this income record'
      });
    }
    
    // Remove income record
    financial.income.splice(incomeIndex, 1);
    await financial.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Income record deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting income record for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete income record'
    });
  }
};

// Add expense record
exports.addExpenseRecord = async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, their financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add expense records for this athlete'
      });
    }
    
    // Get financial profile or create if it doesn't exist
    let financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      financial = await Financial.create({
        athlete: athleteId,
        expenses: []
      });
    }
    
    const newExpense = {
      ...req.body,
      recordedBy: req.user.id,
      recordedAt: Date.now()
    };
    
    financial.expenses.push(newExpense);
    await financial.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        expense: financial.expenses[financial.expenses.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding expense record for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add expense record'
    });
  }
};

// Update expense record
exports.updateExpenseRecord = async (req, res) => {
  try {
    const { athleteId, expenseId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get financial profile
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    // Find expense index
    const expenseIndex = financial.expenses.findIndex(
      expense => expense._id.toString() === expenseId
    );
    
    if (expenseIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Expense record not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, person who recorded it, financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      financial.expenses[expenseIndex].recordedBy.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this expense record'
      });
    }
    
    // Update expense record
    financial.expenses[expenseIndex] = {
      ...financial.expenses[expenseIndex].toObject(),
      ...req.body,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    };
    
    await financial.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        expense: financial.expenses[expenseIndex]
      }
    });
  } catch (error) {
    logger.error(`Error updating expense record for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update expense record'
    });
  }
};

// Delete expense record
exports.deleteExpenseRecord = async (req, res) => {
  try {
    const { athleteId, expenseId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get financial profile
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    // Find expense index
    const expenseIndex = financial.expenses.findIndex(
      expense => expense._id.toString() === expenseId
    );
    
    if (expenseIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Expense record not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, person who recorded it, financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      financial.expenses[expenseIndex].recordedBy.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this expense record'
      });
    }
    
    // Remove expense record
    financial.expenses.splice(expenseIndex, 1);
    await financial.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Expense record deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting expense record for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete expense record'
    });
  }
};

// Add sponsorship
exports.addSponsorship = async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, their financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add sponsorships for this athlete'
      });
    }
    
    // Get financial profile or create if it doesn't exist
    let financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      financial = await Financial.create({
        athlete: athleteId,
        sponsorships: []
      });
    }
    
    const newSponsorship = {
      ...req.body,
      recordedBy: req.user.id,
      recordedAt: Date.now()
    };
    
    financial.sponsorships.push(newSponsorship);
    await financial.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        sponsorship: financial.sponsorships[financial.sponsorships.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding sponsorship for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add sponsorship'
    });
  }
};

// Update sponsorship
exports.updateSponsorship = async (req, res) => {
  try {
    const { athleteId, sponsorshipId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get financial profile
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    // Find sponsorship index
    const sponsorshipIndex = financial.sponsorships.findIndex(
      sponsorship => sponsorship._id.toString() === sponsorshipId
    );
    
    if (sponsorshipIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Sponsorship not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, person who recorded it, financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      financial.sponsorships[sponsorshipIndex].recordedBy.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this sponsorship'
      });
    }
    
    // Update sponsorship
    financial.sponsorships[sponsorshipIndex] = {
      ...financial.sponsorships[sponsorshipIndex].toObject(),
      ...req.body,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    };
    
    await financial.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        sponsorship: financial.sponsorships[sponsorshipIndex]
      }
    });
  } catch (error) {
    logger.error(`Error updating sponsorship for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update sponsorship'
    });
  }
};

// Delete sponsorship
exports.deleteSponsorship = async (req, res) => {
  try {
    const { athleteId, sponsorshipId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get financial profile
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    // Find sponsorship index
    const sponsorshipIndex = financial.sponsorships.findIndex(
      sponsorship => sponsorship._id.toString() === sponsorshipId
    );
    
    if (sponsorshipIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Sponsorship not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, person who recorded it, financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      financial.sponsorships[sponsorshipIndex].recordedBy.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this sponsorship'
      });
    }
    
    // Remove sponsorship
    financial.sponsorships.splice(sponsorshipIndex, 1);
    await financial.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Sponsorship deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting sponsorship for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete sponsorship'
    });
  }
};

// Upload financial document
exports.uploadFinancialDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file uploaded'
      });
    }
    
    const { athleteId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, their financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to upload financial documents for this athlete'
      });
    }
    
    // Get financial profile or create if it doesn't exist
    let financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      financial = await Financial.create({
        athlete: athleteId,
        documents: []
      });
    }
    
    const newDocument = {
      name: req.body.name || req.file.originalname,
      type: req.body.type || 'financial',
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      uploadedAt: Date.now()
    };
    
    financial.documents.push(newDocument);
    await financial.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        document: financial.documents[financial.documents.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error uploading financial document for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload financial document'
    });
  }
};

// Delete financial document
exports.deleteFinancialDocument = async (req, res) => {
  try {
    const { athleteId, documentId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get financial profile
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    // Find document index
    const documentIndex = financial.documents.findIndex(
      doc => doc._id.toString() === documentId
    );
    
    if (documentIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Document not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, person who uploaded it, financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      financial.documents[documentIndex].uploadedBy.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this document'
      });
    }
    
    // TODO: Delete file from storage (S3, etc.)
    
    financial.documents.splice(documentIndex, 1);
    await financial.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting financial document for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete financial document'
    });
  }
};

// Add investment
exports.addInvestment = async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, their financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add investments for this athlete'
      });
    }
    
    // Get financial profile or create if it doesn't exist
    let financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      financial = await Financial.create({
        athlete: athleteId,
        investments: []
      });
    }
    
    const newInvestment = {
      ...req.body,
      recordedBy: req.user.id,
      recordedAt: Date.now()
    };
    
    financial.investments.push(newInvestment);
    await financial.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        investment: financial.investments[financial.investments.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding investment for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add investment'
    });
  }
};

// Update investment
exports.updateInvestment = async (req, res) => {
  try {
    const { athleteId, investmentId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get financial profile
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    // Find investment index
    const investmentIndex = financial.investments.findIndex(
      investment => investment._id.toString() === investmentId
    );
    
    if (investmentIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Investment not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, person who recorded it, financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      financial.investments[investmentIndex].recordedBy.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this investment'
      });
    }
    
    // Update investment
    financial.investments[investmentIndex] = {
      ...financial.investments[investmentIndex].toObject(),
      ...req.body,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    };
    
    await financial.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        investment: financial.investments[investmentIndex]
      }
    });
  } catch (error) {
    logger.error(`Error updating investment for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update investment'
    });
  }
};

// Delete investment
exports.deleteInvestment = async (req, res) => {
  try {
    const { athleteId, investmentId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get financial profile
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    // Find investment index
    const investmentIndex = financial.investments.findIndex(
      investment => investment._id.toString() === investmentId
    );
    
    if (investmentIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Investment not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, person who recorded it, financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      financial.investments[investmentIndex].recordedBy.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this investment'
      });
    }
    
    // Remove investment
    financial.investments.splice(investmentIndex, 1);
    await financial.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Investment deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting investment for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete investment'
    });
  }
};

// Add financial goal
exports.addFinancialGoal = async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, their financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add financial goals for this athlete'
      });
    }
    
    // Get financial profile or create if it doesn't exist
    let financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      financial = await Financial.create({
        athlete: athleteId,
        goals: []
      });
    }
    
    const newGoal = {
      ...req.body,
      createdBy: req.user.id,
      createdAt: Date.now(),
      status: req.body.status || 'active'
    };
    
    financial.goals.push(newGoal);
    await financial.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        goal: financial.goals[financial.goals.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding financial goal for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add financial goal'
    });
  }
};

// Update financial goal
exports.updateFinancialGoal = async (req, res) => {
  try {
    const { athleteId, goalId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get financial profile
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    // Find goal index
    const goalIndex = financial.goals.findIndex(
      goal => goal._id.toString() === goalId
    );
    
    if (goalIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial goal not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, person who created it, financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      financial.goals[goalIndex].createdBy.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this financial goal'
      });
    }
    
    // Update goal
    financial.goals[goalIndex] = {
      ...financial.goals[goalIndex].toObject(),
      ...req.body,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    };
    
    await financial.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        goal: financial.goals[goalIndex]
      }
    });
  } catch (error) {
    logger.error(`Error updating financial goal for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update financial goal'
    });
  }
};

// Delete financial goal
exports.deleteFinancialGoal = async (req, res) => {
  try {
    const { athleteId, goalId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get financial profile
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    // Find goal index
    const goalIndex = financial.goals.findIndex(
      goal => goal._id.toString() === goalId
    );
    
    if (goalIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial goal not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, person who created it, financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      financial.goals[goalIndex].createdBy.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this financial goal'
      });
    }
    
    // Remove goal
    financial.goals.splice(goalIndex, 1);
    await financial.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Financial goal deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting financial goal for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete financial goal'
    });
  }
};

// Get financial analytics
exports.getFinancialAnalytics = async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { year, month } = req.query;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, their financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view financial analytics for this athlete'
      });
    }
    
    // Get financial profile
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    // Filter data by year and month if provided
    const filterDate = (item) => {
      const date = new Date(item.date);
      
      if (year && month) {
        return date.getFullYear() === parseInt(year) && date.getMonth() === parseInt(month) - 1;
      } else if (year) {
        return date.getFullYear() === parseInt(year);
      }
      
      return true; // No filter
    };
    
    const filteredIncome = financial.income.filter(filterDate);
    const filteredExpenses = financial.expenses.filter(filterDate);
    
    // Calculate totals
    const totalIncome = filteredIncome.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
    const netIncome = totalIncome - totalExpenses;
    
    // Group income by category
    const incomeByCategory = {};
    filteredIncome.forEach(item => {
      if (!incomeByCategory[item.category]) {
        incomeByCategory[item.category] = 0;
      }
      incomeByCategory[item.category] += item.amount;
    });
    
    // Group expenses by category
    const expensesByCategory = {};
    filteredExpenses.forEach(item => {
      if (!expensesByCategory[item.category]) {
        expensesByCategory[item.category] = 0;
      }
      expensesByCategory[item.category] += item.amount;
    });
    
    // Calculate monthly data for trends
    const monthlyData = {};
    
    // Process income
    financial.income.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, net: 0 };
      }
      
      monthlyData[monthKey].income += item.amount;
      monthlyData[monthKey].net += item.amount;
    });
    
    // Process expenses
    financial.expenses.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, net: 0 };
      }
      
      monthlyData[monthKey].expenses += item.amount;
      monthlyData[monthKey].net -= item.amount;
    });
    
    // Convert to array and sort by date
    const trends = Object.keys(monthlyData)
      .sort()
      .map(key => ({
        month: key,
        ...monthlyData[key]
      }));
    
    // Calculate investment performance
    const investments = financial.investments || [];
    const totalInvested = investments.reduce((sum, item) => sum + item.amount, 0);
    const currentValue = investments.reduce((sum, item) => sum + (item.currentValue || item.amount), 0);
    const investmentGrowth = currentValue - totalInvested;
    const investmentReturn = totalInvested > 0 ? (investmentGrowth / totalInvested) * 100 : 0;
    
    // Calculate sponsorship value
    const sponsorships = financial.sponsorships || [];
    const activeSponshorships = sponsorships.filter(s => s.status === 'active');
    const totalSponsorshipValue = activeSponshorships.reduce((sum, item) => sum + item.value, 0);
    
    // Calculate goal progress
    const goals = financial.goals || [];
    const goalProgress = goals.map(goal => {
      let progress = 0;
      
      if (goal.targetAmount > 0) {
        if (goal.type === 'savings') {
          // Calculate savings progress
          const savingsToDate = filteredIncome.reduce((sum, item) => sum + item.amount, 0) - 
                               filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
          progress = (savingsToDate / goal.targetAmount) * 100;
        } else if (goal.type === 'income') {
          // Calculate income progress
          const incomeToDate = filteredIncome.reduce((sum, item) => sum + item.amount, 0);
          progress = (incomeToDate / goal.targetAmount) * 100;
        }
      }
      
      return {
        id: goal._id,
        name: goal.name,
        type: goal.type,
        targetAmount: goal.targetAmount,
        progress: Math.min(100, progress),
        status: goal.status
      };
    });
    
    const analytics = {
      summary: {
        totalIncome,
        totalExpenses,
        netIncome,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
      },
      incomeByCategory,
      expensesByCategory,
      trends,
      investments: {
        totalInvested,
        currentValue,
        growth: investmentGrowth,
        returnPercentage: investmentReturn
      },
      sponsorships: {
        active: activeSponshorships.length,
        totalValue: totalSponsorshipValue
      },
      goalProgress
    };
    
    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    logger.error(`Error generating financial analytics for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate financial analytics'
    });
  }
};

// Get tax summary
exports.getTaxSummary = async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { year } = req.query;
    
    if (!year) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tax year is required'
      });
    }
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, their financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view tax summary for this athlete'
      });
    }
    
    // Get financial profile
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    // Filter data by year
    const filterByYear = (item) => {
      const date = new Date(item.date);
      return date.getFullYear() === parseInt(year);
    };
    
    const yearlyIncome = financial.income.filter(filterByYear);
    const yearlyExpenses = financial.expenses.filter(filterByYear);
    
    // Calculate taxable income
    const totalIncome = yearlyIncome.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate deductible expenses (simplified - in reality, tax deductions are more complex)
    const deductibleExpenses = yearlyExpenses
      .filter(expense => expense.taxDeductible)
      .reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate taxable income
    const taxableIncome = totalIncome - deductibleExpenses;
    
    // Simplified tax calculation (this would be much more complex in reality)
    // These tax brackets are simplified examples
    let estimatedTax = 0;
    
    if (taxableIncome <= 10000) {
      estimatedTax = taxableIncome * 0.1;
    } else if (taxableIncome <= 50000) {
      estimatedTax = 1000 + (taxableIncome - 10000) * 0.15;
    } else if (taxableIncome <= 100000) {
      estimatedTax = 7000 + (taxableIncome - 50000) * 0.25;
    } else {
      estimatedTax = 19500 + (taxableIncome - 100000) * 0.35;
    }
    
    // Group income by type for tax reporting
    const incomeByType = {};
    yearlyIncome.forEach(item => {
      if (!incomeByType[item.category]) {
        incomeByType[item.category] = 0;
      }
      incomeByType[item.category] += item.amount;
    });
    
    // Group deductible expenses by type
    const deductionsByType = {};
    yearlyExpenses
      .filter(expense => expense.taxDeductible)
      .forEach(item => {
        if (!deductionsByType[item.category]) {
          deductionsByType[item.category] = 0;
        }
        deductionsByType[item.category] += item.amount;
      });
    
    const taxSummary = {
      year: parseInt(year),
      totalIncome,
      deductibleExpenses,
      taxableIncome,
      estimatedTax,
      effectiveTaxRate: taxableIncome > 0 ? (estimatedTax / taxableIncome) * 100 : 0,
      incomeByType,
      deductionsByType,
      disclaimer: 'This is a simplified tax estimate and should not be used for official tax filing purposes. Please consult a tax professional.'
    };
    
    res.status(200).json({
      status: 'success',
      data: { taxSummary }
    });
  } catch (error) {
    logger.error(`Error generating tax summary for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate tax summary'
    });
  }
};

// Get financial recommendations
exports.getFinancialRecommendations = async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (athlete themselves, their financial advisor, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      req.user.role === 'financial_advisor' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view financial recommendations for this athlete'
      });
    }
    
    // Get financial profile
    const financial = await Financial.findOne({ athlete: athleteId });
    
    if (!financial) {
      return res.status(404).json({
        status: 'fail',
        message: 'Financial profile not found for this athlete'
      });
    }
    
    // Calculate recent financial metrics
    const recentMonths = 3;
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - recentMonths);
    
    const recentIncome = financial.income
      .filter(item => new Date(item.date) >= threeMonthsAgo)
      .reduce((sum, item) => sum + item.amount, 0);
    
    const recentExpenses = financial.expenses
      .filter(item => new Date(item.date) >= threeMonthsAgo)
      .reduce((sum, item) => sum + item.amount, 0);
    
    const monthlySavings = (recentIncome - recentExpenses) / recentMonths;
    const savingsRate = recentIncome > 0 ? ((recentIncome - recentExpenses) / recentIncome) * 100 : 0;
    
    // Generate recommendations based on financial situation
    const recommendations = {
      budgeting: [],
      savings: [],
      investments: [],
      taxPlanning: [],
      retirementPlanning: []
    };
    
    // Budgeting recommendations
    if (recentExpenses > recentIncome) {
      recommendations.budgeting.push('Your expenses exceed your income. Review your budget to identify areas where you can reduce spending.');
    }
    
    if (savingsRate < 20) {
      recommendations.budgeting.push('Your savings rate is below the recommended 20%. Consider increasing your savings by reducing discretionary spending.');
    }
    
    // Analyze expense categories
    const expensesByCategory = {};
    financial.expenses.forEach(item => {
      if (!expensesByCategory[item.category]) {
        expensesByCategory[item.category] = 0;
      }
      expensesByCategory[item.category] += item.amount;
    });
    
    // Find highest expense category
    let highestCategory = '';
    let highestAmount = 0;
    
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      if (amount > highestAmount) {
        highestCategory = category;
        highestAmount = amount;
      }
    });
    
    if (highestCategory) {
      recommendations.budgeting.push(`Your highest expense category is ${highestCategory}. Review these expenses to identify potential savings.`);
    }
    
    // Savings recommendations
    if (monthlySavings < 1000) {
      recommendations.savings.push('Consider setting up an automatic transfer to a savings account to build your emergency fund.');
    }
    
    // Investment recommendations
    const investments = financial.investments || [];
    if (investments.length === 0) {
      recommendations.investments.push('Consider starting an investment portfolio to grow your wealth over time.');
    } else {
      // Check investment diversification
      const investmentTypes = new Set(investments.map(inv => inv.type));
      if (investmentTypes.size < 3) {
        recommendations.investments.push('Your investment portfolio could benefit from greater diversification. Consider adding different asset classes.');
      }
    }
    
    // Tax planning recommendations
    recommendations.taxPlanning.push('Keep track of all potential tax deductions related to your athletic career, including training expenses and equipment.');
    recommendations.taxPlanning.push('Consider consulting with a tax professional who specializes in working with athletes.');
    
    // Retirement planning
    recommendations.retirementPlanning.push('Start planning for your post-athletic career early. Consider setting up a retirement account.');
    recommendations.retirementPlanning.push('As an athlete, your peak earning years may be earlier than in other professions. Plan your long-term finances accordingly.');
    
    res.status(200).json({
      status: 'success',
      data: { 
        recommendations,
        financialSummary: {
          recentMonthlyIncome: recentIncome / recentMonths,
          recentMonthlyExpenses: recentExpenses / recentMonths,
          monthlySavings,
          savingsRate
        }
      }
    });
  } catch (error) {
    logger.error(`Error generating financial recommendations for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate financial recommendations'
    });
  }
};