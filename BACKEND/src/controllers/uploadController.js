import multer from 'multer';
import User from '../models/User.js';
import History from '../models/History.js';
import ipfsService from '../services/ipfsService.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  }
});

export const uploadMiddleware = upload.single('document');

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { documentType } = req.body;
    const userId = req.user._id;

    // Upload to IPFS
    const ipfsResult = await ipfsService.uploadFileToIPFS(
      req.file.buffer,
      req.file.originalname
    );

    if (!ipfsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload document to IPFS',
        error: ipfsResult.error
      });
    }

    // Update user's documents
    await User.findByIdAndUpdate(userId, {
      $push: {
        documents: {
          name: req.file.originalname,
          type: documentType || 'general',
          cid: ipfsResult.cid
        }
      }
    });

    // Log history
    await History.create({
      userId,
      action: 'document_uploaded',
      details: {
        documentName: req.file.originalname,
        documentType: documentType || 'general',
        cid: ipfsResult.cid
      },
      ipfsCID: ipfsResult.cid
    });

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        cid: ipfsResult.cid,
        fileName: req.file.originalname,
        timestamp: ipfsResult.timestamp
      }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Document upload failed',
      error: error.message
    });
  }
};

export const getDocument = async (req, res) => {
  try {
    const { cid } = req.params;

    // In a real implementation, you would retrieve from IPFS
    // For now, return the gateway URL
    const gatewayURL = `https://gateway.pinata.cloud/ipfs/${cid}`;

    res.json({
      success: true,
      data: {
        url: gatewayURL,
        cid: cid
      }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document',
      error: error.message
    });
  }
};