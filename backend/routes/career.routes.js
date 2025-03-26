const express = require('express');
const router = express.Router();
const careerController = require('../controllers/career.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCareerRecord } = require('../middleware/validators');
const upload = require('../middleware/upload');

// Get career profile for an athlete
router.get('/athlete/:athleteId', authenticate, careerController.getAthleteCareer);

// Create or update career profile
router.post('/athlete/:athleteId', authenticate, careerController.createOrUpdateCareerProfile);

// Add career goal
router.post('/athlete/:athleteId/goals', authenticate, validateCareerRecord, careerController.addCareerGoal);

// Update career goal
router.put('/athlete/:athleteId/goals/:goalId', authenticate, validateCareerRecord, careerController.updateCareerGoal);

// Delete career goal
router.delete('/athlete/:athleteId/goals/:goalId', authenticate, careerController.deleteCareerGoal);

// Add skill assessment
router.post('/athlete/:athleteId/skills', authenticate, careerController.addSkillAssessment);

// Update skill assessment
router.put('/athlete/:athleteId/skills/:skillId', authenticate, careerController.updateSkillAssessment);

// Delete skill assessment
router.delete('/athlete/:athleteId/skills/:skillId', authenticate, careerController.deleteSkillAssessment);

// Add competition
router.post('/athlete/:athleteId/competitions', authenticate, careerController.addCompetition);

// Update competition
router.put('/athlete/:athleteId/competitions/:competitionId', authenticate, careerController.updateCompetition);

// Delete competition
router.delete('/athlete/:athleteId/competitions/:competitionId', authenticate, careerController.deleteCompetition);

// Add training program
router.post('/athlete/:athleteId/training', authenticate, careerController.addTrainingProgram);

// Update training program
router.put('/athlete/:athleteId/training/:programId', authenticate, careerController.updateTrainingProgram);

// Delete training program
router.delete('/athlete/:athleteId/training/:programId', authenticate, careerController.deleteTrainingProgram);

// Add mentor
router.post('/athlete/:athleteId/mentors', authenticate, careerController.addMentor);

// Update mentor
router.put('/athlete/:athleteId/mentors/:mentorId', authenticate, careerController.updateMentor);

// Delete mentor
router.delete('/athlete/:athleteId/mentors/:mentorId', authenticate, careerController.deleteMentor);

// Add opportunity
router.post('/athlete/:athleteId/opportunities', authenticate, careerController.addOpportunity);

// Update opportunity
router.put('/athlete/:athleteId/opportunities/:opportunityId', authenticate, careerController.updateOpportunity);

// Delete opportunity
router.delete('/athlete/:athleteId/opportunities/:opportunityId', authenticate, careerController.deleteOpportunity);

// Generate career pathway recommendations
router.get('/athlete/:athleteId/recommendations', authenticate, careerController.generateCareerRecommendations);

// Get career analytics
router.get('/athlete/:athleteId/analytics', authenticate, careerController.getCareerAnalytics);

// Upload career document
router.post('/athlete/:athleteId/documents', authenticate, upload.single('document'), careerController.uploadCareerDocument);

module.exports = router;