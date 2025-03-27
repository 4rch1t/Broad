const Performance = require('../models/performance.model');
const Athlete = require('../models/athlete.model');
const logger = require('../utils/logger');

// Get all performance records for an athlete
exports.getAthletePerformance = async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { startDate, endDate, type } = req.query;
    
    const query = { athlete: athleteId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (type) {
      query.type = type;
    }
    
    const performances = await Performance.find(query).sort({ date: -1 });
    
    res.status(200).json({
      status: 'success',
      results: performances.length,
      data: { performances }
    });
  } catch (error) {
    logger.error(`Error fetching performance records for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch performance records'
    });
  }
};

// Get performance record by ID
exports.getPerformanceById = async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id);
    
    if (!performance) {
      return res.status(404).json({
        status: 'fail',
        message: 'Performance record not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { performance }
    });
  } catch (error) {
    logger.error(`Error fetching performance record ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch performance record'
    });
  }
};

// Create performance record
exports.createPerformanceRecord = async (req, res) => {
  try {
    // Check if athlete exists
    const athlete = await Athlete.findById(req.body.athlete);
    
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
        message: 'You are not authorized to add performance records for this athlete'
      });
    }

    const newPerformance = await Performance.create({
      ...req.body,
      recordedBy: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: { performance: newPerformance }
    });
  } catch (error) {
    logger.error('Error creating performance record:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create performance record'
    });
  }
};

// Update performance record
exports.updatePerformanceRecord = async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id);
    
    if (!performance) {
      return res.status(404).json({
        status: 'fail',
        message: 'Performance record not found'
      });
    }

    // Check if athlete exists
    const athlete = await Athlete.findById(performance.athlete);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    // Check if user is authorized (person who recorded it, athlete themselves, their coach, or admin)
    const isAuthorized = 
      performance.recordedBy.toString() === req.user.id ||
      athlete.user.toString() === req.user.id || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this performance record'
      });
    }

    const updatedPerformance = await Performance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { performance: updatedPerformance }
    });
  } catch (error) {
    logger.error(`Error updating performance record ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update performance record'
    });
  }
};

// Delete performance record
exports.deletePerformanceRecord = async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id);
    
    if (!performance) {
      return res.status(404).json({
        status: 'fail',
        message: 'Performance record not found'
      });
    }

    // Check if athlete exists
    const athlete = await Athlete.findById(performance.athlete);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    // Check if user is authorized (person who recorded it, athlete themselves, their coach, or admin)
    const isAuthorized = 
      performance.recordedBy.toString() === req.user.id ||
      athlete.user.toString() === req.user.id || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this performance record'
      });
    }

    await Performance.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Performance record deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting performance record ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete performance record'
    });
  }
};

// Upload video analysis
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file uploaded'
      });
    }

    const performance = await Performance.findById(req.params.id);
    
    if (!performance) {
      return res.status(404).json({
        status: 'fail',
        message: 'Performance record not found'
      });
    }

    // Check if athlete exists
    const athlete = await Athlete.findById(performance.athlete);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    // Check if user is authorized
    const isAuthorized = 
      performance.recordedBy.toString() === req.user.id ||
      athlete.user.toString() === req.user.id || 
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to upload videos for this performance record'
      });
    }

    const newVideo = {
      title: req.body.title || 'Performance Video',
      description: req.body.description || '',
      url: `/uploads/${req.file.filename}`,
      uploadedAt: Date.now(),
      uploadedBy: req.user.id
    };

    performance.videos.push(newVideo);
    await performance.save();

    res.status(201).json({
      status: 'success',
      data: {
        video: performance.videos[performance.videos.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error uploading video for performance record ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload video'
    });
  }
};

// Add video annotation
exports.addVideoAnnotation = async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id);
    
    if (!performance) {
      return res.status(404).json({
        status: 'fail',
        message: 'Performance record not found'
      });
    }

    const videoIndex = performance.videos.findIndex(
      video => video._id.toString() === req.params.videoId
    );

    if (videoIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Video not found'
      });
    }

    // Check if athlete exists
    const athlete = await Athlete.findById(performance.athlete);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }

    // Check if user is authorized
    const isAuthorized = 
      performance.recordedBy.toString() === req.user.id ||
      athlete.coaches.includes(req.user.id) || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add annotations to this video'
      });
    }

    const newAnnotation = {
      timestamp: req.body.timestamp,
      text: req.body.text,
      createdBy: req.user.id,
      createdAt: Date.now()
    };

    if (!performance.videos[videoIndex].annotations) {
      performance.videos[videoIndex].annotations = [];
    }

    performance.videos[videoIndex].annotations.push(newAnnotation);
    await performance.save();

    res.status(201).json({
      status: 'success',
      data: {
        annotation: performance.videos[videoIndex].annotations[
          performance.videos[videoIndex].annotations.length - 1
        ]
      }
    });
  } catch (error) {
    logger.error(`Error adding annotation to video for performance record ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add annotation'
    });
  }
};

