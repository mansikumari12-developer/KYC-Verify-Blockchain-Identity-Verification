// backend/src/controllers/uploadController.js
import multer from 'multer';
import User from '../models/User.js';
import History from '../models/History.js';
import * as ipfsService from '../services/ipfsService.js';

// ✅ Multer memory storage for files
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only JPEG, PNG, and PDF allowed.'));
  }
});

// ✅ Single or multiple file upload middleware
export const uploadMiddleware = upload.array('documents'); // use "documents" key for multiple files

// ✅ Upload documents
export const uploadDocument = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: 'No files uploaded' });

    const userId = req.user._id;

    const uploadedFiles = [];

    for (const file of req.files) {
      const ipfsResult = await ipfsService.uploadFileToIPFS(file.buffer, file.originalname);
      if (!ipfsResult.success)
        return res.status(500).json({ success: false, message: 'Failed to upload to IPFS' });

      // Save to user documents
      await User.findByIdAndUpdate(userId, {
        $push: {
          documents: {
            name: file.originalname,
            cid: ipfsResult.cid,
            type: file.mimetype
          }
        }
      });

      // Log history
      await History.create({
        userId,
        action: 'document_uploaded',
        details: { documentName: file.originalname, cid: ipfsResult.cid },
        ipfsCID: ipfsResult.cid
      });

      uploadedFiles.push({ name: file.originalname, cid: ipfsResult.cid });
    }

    res.json({
      success: true,
      message: 'All documents uploaded successfully',
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ success: false, message: 'Document upload failed', error: error.message });
  }
};
