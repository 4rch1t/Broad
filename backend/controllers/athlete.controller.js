const Athlete = require('../models/athlete.model');
const logger = require('../utils/logger');

// Get all athletes
exports.getAllAthletes = async (req, res) => {
  try {
    const athletes = await Athlete.find().populate('user', 'name email');
    res.status(200).json({
      status: 'success',
      results: athletes.length,
      data: { athletes }
    });
  } catch (error) {
    logger.error('Error fetching athletes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch athletes'
    });
  }
};

// Get athlete by ID
exports.getAthleteById = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id).populate('user', 'name email');
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { athlete }
    });
  } catch (error) {
    logger.error(`Error fetching athlete ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch athlete'
    });
  }
};

// Create athlete profile
exports.createAthleteProfile = async (req, res) => {
  try {
    // Check if athlete profile already exists for this user
    const existingAthlete = await Athlete.findOne({ user: req.user.id });
    
    if (existingAthlete) {
      return res.status(400).json({
        status: 'fail',
        message: 'Athlete profile already exists for this user'
      });
    }

    // Create new athlete profile
    const newAthlete = await Athlete.create({
      user: req.user.id,
      ...req.body
    });

    res.status(201).json({
      status: 'success',
      data: { athlete: newAthlete }
    });
  } catch (error) {
    logger.error('Error creating athlete profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create athlete profile'
    });
  }
};

// Update athlete profile
exports.updateAthleteProfile = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    // Check if user is authorized to update this profile
    if (athlete.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this profile'
      });
    }

    const updatedAthlete = await Athlete.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { athlete: updatedAthlete }
    });
  } catch (error) {
    logger.error(`Error updating athlete ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update athlete profile'
    });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file uploaded'
      });
    }

    const athlete = await Athlete.findById(req.params.id);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    // Check if user is authorized
    if (athlete.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this profile'
      });
    }

    // Update profile picture URL
    athlete.profilePicture = `/uploads/${req.file.filename}`;
    await athlete.save();

    res.status(200).json({
      status: 'success',
      data: {
        profilePicture: athlete.profilePicture
      }
    });
  } catch (error) {
    logger.error(`Error uploading profile picture for athlete ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload profile picture'
    });
  }
};

// Add achievement
exports.addAchievement = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    // Check if user is authorized
    if (athlete.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'coach') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this profile'
      });
    }

    athlete.achievements.push(req.body);
    await athlete.save();

    res.status(201).json({
      status: 'success',
      data: {
        achievement: athlete.achievements[athlete.achievements.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding achievement for athlete ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add achievement'
    });
  }
};

// Update achievement
exports.updateAchievement = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    // Check if user is authorized
    if (athlete.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'coach') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this profile'
      });
    }

    const achievementIndex = athlete.achievements.findIndex(
      ach => ach._id.toString() === req.params.achievementId
    );

    if (achievementIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Achievement not found'
      });
    }

    athlete.achievements[achievementIndex] = {
      ...athlete.achievements[achievementIndex].toObject(),
      ...req.body
    };

    await athlete.save();

    res.status(200).json({
      status: 'success',
      data: {
        achievement: athlete.achievements[achievementIndex]
      }
    });
  } catch (error) {
    logger.error(`Error updating achievement for athlete ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update achievement'
    });
  }
};

// Delete achievement
exports.deleteAchievement = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    // Check if user is authorized
    if (athlete.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'coach') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this profile'
      });
    }

    const achievementIndex = athlete.achievements.findIndex(
      ach => ach._id.toString() === req.params.achievementId
    );

    if (achievementIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Achievement not found'
      });
    }

    athlete.achievements.splice(achievementIndex, 1);
    await athlete.save();

    res.status(200).json({
      status: 'success',
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting achievement for athlete ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete achievement'
    });
  }
};

