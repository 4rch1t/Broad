const express = require('express');
const router = express.Router();
const athleteController = require('../controllers/athlete.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateAthleteProfile } = require('../middleware/validators');
const upload = require('../middleware/upload');

// Get all athletes (admin, coach)
router.get('/', authenticate, authorize(['admin', 'coach', 'organization']), athleteController.getAllAthletes);

// Get athlete by ID
router.get('/:id', authenticate, athleteController.getAthleteById);

// Create athlete profile (linked to user)
router.post('/', authenticate, validateAthleteProfile, athleteController.createAthleteProfile);

// Update athlete profile
router.put('/:id', authenticate, validateAthleteProfile, athleteController.updateAthleteProfile);

// Upload athlete profile picture
router.post('/:id/profile-picture', authenticate, upload.single('profilePicture'), athleteController.uploadProfilePicture);

// Add achievement
router.post('/:id/achievements', authenticate, athleteController.addAchievement);

// Update achievement
router.put('/:id/achievements/:achievementId', authenticate, athleteController.updateAchievement);

// Delete achievement
router.delete('/:id/achievements/:achievementId', authenticate, athleteController.deleteAchievement);

// Add document
router.post('/:id/documents', authenticate, upload.single('document'), athleteController.addDocument);

// Delete document
router.delete('/:id/documents/:documentId', authenticate, athleteController.deleteDocument);

// Add coach
router.post('/:id/coaches', authenticate, athleteController.addCoach);

// Remove coach
router.delete('/:id/coaches/:coachId', authenticate, athleteController.removeCoach);

// Get athlete statistics
router.get('/:id/statistics', authenticate, athleteController.getAthleteStatistics);

// Search athletes
router.get('/search', authenticate, athleteController.searchAthletes);

// Verify athlete
router.put('/:id/verify', authenticate, authorize(['admin', 'organization']), athleteController.verifyAthlete);

module.exports = router;