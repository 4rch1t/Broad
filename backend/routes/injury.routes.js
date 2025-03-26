const express = require('express');
const router = express.Router();
const injuryController = require('../controllers/injury.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateInjuryRecord } = require('../middleware/validators');
const upload = require('../middleware/upload');

// Get all injuries for an athlete
router.get('/athlete/:athleteId', authenticate, injuryController.getAthleteInjuries);

// Get injury by ID
router.get('/:id', authenticate, injuryController.getInjuryById);

// Create injury record
router.post('/', authenticate, validateInjuryRecord, injuryController.createInjuryRecord);

// Update injury record
router.put('/:id', authenticate, validateInjuryRecord, injuryController.updateInjuryRecord);

// Delete injury record
router.delete('/:id', authenticate, authorize(['admin', 'physiotherapist']), injuryController.deleteInjuryRecord);

// Upload medical document
router.post('/:id/documents', authenticate, upload.single('document'), injuryController.uploadMedicalDocument);

// Delete medical document
router.delete('/:id/documents/:documentId', authenticate, injuryController.deleteMedicalDocument);

// Add rehabilitation phase
router.post('/:id/rehabilitation', authenticate, injuryController.addRehabilitationPhase);

// Update rehabilitation phase
router.put('/:id/rehabilitation/:phaseId', authenticate, injuryController.updateRehabilitationPhase);

// Add progress note
router.post('/:id/progress', authenticate, injuryController.addProgressNote);

// Update return to play assessment
router.put('/:id/return-to-play', authenticate, authorize(['physiotherapist', 'coach', 'admin']), injuryController.updateReturnToPlayAssessment);

// Get injury analytics
router.get('/athlete/:athleteId/analytics', authenticate, injuryController.getInjuryAnalytics);

// Get injury risk assessment
router.get('/athlete/:athleteId/risk-assessment', authenticate, injuryController.getInjuryRiskAssessment);

// Get rehabilitation progress
router.get('/:id/rehabilitation-progress', authenticate, injuryController.getRehabilitationProgress);

module.exports = router;