import multer from "multer";
import User from "../models/User.js";
import History from "../models/History.js";
import * as ipfsService from "../services/ipfsService.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type"));
  },
});

export const uploadMiddleware = upload.array("documents"); // 👈 match frontend

export const uploadDocument = async (req, res) => {
  try {
    if (!req.files?.length)
      return res.status(400).json({ success: false, message: "No files uploaded" });

    const userId = req.user._id;
    const uploadedFiles = [];

    for (const file of req.files) {
      const ipfsResult = await ipfsService.uploadFileToIPFS(file.buffer, file.originalname);
      if (!ipfsResult.success)
        return res.status(500).json({ success: false, message: "IPFS upload failed" });

      await User.findByIdAndUpdate(userId, {
        $push: {
          documents: {
            name: file.originalname,
            cid: ipfsResult.cid,
            type: file.mimetype,
          },
        },
      });

      await History.create({
        userId,
        action: "document_uploaded",
        details: { name: file.originalname },
        ipfsCID: ipfsResult.cid,
      });

      uploadedFiles.push({ name: file.originalname, cid: ipfsResult.cid });
    }

    res.json({
      success: true,
      message: "Documents uploaded successfully",
      data: uploadedFiles,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }
};
