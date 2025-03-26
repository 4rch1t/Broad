const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financial.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateFinancialRecord } = require('../middleware/validators');
const upload = require('../middleware/upload');

// Get financial profile for an athlete
router.get('/athlete/:athleteId', authenticate, financialController.getAthleteFinancials);

// Create or update financial profile
router.post('/athlete/:athleteId', authenticate, financialController.createOrUpdateFinancialProfile);

// Add income record
router.post('/athlete/:athleteId/income', authenticate, validateFinancialRecord, financialController.addIncomeRecord);

// Update income record
router.put('/athlete/:athleteId/income/:incomeId', authenticate, validateFinancialRecord, financialController.updateIncomeRecord);

// Delete income record
router.delete('/athlete/:athleteId/income/:incomeId', authenticate, financialController.deleteIncomeRecord);

// Add expense record
router.post('/athlete/:athleteId/expense', authenticate, validateFinancialRecord, financialController.addExpenseRecord);

// Update expense record
router.put('/athlete/:athleteId/expense/:expenseId', authenticate, validateFinancialRecord, financialController.updateExpenseRecord);

// Delete expense record
router.delete('/athlete/:athleteId/expense/:expenseId', authenticate, financialController.deleteExpenseRecord);

// Add sponsorship
router.post('/athlete/:athleteId/sponsorship', authenticate, financialController.addSponsorship);

// Update sponsorship
router.put('/athlete/:athleteId/sponsorship/:sponsorshipId', authenticate, financialController.updateSponsorship);

// Delete sponsorship
router.delete('/athlete/:athleteId/sponsorship/:sponsorshipId', authenticate, financialController.deleteSponsorship);

// Upload financial document
router.post('/athlete/:athleteId/documents', authenticate, upload.single('document'), financialController.uploadFinancialDocument);

// Delete financial document
router.delete('/athlete/:athleteId/documents/:documentId', authenticate, financialController.deleteFinancialDocument);

// Add investment
router.post('/athlete/:athleteId/investment', authenticate, financialController.addInvestment);

// Update investment
router.put('/athlete/:athleteId/investment/:investmentId', authenticate, financialController.updateInvestment);

// Delete investment
router.delete('/athlete/:athleteId/investment/:investmentId', authenticate, financialController.deleteInvestment);

// Add financial goal
router.post('/athlete/:athleteId/goal', authenticate, financialController.addFinancialGoal);

// Update financial goal
router.put('/athlete/:athleteId/goal/:goalId', authenticate, financialController.updateFinancialGoal);

// Delete financial goal
router.delete('/athlete/:athleteId/goal/:goalId', authenticate, financialController.deleteFinancialGoal);

// Get financial analytics
router.get('/athlete/:athleteId/analytics', authenticate, financialController.getFinancialAnalytics);

// Get tax summary
router.get('/athlete/:athleteId/tax-summary', authenticate, financialController.getTaxSummary);

// Get financial recommendations
router.get('/athlete/:athleteId/recommendations', authenticate, financialController.getFinancialRecommendations);

module.exports = router;