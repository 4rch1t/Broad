const Career = require('../models/career.model');
const Athlete = require('../models/athlete.model');
const logger = require('../utils/logger');

// Get career profile for an athlete
exports.getAthleteCareer = async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { career }
    });
  } catch (error) {
    logger.error(`Error fetching career profile for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch career profile'
    });
  }
};

// Create or update career profile
exports.createOrUpdateCareerProfile = async (req, res) => {
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
    
    // Check if user is authorized (athlete themselves, their coach, or admin)
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to manage career profile for this athlete'
      });
    }
    
    // Check if career profile already exists
    let career = await Career.findOne({ athlete: athleteId });
    
    if (career) {
      // Update existing profile
      career = await Career.findOneAndUpdate(
        { athlete: athleteId },
        req.body,
        { new: true, runValidators: true }
      );
      
      res.status(200).json({
        status: 'success',
        data: { career }
      });
    } else {
      // Create new profile
      career = await Career.create({
        athlete: athleteId,
        ...req.body
      });
      
      res.status(201).json({
        status: 'success',
        data: { career }
      });
    }
  } catch (error) {
    logger.error(`Error creating/updating career profile for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create/update career profile'
    });
  }
};

// Add career goal
exports.addCareerGoal = async (req, res) => {
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
    
    // Check if user is authorized
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add goals for this athlete'
      });
    }
    
    // Get career profile or create if it doesn't exist
    let career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      career = await Career.create({
        athlete: athleteId,
        goals: []
      });
    }
    
    const newGoal = {
      ...req.body,
      createdBy: req.user.id,
      createdAt: Date.now()
    };
    
    career.goals.push(newGoal);
    await career.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        goal: career.goals[career.goals.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding career goal for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add career goal'
    });
  }
};

// Update career goal
exports.updateCareerGoal = async (req, res) => {
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
    
    // Check if user is authorized
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update goals for this athlete'
      });
    }
    
    // Get career profile
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    // Find goal index
    const goalIndex = career.goals.findIndex(
      goal => goal._id.toString() === goalId
    );
    
    if (goalIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Goal not found'
      });
    }
    
    // Update goal
    career.goals[goalIndex] = {
      ...career.goals[goalIndex].toObject(),
      ...req.body,
      updatedAt: Date.now()
    };
    
    await career.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        goal: career.goals[goalIndex]
      }
    });
  } catch (error) {
    logger.error(`Error updating career goal for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update career goal'
    });
  }
};

// Delete career goal
exports.deleteCareerGoal = async (req, res) => {
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
    
    // Check if user is authorized
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete goals for this athlete'
      });
    }
    
    // Get career profile
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    // Find goal index
    const goalIndex = career.goals.findIndex(
      goal => goal._id.toString() === goalId
    );
    
    if (goalIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Goal not found'
      });
    }
    
    // Remove goal
    career.goals.splice(goalIndex, 1);
    await career.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting career goal for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete career goal'
    });
  }
};

// Add skill assessment
exports.addSkillAssessment = async (req, res) => {
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
    
    // Check if user is authorized (coach or admin)
    const isAuthorized = 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add skill assessments for this athlete'
      });
    }
    
    // Get career profile or create if it doesn't exist
    let career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      career = await Career.create({
        athlete: athleteId,
        skills: []
      });
    }
    
    const newSkill = {
      ...req.body,
      assessedBy: req.user.id,
      assessedAt: Date.now()
    };
    
    career.skills.push(newSkill);
    await career.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        skill: career.skills[career.skills.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding skill assessment for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add skill assessment'
    });
  }
};

// Update skill assessment
exports.updateSkillAssessment = async (req, res) => {
  try {
    const { athleteId, skillId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get career profile
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    // Find skill index
    const skillIndex = career.skills.findIndex(
      skill => skill._id.toString() === skillId
    );
    
    if (skillIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Skill assessment not found'
      });
    }
    
    // Check if user is authorized (person who created assessment or admin)
    const isAuthorized = 
      career.skills[skillIndex].assessedBy.toString() === req.user.id || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this skill assessment'
      });
    }
    
    // Update skill
    career.skills[skillIndex] = {
      ...career.skills[skillIndex].toObject(),
      ...req.body,
      updatedAt: Date.now()
    };
    
    await career.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        skill: career.skills[skillIndex]
      }
    });
  } catch (error) {
    logger.error(`Error updating skill assessment for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update skill assessment'
    });
  }
};