// Get performance analytics
exports.getPerformanceAnalytics = async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { period } = req.query; // e.g., 'week', 'month', 'year'
    
    // Calculate date range based on period
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        // Default to last 30 days
        startDate.setDate(startDate.getDate() - 30);
    }
    
    // Get performance records in date range
    const performances = await Performance.find({
      athlete: athleteId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    // Process data for analytics
    // This is a simplified example - in a real app, you'd do more complex aggregations
    const analytics = {
      totalRecords: performances.length,
      averageScores: {},
      trends: {},
      // Add more analytics as needed
    };
    
    // Calculate averages for different metrics
    if (performances.length > 0) {
      const metrics = Object.keys(performances[0].metrics || {});
      
      metrics.forEach(metric => {
        const values = performances
          .filter(p => p.metrics && p.metrics[metric] !== undefined)
          .map(p => p.metrics[metric]);
        
        if (values.length > 0) {
          const sum = values.reduce((a, b) => a + b, 0);
          analytics.averageScores[metric] = sum / values.length;
        }
      });
      
      // Calculate trends (simplified)
      metrics.forEach(metric => {
        if (performances.length >= 2) {
          const firstValue = performances[0].metrics?.[metric];
          const lastValue = performances[performances.length - 1].metrics?.[metric];
          
          if (firstValue !== undefined && lastValue !== undefined) {
            analytics.trends[metric] = {
              change: lastValue - firstValue,
              percentChange: ((lastValue - firstValue) / firstValue) * 100
            };
          }
        }
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    logger.error(`Error generating performance analytics for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate performance analytics'
    });
  }
};

// Compare with benchmarks
exports.compareWithBenchmarks = async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    // Get athlete details
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // Get recent performance records
    const performances = await Performance.find({
      athlete: athleteId
    }).sort({ date: -1 }).limit(10);
    
    // This would typically involve comparing against benchmark data
    // For this example, we'll create a simplified comparison
    const comparison = {
      athlete: {
        name: athlete.name,
        sport: athlete.sport,
        level: athlete.level
      },
      metrics: {},
      benchmarks: {},
      percentiles: {}
    };
    
    // Simplified benchmark data (in a real app, this would come from a database)
    const benchmarks = {
      speed: { average: 15, top: 20 },
      strength: { average: 70, top: 90 },
      endurance: { average: 65, top: 85 }
      // Add more benchmark metrics as needed
    };
    
    // Calculate athlete's average metrics
    if (performances.length > 0) {
      const metrics = Object.keys(performances[0].metrics || {});
      
      metrics.forEach(metric => {
        const values = performances
          .filter(p => p.metrics && p.metrics[metric] !== undefined)
          .map(p => p.metrics[metric]);
        
        if (values.length > 0) {
          const sum = values.reduce((a, b) => a + b, 0);
          const athleteAverage = sum / values.length;
          
          comparison.metrics[metric] = athleteAverage;
          
          // Compare with benchmarks if available
          if (benchmarks[metric]) {
            comparison.benchmarks[metric] = benchmarks[metric];
            
            // Calculate percentile (simplified)
            const percentile = (athleteAverage / benchmarks[metric].top) * 100;
            comparison.percentiles[metric] = Math.min(100, percentile);
          }
        }
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { comparison }
    });
  } catch (error) {
    logger.error(`Error comparing performance with benchmarks for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to compare with benchmarks'
    });
  }
};

// Get performance trends
exports.getPerformanceTrends = async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { metric, period, interval } = req.query;
    
    // Default to last 6 months if not specified
    const endDate = new Date();
    let startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (period ? parseInt(period) : 6));
    
    // Get all performances in the date range
    const performances = await Performance.find({
      athlete: athleteId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    // Group by interval (e.g., week, month)
    const groupedData = {};
    
    performances.forEach(performance => {
      let intervalKey;
      const date = new Date(performance.date);
      
      switch (interval) {
        case 'week':
          // Get week number
          const onejan = new Date(date.getFullYear(), 0, 1);
          const weekNum = Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
          intervalKey = `${date.getFullYear()}-W${weekNum}`;
          break;
        case 'month':
          intervalKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        default:
          // Default to day
          intervalKey = date.toISOString().split('T')[0];
      }
      
      if (!groupedData[intervalKey]) {
        groupedData[intervalKey] = [];
      }
      
      groupedData[intervalKey].push(performance);
    });
    
    // Calculate averages for each interval
    const trends = Object.keys(groupedData).map(intervalKey => {
      const intervalPerformances = groupedData[intervalKey];
      const averages = {};
      
      // If a specific metric is requested, only calculate that one
      if (metric) {
        const values = intervalPerformances
          .filter(p => p.metrics && p.metrics[metric] !== undefined)
          .map(p => p.metrics[metric]);
        
        if (values.length > 0) {
          const sum = values.reduce((a, b) => a + b, 0);
          averages[metric] = sum / values.length;
        }
      } else {
        // Calculate averages for all metrics
        const allMetrics = new Set();
        
        // Collect all metric keys
        intervalPerformances.forEach(p => {
          if (p.metrics) {
            Object.keys(p.metrics).forEach(key => allMetrics.add(key));
          }
        });
        
        // Calculate average for each metric
        allMetrics.forEach(metricKey => {
          const values = intervalPerformances
            .filter(p => p.metrics && p.metrics[metricKey] !== undefined)
            .map(p => p.metrics[metricKey]);
          
          if (values.length > 0) {
            const sum = values.reduce((a, b) => a + b, 0);
            averages[metricKey] = sum / values.length;
          }
        });
      }
      
      return {
        interval: intervalKey,
        averages
      };
    });
    
    res.status(200).json({
      status: 'success',
      data: { trends }
    });
  } catch (error) {
    logger.error(`Error generating performance trends for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate performance trends'
    });
  }
};

// Add skill assessment
exports.addSkillAssessment = async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id);
    
    if (!performance) {
      return res.status(404).json({
        status: 'fail',
        message: 'Performance record not found'
      });
    }

    // Check if athlete exists
    const athlete = await Athlete.findById(performance.athlete);
    
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
        message: 'You are not authorized to add skill assessments'
      });
    }

    const newAssessment = {
      ...req.body,
      assessedBy: req.user.id,
      assessedAt: Date.now()
    };

    if (!performance.skillAssessments) {
      performance.skillAssessments = [];
    }

    performance.skillAssessments.push(newAssessment);
    await performance.save();

    res.status(201).json({
      status: 'success',
      data: {
        assessment: performance.skillAssessments[performance.skillAssessments.length - 1]
      }
    });
  } catch (error) {
    logger.error(`Error adding skill assessment to performance record ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add skill assessment'
    });
  }
};

