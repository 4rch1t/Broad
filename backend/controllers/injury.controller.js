const Injury = require('../models/injury.model');
const Athlete = require('../models/athlete.model');
const logger = require('../utils/logger');

// Get all injuries for an athlete
exports.getAthleteInjuries = async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { status, startDate, endDate } = req.query;
    
    const query = { athlete: athleteId };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.dateOfInjury = {};
      if (startDate) query.dateOfInjury.$gte = new Date(startDate);
      if (endDate) query.dateOfInjury.$lte = new Date(endDate);
    }
    
    const injuries = await Injury.find(query).sort({ dateOfInjury: -1 });
    
    res.status(200).json({
      status: 'success',
      results: injuries.length,
      data: { injuries }
    });
  } catch (error) {
    logger.error(`Error fetching injuries for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch injuries'
    });
  }
};

// Get injury by ID
exports.getInjuryById = async (req, res) => {
  try {
    const injury = await Injury.findById(req.params.id);
    
    if (!injury) {
      return res.status(404).json({
        status: 'fail',
        message: 'Injury record not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { injury }
    });
  } catch (error) {
    logger.error(`Error fetching injury ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch injury record'
    });
  }
};

// Create injury record
exports.createInjuryRecord = async (req, res) => {
  try {
    // Check if athlete exists
    const athlete = await Athlete.findById(req.body.athlete);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (physiotherapist, coach, or admin)
    const isAuthorized = 
      req.user.role === 'physiotherapist' || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to create injury records'
      });
    }
    
    const newInjury = await Injury.create({
      ...req.body,
      recordedBy: req.user.id,
      status: req.body.status || 'active'
    });
    
    res.status(201).json({
      status: 'success',
      data: { injury: newInjury }
    });
  } catch (error) {
    logger.error('Error creating injury record:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create injury record'
    });
  }
};