// Delete skill assessment
exports.deleteSkillAssessment = async (req, res) => {
  try {
    const { athleteId, skillId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get career profile
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    // Find skill index
    const skillIndex = career.skills.findIndex(
      skill => skill._id.toString() === skillId
    );
    
    if (skillIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Skill assessment not found'
      });
    }
    
    // Check if user is authorized (person who created assessment or admin)
    const isAuthorized = 
      career.skills[skillIndex].assessedBy.toString() === req.user.id || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this skill assessment'
      });
    }
    
    // Remove skill
    career.skills.splice(skillIndex, 1);
    await career.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Skill assessment deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting skill assessment for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete skill assessment'
    });
  }
};

// Add competition
exports.addCompetition = async (req, res) => {
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
    
    // Check if user is authorized
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add competitions for this athlete'
      });
    }
    
    // Get career profile or create if it doesn't exist
    let career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      career = await Career.create({
        athlete: athleteId,
        competitions: []
      });
    }
    
    const newCompetition = {
      ...req.body,
      addedBy: req.user.id,
      addedAt: Date.now()
    };
    
    career.competitions.push(newCompetition);
    await career.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        competition: career.competitions[career.competitions.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding competition for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add competition'
    });
  }
};

// Update competition
exports.updateCompetition = async (req, res) => {
  try {
    const { athleteId, competitionId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get career profile
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    // Find competition index
    const competitionIndex = career.competitions.findIndex(
      comp => comp._id.toString() === competitionId
    );
    
    if (competitionIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Competition not found'
      });
    }
    
    // Check if user is authorized
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      athlete.coaches.includes(req.user.id) || 
      career.competitions[competitionIndex].addedBy.toString() === req.user.id || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this competition'
      });
    }
    
    // Update competition
    career.competitions[competitionIndex] = {
      ...career.competitions[competitionIndex].toObject(),
      ...req.body,
      updatedAt: Date.now()
    };
    
    await career.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        competition: career.competitions[competitionIndex]
      }
    });
  } catch (error) {
    logger.error(`Error updating competition for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update competition'
    });
  }
};

// Delete competition
exports.deleteCompetition = async (req, res) => {
  try {
    const { athleteId, competitionId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get career profile
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    // Find competition index
    const competitionIndex = career.competitions.findIndex(
      comp => comp._id.toString() === competitionId
    );
    
    if (competitionIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Competition not found'
      });
    }
    
    // Check if user is authorized
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      athlete.coaches.includes(req.user.id) || 
      career.competitions[competitionIndex].addedBy.toString() === req.user.id || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this competition'
      });
    }
    
    // Remove competition
    career.competitions.splice(competitionIndex, 1);
    await career.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Competition deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting competition for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete competition'
    });
  }
};

// Add training program
exports.addTrainingProgram = async (req, res) => {
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
    
    // Check if user is authorized (coach or admin)
    const isAuthorized = 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add training programs for this athlete'
      });
    }
    
    // Get career profile or create if it doesn't exist
    let career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      career = await Career.create({
        athlete: athleteId,
        trainingPrograms: []
      });
    }
    
    const newProgram = {
      ...req.body,
      createdBy: req.user.id,
      createdAt: Date.now()
    };
    
    career.trainingPrograms.push(newProgram);
    await career.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        program: career.trainingPrograms[career.trainingPrograms.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding training program for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add training program'
    });
  }
};

// Update training program
exports.updateTrainingProgram = async (req, res) => {
  try {
    const { athleteId, programId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get career profile
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    // Find program index
    const programIndex = career.trainingPrograms.findIndex(
      program => program._id.toString() === programId
    );
    
    if (programIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Training program not found'
      });
    }
    
    // Check if user is authorized (person who created program or admin)
    const isAuthorized = 
      career.trainingPrograms[programIndex].createdBy.toString() === req.user.id || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this training program'
      });
    }
    
    // Update program
    career.trainingPrograms[programIndex] = {
      ...career.trainingPrograms[programIndex].toObject(),
      ...req.body,
      updatedAt: Date.now()
    };
    
    await career.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        program: career.trainingPrograms[programIndex]
      }
    });
  } catch (error) {
    logger.error(`Error updating training program for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update training program'
    });
  }
};

// Delete training program
exports.deleteTrainingProgram = async (req, res) => {
  try {
    const { athleteId, programId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get career profile
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    // Find program index
    const programIndex = career.trainingPrograms.findIndex(
      program => program._id.toString() === programId
    );
    
    if (programIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Training program not found'
      });
    }
    
    // Check if user is authorized (person who created program or admin)
    const isAuthorized = 
      career.trainingPrograms[programIndex].createdBy.toString() === req.user.id || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this training program'
      });
    }
    
    // Remove program
    career.trainingPrograms.splice(programIndex, 1);
    await career.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Training program deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting training program for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete training program'
    });
  }
};

