const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performance.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validatePerformanceEntry } = require('../middleware/validators');
const upload = require('../middleware/upload');

// Get all performance records for an athlete
router.get('/athlete/:athleteId', authenticate, performanceController.getAthletePerformance);

// Get performance record by ID
router.get('/:id', authenticate, performanceController.getPerformanceById);

// Create performance record
router.post('/', authenticate, validatePerformanceEntry, performanceController.createPerformanceRecord);

// Update performance record
router.put('/:id', authenticate, validatePerformanceEntry, performanceController.updatePerformanceRecord);

// Delete performance record
router.delete('/:id', authenticate, performanceController.deletePerformanceRecord);

// Upload video analysis
router.post('/:id/video', authenticate, upload.single('video'), performanceController.uploadVideo);

// Add video annotation
router.post('/:id/video/:videoId/annotations', authenticate, performanceController.addVideoAnnotation);

// Get performance analytics
router.get('/athlete/:athleteId/analytics', authenticate, performanceController.getPerformanceAnalytics);

// Compare performance with benchmarks
router.get('/athlete/:athleteId/compare', authenticate, performanceController.compareWithBenchmarks);

// Get performance trends
router.get('/athlete/:athleteId/trends', authenticate, performanceController.getPerformanceTrends);

// Add skill assessment
router.post('/:id/skill-assessment', authenticate, performanceController.addSkillAssessment);

// Update skill assessment
router.put('/:id/skill-assessment/:assessmentId', authenticate, performanceController.updateSkillAssessment);

// Get performance recommendations
router.get('/athlete/:athleteId/recommendations', authenticate, performanceController.getRecommendations);

module.exports = router;