// Update injury record
exports.updateInjuryRecord = async (req, res) => {
  try {
    const injury = await Injury.findById(req.params.id);
    
    if (!injury) {
      return res.status(404).json({
        status: 'fail',
        message: 'Injury record not found'
      });
    }
    
    // Check if athlete exists
    const athlete = await Athlete.findById(injury.athlete);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (person who recorded it, physiotherapist, coach, or admin)
    const isAuthorized = 
      injury.recordedBy.toString() === req.user.id ||
      req.user.role === 'physiotherapist' || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this injury record'
      });
    }
    
    const updatedInjury = await Injury.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: { injury: updatedInjury }
    });
  } catch (error) {
    logger.error(`Error updating injury record ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update injury record'
    });
  }
};

// Delete injury record
exports.deleteInjuryRecord = async (req, res) => {
  try {
    const injury = await Injury.findById(req.params.id);
    
    if (!injury) {
      return res.status(404).json({
        status: 'fail',
        message: 'Injury record not found'
      });
    }
    
    // Only admin and physiotherapist can delete (authorization is handled in the route middleware)
    await Injury.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Injury record deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting injury record ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete injury record'
    });
  }
};

// Upload medical document
exports.uploadMedicalDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file uploaded'
      });
    }
    
    const injury = await Injury.findById(req.params.id);
    
    if (!injury) {
      return res.status(404).json({
        status: 'fail',
        message: 'Injury record not found'
      });
    }
    
    // Check if athlete exists
    const athlete = await Athlete.findById(injury.athlete);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (physiotherapist, coach, or admin)
    const isAuthorized = 
      req.user.role === 'physiotherapist' || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to upload medical documents'
      });
    }
    
    const newDocument = {
      name: req.body.name || req.file.originalname,
      type: req.body.type || 'medical',
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      uploadedAt: Date.now()
    };
    
    injury.medicalDocuments.push(newDocument);
    await injury.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        document: injury.medicalDocuments[injury.medicalDocuments.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error uploading medical document for injury ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload medical document'
    });
  }
};

// Delete medical document
exports.deleteMedicalDocument = async (req, res) => {
  try {
    const injury = await Injury.findById(req.params.id);
    
    if (!injury) {
      return res.status(404).json({
        status: 'fail',
        message: 'Injury record not found'
      });
    }
    
    // Check if athlete exists
    const athlete = await Athlete.findById(injury.athlete);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Find document index
    const documentIndex = injury.medicalDocuments.findIndex(
      doc => doc._id.toString() === req.params.documentId
    );
    
    if (documentIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Document not found'
      });
    }
    
    // Check if user is authorized (person who uploaded it, physiotherapist, or admin)
    const isAuthorized = 
      injury.medicalDocuments[documentIndex].uploadedBy.toString() === req.user.id ||
      req.user.role === 'physiotherapist' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this document'
      });
    }
    
    // TODO: Delete file from storage (S3, etc.)
    
    injury.medicalDocuments.splice(documentIndex, 1);
    await injury.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting medical document for injury ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete medical document'
    });
  }
};

// Add rehabilitation phase
exports.addRehabilitationPhase = async (req, res) => {
  try {
    const injury = await Injury.findById(req.params.id);
    
    if (!injury) {
      return res.status(404).json({
        status: 'fail',
        message: 'Injury record not found'
      });
    }
    
    // Check if athlete exists
    const athlete = await Athlete.findById(injury.athlete);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (physiotherapist, coach, or admin)
    const isAuthorized = 
      req.user.role === 'physiotherapist' || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add rehabilitation phases'
      });
    }
    
    const newPhase = {
      ...req.body,
      createdBy: req.user.id,
      createdAt: Date.now(),
      status: req.body.status || 'planned'
    };
    
    injury.rehabilitationPlan.push(newPhase);
    await injury.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        phase: injury.rehabilitationPlan[injury.rehabilitationPlan.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding rehabilitation phase for injury ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add rehabilitation phase'
    });
  }
};

// Update rehabilitation phase
exports.updateRehabilitationPhase = async (req, res) => {
  try {
    const injury = await Injury.findById(req.params.id);
    
    if (!injury) {
      return res.status(404).json({
        status: 'fail',
        message: 'Injury record not found'
      });
    }
    
    // Check if athlete exists
    const athlete = await Athlete.findById(injury.athlete);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Find phase index
    const phaseIndex = injury.rehabilitationPlan.findIndex(
      phase => phase._id.toString() === req.params.phaseId
    );
    
    if (phaseIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Rehabilitation phase not found'
      });
    }
    
    // Check if user is authorized (person who created phase, physiotherapist, or admin)
    const isAuthorized = 
      injury.rehabilitationPlan[phaseIndex].createdBy.toString() === req.user.id ||
      req.user.role === 'physiotherapist' || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this rehabilitation phase'
      });
    }
    
    // Update phase
    injury.rehabilitationPlan[phaseIndex] = {
      ...injury.rehabilitationPlan[phaseIndex].toObject(),
      ...req.body,
      updatedAt: Date.now()
    };
    
    await injury.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        phase: injury.rehabilitationPlan[phaseIndex]
      }
    });
  } catch (error) {
    logger.error(`Error updating rehabilitation phase for injury ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update rehabilitation phase'
    });
  }
};

// Add progress note
exports.addProgressNote = async (req, res) => {
  try {
    const injury = await Injury.findById(req.params.id);
    
    if (!injury) {
      return res.status(404).json({
        status: 'fail',
        message: 'Injury record not found'
      });
    }
    
    // Check if athlete exists
    const athlete = await Athlete.findById(injury.athlete);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Check if user is authorized (physiotherapist, coach, or admin)
    const isAuthorized = 
      req.user.role === 'physiotherapist' || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add progress notes'
      });
    }
    
    const newNote = {
      ...req.body,
      createdBy: req.user.id,
      createdAt: Date.now()
    };
    
    injury.progressNotes.push(newNote);
    await injury.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        note: injury.progressNotes[injury.progressNotes.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding progress note for injury ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add progress note'
    });
  }
};