// Add mentor
exports.addMentor = async (req, res) => {
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
    
    // Check if user is authorized
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add mentors for this athlete'
      });
    }
    
    // Get career profile or create if it doesn't exist
    let career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      career = await Career.create({
        athlete: athleteId,
        mentors: []
      });
    }
    
    const newMentor = {
      ...req.body,
      addedBy: req.user.id,
      addedAt: Date.now()
    };
    
    career.mentors.push(newMentor);
    await career.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        mentor: career.mentors[career.mentors.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding mentor for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add mentor'
    });
  }
};

// Update mentor
exports.updateMentor = async (req, res) => {
  try {
    const { athleteId, mentorId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get career profile
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    // Find mentor index
    const mentorIndex = career.mentors.findIndex(
      mentor => mentor._id.toString() === mentorId
    );
    
    if (mentorIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Mentor not found'
      });
    }
    
    // Check if user is authorized
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      career.mentors[mentorIndex].addedBy.toString() === req.user.id || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this mentor'
      });
    }
    
    // Update mentor
    career.mentors[mentorIndex] = {
      ...career.mentors[mentorIndex].toObject(),
      ...req.body,
      updatedAt: Date.now()
    };
    
    await career.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        mentor: career.mentors[mentorIndex]
      }
    });
  } catch (error) {
    logger.error(`Error updating mentor for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update mentor'
    });
  }
};

// Delete mentor
exports.deleteMentor = async (req, res) => {
  try {
    const { athleteId, mentorId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get career profile
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    // Find mentor index
    const mentorIndex = career.mentors.findIndex(
      mentor => mentor._id.toString() === mentorId
    );
    
    if (mentorIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Mentor not found'
      });
    }
    
    // Check if user is authorized
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      career.mentors[mentorIndex].addedBy.toString() === req.user.id || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this mentor'
      });
    }
    
    // Remove mentor
    career.mentors.splice(mentorIndex, 1);
    await career.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Mentor deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting mentor for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete mentor'
    });
  }
};

// Add opportunity
exports.addOpportunity = async (req, res) => {
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
    
    // Check if user is authorized
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add opportunities for this athlete'
      });
    }
    
    // Get career profile or create if it doesn't exist
    let career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      career = await Career.create({
        athlete: athleteId,
        opportunities: []
      });
    }
    
    const newOpportunity = {
      ...req.body,
      addedBy: req.user.id,
      addedAt: Date.now()
    };
    
    career.opportunities.push(newOpportunity);
    await career.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        opportunity: career.opportunities[career.opportunities.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding opportunity for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add opportunity'
    });
  }
};

// Update opportunity
exports.updateOpportunity = async (req, res) => {
  try {
    const { athleteId, opportunityId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get career profile
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    // Find opportunity index
    const opportunityIndex = career.opportunities.findIndex(
      opp => opp._id.toString() === opportunityId
    );
    
    if (opportunityIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Opportunity not found'
      });
    }
    
    // Check if user is authorized
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      career.opportunities[opportunityIndex].addedBy.toString() === req.user.id || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this opportunity'
      });
    }
    
    // Update opportunity
    career.opportunities[opportunityIndex] = {
      ...career.opportunities[opportunityIndex].toObject(),
      ...req.body,
      updatedAt: Date.now()
    };
    
    await career.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        opportunity: career.opportunities[opportunityIndex]
      }
    });
  } catch (error) {
    logger.error(`Error updating opportunity for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update opportunity'
    });
  }
};

// Delete opportunity
exports.deleteOpportunity = async (req, res) => {
  try {
    const { athleteId, opportunityId } = req.params;
    
    // Check if athlete exists
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get career profile
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    // Find opportunity index
    const opportunityIndex = career.opportunities.findIndex(
      opp => opp._id.toString() === opportunityId
    );
    
    if (opportunityIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Opportunity not found'
      });
    }
    
    // Check if user is authorized
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      career.opportunities[opportunityIndex].addedBy.toString() === req.user.id || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this opportunity'
      });
    }
    
    // Remove opportunity
    career.opportunities.splice(opportunityIndex, 1);
    await career.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting opportunity for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete opportunity'
    });
  }
};

