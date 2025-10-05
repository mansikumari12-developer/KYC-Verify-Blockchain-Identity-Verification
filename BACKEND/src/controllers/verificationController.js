import User from '../models/User.js';
import History from '../models/History.js';

export const startVerification = async (req, res) => {
  try {
    const userId = req.user._id;

    // Update user verification status
    await User.findByIdAndUpdate(userId, {
      kycStatus: 'pending',
      'verificationData.livenessCheck': false,
      'verificationData.documentCheck': false
    });

    // Log history
    await History.create({
      userId,
      action: 'verification_started',
      details: {
        type: 'liveness_check'
      }
    });

    // In a real implementation, integrate with a liveness check service
    // For now, simulate starting the process

    res.json({
      success: true,
      message: 'Verification process started',
      data: {
        verificationId: `verify_${Date.now()}`,
        nextStep: 'liveness_check',
        instructions: 'Please complete the liveness check'
      }
    });
  } catch (error) {
    console.error('Start verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start verification',
      error: error.message
    });
  }
};

export const completeVerification = async (req, res) => {
  try {
    const { verificationId, livenessResult, documentResult } = req.body;
    const userId = req.user._id;

    // Update verification status based on results
    const updateData = {
      'verificationData.livenessCheck': livenessResult === 'success',
      'verificationData.documentCheck': documentResult === 'success'
    };

    if (livenessResult === 'success' && documentResult === 'success') {
      updateData.kycStatus = 'verified';
      updateData.isVerified = true;
      updateData['verificationData.verifiedAt'] = new Date();
    } else if (livenessResult === 'failed' || documentResult === 'failed') {
      updateData.kycStatus = 'rejected';
    }

    await User.findByIdAndUpdate(userId, updateData);

    // Log history
    await History.create({
      userId,
      action: 'verification_completed',
      details: {
        verificationId,
        livenessResult,
        documentResult,
        finalStatus: updateData.kycStatus
      }
    });

    const user = await User.findById(userId);

    res.json({
      success: true,
      message: 'Verification completed',
      data: {
        status: user.kycStatus,
        isVerified: user.isVerified,
        livenessCheck: user.verificationData.livenessCheck,
        documentCheck: user.verificationData.documentCheck,
        verifiedAt: user.verificationData.verifiedAt
      }
    });
  } catch (error) {
    console.error('Complete verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete verification',
      error: error.message
    });
  }
};

export const getVerificationStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('kycStatus isVerified verificationData name email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email
        },
        kycStatus: user.kycStatus,
        isVerified: user.isVerified,
        verificationData: user.verificationData
      }
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification status',
      error: error.message
    });
  }
};