// Update return to play assessment
exports.updateReturnToPlayAssessment = async (req, res) => {
  try {
    const injury = await Injury.findById(req.params.id);
    
    if (!injury) {
      return res.status(404).json({
        status: 'fail',
        message: 'Injury record not found'
      });
    }
    
    // Check if athlete exists
    const athlete = await Athlete.findById(injury.athlete);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Authorization is handled in the route middleware (only physiotherapist, coach, or admin)
    
    // Update return to play assessment
    injury.returnToPlay = {
      ...injury.returnToPlay || {},
      ...req.body,
      assessedBy: req.user.id,
      assessedAt: Date.now()
    };
    
    // If cleared to play, update injury status
    if (req.body.cleared === true) {
      injury.status = 'resolved';
    }
    
    await injury.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        returnToPlay: injury.returnToPlay
      }
    });
  } catch (error) {
    logger.error(`Error updating return to play assessment for injury ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update return to play assessment'
    });
  }
};

// Get injury analytics
exports.getInjuryAnalytics = async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { period } = req.query; // e.g., 'year', 'career'
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Calculate date range based on period
    let startDate;
    const endDate = new Date();
    
    if (period === 'year') {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (period === '6months') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
    } else {
      // Default to all time (career)
      startDate = new Date(0); // Beginning of time
    }
    
    // Get injuries in date range
    const injuries = await Injury.find({
      athlete: athleteId,
      dateOfInjury: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate analytics
    const analytics = {
      totalInjuries: injuries.length,
      byBodyPart: {},
      byType: {},
      bySeverity: {},
      averageRecoveryTime: 0,
      currentStatus: {
        active: 0,
        recovering: 0,
        resolved: 0
      },
      timelineData: []
    };
    
    // Process injuries for analytics
    let totalRecoveryDays = 0;
    let recoveredInjuries = 0;
    
    injuries.forEach(injury => {
      // Count by body part
      if (!analytics.byBodyPart[injury.bodyPart]) {
        analytics.byBodyPart[injury.bodyPart] = 0;
      }
      analytics.byBodyPart[injury.bodyPart]++;
      
      // Count by type
      if (!analytics.byType[injury.type]) {
        analytics.byType[injury.type] = 0;
      }
      analytics.byType[injury.type]++;
      
      // Count by severity
      if (!analytics.bySeverity[injury.severity]) {
        analytics.bySeverity[injury.severity] = 0;
      }
      analytics.bySeverity[injury.severity]++;
      
      // Count by status
      analytics.currentStatus[injury.status]++;
      
      // Calculate recovery time for resolved injuries
      if (injury.status === 'resolved' && injury.returnToPlay && injury.returnToPlay.assessedAt) {
        const recoveryTime = new Date(injury.returnToPlay.assessedAt) - new Date(injury.dateOfInjury);
        const recoveryDays = Math.ceil(recoveryTime / (1000 * 60 * 60 * 24));
        totalRecoveryDays += recoveryDays;
        recoveredInjuries++;
      }
      
      // Add to timeline data
      analytics.timelineData.push({
        date: injury.dateOfInjury,
        type: injury.type,
        bodyPart: injury.bodyPart,
        severity: injury.severity,
        status: injury.status
      });
    });
    
    // Calculate average recovery time
    if (recoveredInjuries > 0) {
      analytics.averageRecoveryTime = totalRecoveryDays / recoveredInjuries;
    }
    
    // Sort timeline data
    analytics.timelineData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    logger.error(`Error generating injury analytics for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate injury analytics'
    });
  }
};