// Generate career pathway recommendations
exports.generateCareerRecommendations = async (req, res) => {
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
    
    // Get career profile
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    // In a real application, this would involve complex analysis
    // For this example, we'll create simplified recommendations
    const recommendations = {
      shortTerm: [],
      mediumTerm: [],
      longTerm: [],
      educationPathways: [],
      careerTransitions: []
    };
    
    // Simplified logic for generating recommendations
    // Based on athlete's sport, level, skills, etc.
    
    // Short-term recommendations
    recommendations.shortTerm.push('Focus on upcoming competitions');
    recommendations.shortTerm.push('Work on identified skill gaps');
    
    // Medium-term recommendations
    recommendations.mediumTerm.push('Consider participating in national championships');
    recommendations.mediumTerm.push('Explore sponsorship opportunities');
    
    // Long-term recommendations
    recommendations.longTerm.push('Plan for career transition after competitive years');
    recommendations.longTerm.push('Build personal brand and network');
    
    // Education pathways
    recommendations.educationPathways.push('Sports management degree programs');
    recommendations.educationPathways.push('Coaching certifications');
    
    // Career transitions
    recommendations.careerTransitions.push('Coaching and mentoring');
    recommendations.careerTransitions.push('Sports commentary and analysis');
    recommendations.careerTransitions.push('Sports administration');
    
    res.status(200).json({
      status: 'success',
      data: { recommendations }
    });
  } catch (error) {
    logger.error(`Error generating career recommendations for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate career recommendations'
    });
  }
};

// Get career analytics
exports.getCareerAnalytics = async (req, res) => {
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
    
    // Get career profile
    const career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      return res.status(404).json({
        status: 'fail',
        message: 'Career profile not found for this athlete'
      });
    }
    
    // Calculate analytics
    const analytics = {
      totalCompetitions: career.competitions?.length || 0,
      upcomingCompetitions: 0,
      completedCompetitions: 0,
      winRate: 0,
      skillsBreakdown: {},
      careerProgress: {}
    };
    
    // Count upcoming and completed competitions
    const now = new Date();
    
    if (career.competitions && career.competitions.length > 0) {
      career.competitions.forEach(comp => {
        if (new Date(comp.date) > now) {
          analytics.upcomingCompetitions++;
        } else {
          analytics.completedCompetitions++;
          
          // Count wins for win rate
          if (comp.result && comp.result.toLowerCase().includes('win')) {
            analytics.wins = (analytics.wins || 0) + 1;
          }
        }
      });
      
      // Calculate win rate
      if (analytics.completedCompetitions > 0) {
        analytics.winRate = ((analytics.wins || 0) / analytics.completedCompetitions) * 100;
      }
    }
    
    // Skills breakdown
    if (career.skills && career.skills.length > 0) {
      const skillCategories = {};
      
      career.skills.forEach(skill => {
        if (!skillCategories[skill.category]) {
          skillCategories[skill.category] = {
            count: 0,
            averageRating: 0,
            totalRating: 0
          };
        }
        
        skillCategories[skill.category].count++;
        skillCategories[skill.category].totalRating += skill.rating;
      });
      
      // Calculate average ratings
      Object.keys(skillCategories).forEach(category => {
        skillCategories[category].averageRating = 
          skillCategories[category].totalRating / skillCategories[category].count;
      });
      
      analytics.skillsBreakdown = skillCategories;
    }
    
    // Career progress (simplified)
    analytics.careerProgress = {
      goalsCompleted: 0,
      goalsInProgress: 0,
      totalGoals: career.goals?.length || 0
    };
    
    if (career.goals && career.goals.length > 0) {
      career.goals.forEach(goal => {
        if (goal.status === 'completed') {
          analytics.careerProgress.goalsCompleted++;
        } else if (goal.status === 'in-progress') {
          analytics.careerProgress.goalsInProgress++;
        }
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    logger.error(`Error generating career analytics for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate career analytics'
    });
  }
};

// Upload career document
exports.uploadCareerDocument = async (req, res) => {
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
    
    // Check if user is authorized
    const isAuthorized = 
      athlete.user.toString() === req.user.id || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to upload documents for this athlete'
      });
    }
    
    // Get career profile or create if it doesn't exist
    let career = await Career.findOne({ athlete: athleteId });
    
    if (!career) {
      career = await Career.create({
        athlete: athleteId,
        documents: []
      });
    }
    
    const newDocument = {
      name: req.body.name || req.file.originalname,
      type: req.body.type || 'other',
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      uploadedAt: Date.now()
    };
    
    career.documents.push(newDocument);
    await career.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        document: career.documents[career.documents.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error uploading career document for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload document'
    });
  }
};