// Update skill assessment
exports.updateSkillAssessment = async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id);
    
    if (!performance) {
      return res.status(404).json({
        status: 'fail',
        message: 'Performance record not found'
      });
    }

    const assessmentIndex = performance.skillAssessments?.findIndex(
      assessment => assessment._id.toString() === req.params.assessmentId
    );

    if (assessmentIndex === -1 || assessmentIndex === undefined) {
      return res.status(404).json({
        status: 'fail',
        message: 'Skill assessment not found'
      });
    }

    // Check if user is authorized (person who created the assessment or admin)
    const isAuthorized = 
      performance.skillAssessments[assessmentIndex].assessedBy.toString() === req.user.id || 
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this skill assessment'
      });
    }

    performance.skillAssessments[assessmentIndex] = {
      ...performance.skillAssessments[assessmentIndex].toObject(),
      ...req.body,
      updatedAt: Date.now()
    };

    await performance.save();

    res.status(200).json({
      status: 'success',
      data: {
        assessment: performance.skillAssessments[assessmentIndex]
      }
    });
  } catch (error) {
    logger.error(`Error updating skill assessment for performance record ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update skill assessment'
    });
  }
};

// Get performance recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    // Get recent performance records
    const performances = await Performance.find({
      athlete: athleteId
    }).sort({ date: -1 }).limit(10);
    
    // Get athlete details
    const athlete = await Athlete.findById(athleteId);
    
    if (!athlete) {
      return res.status(404).json({
        status: 'fail',
        message: 'Athlete not found'
      });
    }
    
    // In a real application, this would involve complex analysis
    // For this example, we'll create simplified recommendations
    const recommendations = {
      strengths: [],
      areasForImprovement: [],
      trainingRecommendations: [],
      nutritionRecommendations: []
    };
    
    // Simplified logic for generating recommendations
    if (performances.length > 0) {
      // Analyze metrics to identify strengths and weaknesses
      const metrics = {};
      
      performances.forEach(performance => {
        if (performance.metrics) {
          Object.entries(performance.metrics).forEach(([key, value]) => {
            if (!metrics[key]) {
              metrics[key] = [];
            }
            metrics[key].push(value);
          });
        }
      });
      
      // Calculate averages
      const averages = {};
      Object.entries(metrics).forEach(([key, values]) => {
        const sum = values.reduce((a, b) => a + b, 0);
        averages[key] = sum / values.length;
      });
      
      // Simplified threshold-based recommendations
      Object.entries(averages).forEach(([metric, value]) => {
        // These thresholds would be sport-specific in a real application
        if (value > 80) {
          recommendations.strengths.push(`Strong performance in ${metric}`);
        } else if (value < 50) {
          recommendations.areasForImprovement.push(`Focus on improving ${metric}`);
          recommendations.trainingRecommendations.push(`Increase training frequency for ${metric}`);
        }
      });
      
      // Add some generic recommendations
      recommendations.trainingRecommendations.push('Maintain consistent training schedule');
      recommendations.nutritionRecommendations.push('Ensure adequate protein intake for recovery');
      recommendations.nutritionRecommendations.push('Stay hydrated during training sessions');
    } else {
      recommendations.trainingRecommendations.push('Record more performance data for personalized recommendations');
    }
    
    res.status(200).json({
      status: 'success',
      data: { recommendations }
    });
  } catch (error) {
    logger.error(`Error generating recommendations for athlete ${req.params.athleteId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate recommendations'
    });
  }
};