// Get injury risk assessment
exports.getInjuryRiskAssessment = async (req, res) => {
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
    
    // Get injury history
    const injuries = await Injury.find({ athlete: athleteId });
    
    // In a real application, this would involve complex risk modeling
    // For this example, we'll create a simplified risk assessment
    
    // Count injuries by body part and recurrence
    const bodyPartCounts = {};
    const recurrentInjuries = {};
    
    injuries.forEach(injury => {
      if (!bodyPartCounts[injury.bodyPart]) {
        bodyPartCounts[injury.bodyPart] = 0;
      }
      bodyPartCounts[injury.bodyPart]++;
      
      // Check for recurrent injuries (simplified)
      if (bodyPartCounts[injury.bodyPart] > 1) {
        recurrentInjuries[injury.bodyPart] = true;
      }
    });
    
    // Calculate risk factors
    const riskFactors = [];
    const highRiskBodyParts = [];
    
    Object.entries(bodyPartCounts).forEach(([bodyPart, count]) => {
      if (count >= 3) {
        highRiskBodyParts.push(bodyPart);
        riskFactors.push(`Multiple injuries (${count}) to ${bodyPart}`);
      }
    });
    
    Object.keys(recurrentInjuries).forEach(bodyPart => {
      if (!riskFactors.some(factor => factor.includes(bodyPart))) {
        riskFactors.push(`Recurrent injuries to ${bodyPart}`);
      }
    });
    
    // Check for recent injuries (within last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentInjuries = injuries.filter(injury => 
      new Date(injury.dateOfInjury) >= threeMonthsAgo
    );
    
    if (recentInjuries.length > 0) {
      riskFactors.push(`${recentInjuries.length} recent injuries in the last 3 months`);
    }
    
    // Generate recommendations
    const recommendations = [];
    
    if (highRiskBodyParts.length > 0) {
      recommendations.push(`Focus on strengthening exercises for ${highRiskBodyParts.join(', ')}`);
      recommendations.push('Implement targeted injury prevention program');
    }
    
    if (recentInjuries.length > 0) {
      recommendations.push('Ensure complete rehabilitation before returning to full training');
      recommendations.push('Consider gradual return to play protocols');
    }
    
    // Add general recommendations
    recommendations.push('Regular monitoring of training load');
    recommendations.push('Ensure adequate recovery between training sessions');
    
    // Calculate overall risk level
    let riskLevel = 'low';
    if (riskFactors.length >= 3) {
      riskLevel = 'high';
    } else if (riskFactors.length >= 1) {
      riskLevel = 'medium';
    }
    
    const riskAssessment = {
      riskLevel,
      riskFactors,
      recommendations,
      injuryHistory: {
        total: injuries.length,
        byBodyPart: bodyPartCounts,
        recent: recentInjuries.length
      }
    };
    
    res.status(200).json({
      status: 'success',
      data: { riskAssessment }
    });
  } catch (error) {
    logger.error(`Error generating injury risk assessment for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate injury risk assessment'
    });
  }
};

// Get rehabilitation progress
exports.getRehabilitationProgress = async (req, res) => {
  try {
    const injury = await Injury.findById(req.params.id);
    
    if (!injury) {
      return res.status(404).json({
        status: 'fail',
        message: 'Injury record not found'
      });
    }
    
    // Calculate progress percentages
    const progress = {
      overall: 0,
      byPhase: [],
      timeline: {
        startDate: injury.dateOfInjury,
        currentDate: new Date(),
        estimatedCompletionDate: null,
        daysElapsed: 0,
        totalEstimatedDays: 0,
        percentageTimeElapsed: 0
      },
      latestNotes: []
    };
    
    // Calculate progress by phase
    if (injury.rehabilitationPlan && injury.rehabilitationPlan.length > 0) {
      let completedPhases = 0;
      let totalPhases = injury.rehabilitationPlan.length;
      
      injury.rehabilitationPlan.forEach(phase => {
        const phaseProgress = {
          name: phase.name,
          status: phase.status,
          progress: 0
        };
        
        if (phase.status === 'completed') {
          phaseProgress.progress = 100;
          completedPhases++;
        } else if (phase.status === 'in-progress') {
          // Estimate progress for in-progress phase (simplified)
          phaseProgress.progress = 50;
        }
        
        progress.byPhase.push(phaseProgress);
      });
      
      // Calculate overall progress
      progress.overall = (completedPhases / totalPhases) * 100;
      
      // Estimate completion date (simplified)
      if (injury.rehabilitationPlan.some(phase => phase.estimatedDuration)) {
        let totalDuration = 0;
        let completedDuration = 0;
        
        injury.rehabilitationPlan.forEach(phase => {
          if (phase.estimatedDuration) {
            totalDuration += phase.estimatedDuration;
            
            if (phase.status === 'completed') {
              completedDuration += phase.estimatedDuration;
            } else if (phase.status === 'in-progress') {
              completedDuration += phase.estimatedDuration / 2; // Simplified
            }
          }
        });
        
        const remainingDuration = totalDuration - completedDuration;
        const estimatedCompletionDate = new Date();
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + remainingDuration);
        
        progress.timeline.estimatedCompletionDate = estimatedCompletionDate;
        progress.timeline.totalEstimatedDays = totalDuration;
      }
    }
    
    // Calculate days elapsed
    const daysElapsed = Math.ceil(
      (new Date() - new Date(injury.dateOfInjury)) / (1000 * 60 * 60 * 24)
    );
    progress.timeline.daysElapsed = daysElapsed;
    
    // Calculate percentage of time elapsed
    if (progress.timeline.totalEstimatedDays > 0) {
      progress.timeline.percentageTimeElapsed = 
        (progress.timeline.daysElapsed / progress.timeline.totalEstimatedDays) * 100;
    }
    
    // Get latest progress notes
    if (injury.progressNotes && injury.progressNotes.length > 0) {
      // Sort by date (newest first) and take the latest 5
      progress.latestNotes = injury.progressNotes
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    }
    
    res.status(200).json({
      status: 'success',
      data: { progress }
    });
  } catch (error) {
    logger.error(`Error generating rehabilitation progress for injury ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate rehabilitation progress'
    });
  }
};