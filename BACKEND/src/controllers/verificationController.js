// backend/src/controllers/verificationController.js
import User from "../models/User.js";
import History from "../models/History.js";
import * as ipfsService from "../services/ipfsService.js";

// ---------------- LIVENESS STEP ----------------
export const livenessStep = async (req, res) => {
  try {
    const userId = req.user._id;
    const step = req.body.step;
    const file = req.file;

    if (!step) return res.status(400).json({ success: false, message: "Missing step" });
    if (!file) return res.status(400).json({ success: false, message: "Missing file" });

    // Upload captured image to IPFS
    const ipfsResult = await ipfsService.uploadFileToIPFS(
      file.buffer,
      `${userId}-${step}-${Date.now()}.png`
    );
    if (!ipfsResult.success) {
      console.error("IPFS upload failed:", ipfsResult.error);
      return res.status(500).json({ success: false, message: "IPFS upload failed" });
    }

    // Save step result
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

    return res.json({
      success: true,
      message: "Step uploaded",
      data: { step, cid: ipfsResult.cid },
    });
  } catch (error) {
    console.error("livenessStep error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Liveness step failed",
    });
  }
};

// ---------------- GET VERIFICATION STATUS ----------------
export const getVerificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Get status from your DB (you can change the field name if needed)
    const status =
      user.verificationStatus ||
      user.verificationData?.status ||
      "pending";

    return res.json({ success: true, status });
  } catch (error) {
    console.error("getVerificationStatus error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get verification status",
    });
  }
};
