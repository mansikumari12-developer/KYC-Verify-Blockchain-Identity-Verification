// backend/src/controllers/verificationController.js
import User from "../models/User.js";
import History from "../models/History.js";
import * as ipfsService from "../services/ipfsService.js";

// LIVENESS STEP: accepts multipart/form-data with 'step' and 'file'
// Use multer in route to populate req.file
export const livenessStep = async (req, res) => {
  try {
    const userId = req.user._id;
    const step = req.body.step;
    const file = req.file;

    if (!step) return res.status(400).json({ success: false, message: "Missing step" });
    if (!file) return res.status(400).json({ success: false, message: "Missing file" });

    // Upload captured image to IPFS (file.buffer)
    const ipfsResult = await ipfsService.uploadFileToIPFS(file.buffer, `${userId}-${step}-${Date.now()}.png`);
    if (!ipfsResult.success) {
      console.error("IPFS upload failed:", ipfsResult.error);
      return res.status(500).json({ success: false, message: "IPFS upload failed" });
    }

    // Save step result to user.verificationData.livenessSteps (array of objects)
    await User.findByIdAndUpdate(userId, {
      $push: {
        "verificationData.livenessSteps": {
          step,
          cid: ipfsResult.cid,
          uploadedAt: new Date(),
        },
      },
    });

    // Log history
    await History.create({
      userId,
      action: "liveness_step_submitted",
      details: { step, cid: ipfsResult.cid },
      ipfsCID: ipfsResult.cid,
    });

    return res.json({ success: true, message: "Step uploaded", data: { step, cid: ipfsResult.cid } });
  } catch (error) {
    console.error("livenessStep error:", error);
    return res.status(500).json({ success: false, message: error.message || "Liveness step failed" });
  }
};