// Add document
exports.addDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file uploaded'
      });
    }

    const athlete = await Athlete.findById(req.params.id);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    // Check if user is authorized
    if (athlete.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this profile'
      });
    }

    const newDocument = {
      name: req.body.name || req.file.originalname,
      type: req.body.type || 'other',
      url: `/uploads/${req.file.filename}`,
      uploadedAt: Date.now()
    };

    athlete.documents.push(newDocument);
    await athlete.save();

    res.status(201).json({
      status: 'success',
      data: {
        document: athlete.documents[athlete.documents.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding document for athlete ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add document'
    });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    // Check if user is authorized
    if (athlete.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this profile'
      });
    }

    const documentIndex = athlete.documents.findIndex(
      doc => doc._id.toString() === req.params.documentId
    );

    if (documentIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Document not found'
      });
    }

    // TODO: Delete file from storage (S3, etc.)

    athlete.documents.splice(documentIndex, 1);
    await athlete.save();

    res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting document for athlete ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete document'
    });
  }
};

// Add coach
exports.addCoach = async (req, res) => {
  try {
    const { coachId } = req.body;
    
    if (!coachId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Coach ID is required'
      });
    }

    const athlete = await Athlete.findById(req.params.id);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    // Check if user is authorized
    if (athlete.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this profile'
      });
    }

    // Check if coach is already added
    if (athlete.coaches.includes(coachId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Coach is already added to this athlete'
      });
    }

    athlete.coaches.push(coachId);
    await athlete.save();

    res.status(200).json({
      status: 'success',
      message: 'Coach added successfully'
    });
  } catch (error) {
    logger.error(`Error adding coach for athlete ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add coach'
    });
  }
};

// Remove coach
exports.removeCoach = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    // Check if user is authorized
    if (athlete.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this profile'
      });
    }

    const coachIndex = athlete.coaches.indexOf(req.params.coachId);

    if (coachIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Coach not found for this athlete'
      });
    }

    athlete.coaches.splice(coachIndex, 1);
    await athlete.save();

    res.status(200).json({
      status: 'success',
      message: 'Coach removed successfully'
    });
  } catch (error) {
    logger.error(`Error removing coach for athlete ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove coach'
    });
  }
};

// Get athlete statistics
exports.getAthleteStatistics = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    // Here you would typically aggregate data from performance, injury, etc.
    // For now, we'll return a placeholder
    const statistics = {
      totalAchievements: athlete.achievements.length,
      totalDocuments: athlete.documents.length,
      // Add more statistics as needed
    };

    res.status(200).json({
      status: 'success',
      data: { statistics }
    });
  } catch (error) {
    logger.error(`Error fetching statistics for athlete ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch athlete statistics'
    });
  }
};

// Search athletes
exports.searchAthletes = async (req, res) => {
  try {
    const { query, sport, country, verified } = req.query;
    
    const searchQuery = {};
    
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { 'personalInfo.nickname': { $regex: query, $options: 'i' } }
      ];
    }
    
    if (sport) {
      searchQuery.sport = sport;
    }
    
    if (country) {
      searchQuery['personalInfo.country'] = country;
    }
    
    if (verified) {
      searchQuery.verified = verified === 'true';
    }
    
    const athletes = await Athlete.find(searchQuery).populate('user', 'name email');
    
    res.status(200).json({
      status: 'success',
      results: athletes.length,
      data: { athletes }
    });
  } catch (error) {
    logger.error('Error searching athletes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search athletes'
    });
  }
};

// Verify athlete
exports.verifyAthlete = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    athlete.verified = true;
    athlete.verifiedAt = Date.now();
    athlete.verifiedBy = req.user.id;
    
    await athlete.save();

    res.status(200).json({
      status: 'success',
      message: 'Athlete verified successfully',
      data: {
        verified: athlete.verified,
        verifiedAt: athlete.verifiedAt
      }
    });
  } catch (error) {
    logger.error(`Error verifying athlete ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify athlete'
    });
  }
};