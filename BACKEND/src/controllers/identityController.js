// backend/src/controllers/identityController.js
import User from "../models/User.js";
import History from "../models/History.js";
import * as ipfsService from "../services/ipfsService.js";
import { cryptoService } from "../services/cryptoService.js";

// 1️⃣ Submit Identity
export const submitIdentity = async (req, res) => {
  try {
    const { fullName, idNumber, dob, address } = req.body;
    const userId = req.user._id;
    const walletAddress = req.user.walletAddress;

    if (!fullName || !idNumber || !dob || !address) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Encrypt identity data
    const encryptedData = await cryptoService.encryptIdentityData({ fullName, idNumber, dob, address });

    // Create manifest
    const manifest = {
      userId: userId.toString(),
      walletAddress,
      encryptedData,
      submittedAt: new Date().toISOString(),
      files: {}, // document files will be added later
    };

    // Upload JSON to IPFS
    const manifestResult = await ipfsService.uploadJSONToIPFS(manifest, `identity-manifest-${userId}`);
    console.log("IPFS manifest result:", manifestResult);

    if (!manifestResult.success || !manifestResult.cid) {
      return res.status(500).json({ success: false, message: "Failed to upload manifest to IPFS" });
    }

    const mainCID = manifestResult.cid;

    // Update user document
    await User.findByIdAndUpdate(userId, { identityCID: mainCID, kycStatus: "pending" });

    // Log history
    await History.create({
      userId,
      action: "identity_submitted",
      details: { mainCID },
      ipfsCID: mainCID,
    });

    // Return CID to frontend
    return res.status(200).json({
      success: true,
      message: "Identity submitted successfully. Proceed to upload documents.",
      data: { mainCID },
    });

  } catch (err) {
    console.error("submitIdentity error:", err);
    return res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

// 2️⃣ Get Identity
export const getIdentity = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user || !user.identityCID) {
      return res.status(404).json({ success: false, message: "Identity not found" });
    }

    const ipfsData = await ipfsService.getJSONFromIPFS(user.identityCID);
    if (!ipfsData.success) throw new Error("Failed to fetch data from IPFS");

    const decrypted = await cryptoService.decryptIdentityData(ipfsData.data.encryptedData);

    return res.status(200).json({
      success: true,
      message: "Identity retrieved successfully",
      data: {
        identity: decrypted,
        files: ipfsData.data.files,
        walletAddress: ipfsData.data.walletAddress,
      },
    });
  } catch (err) {
    console.error("getIdentity error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3️⃣ Update Identity
export const updateIdentity = async (req, res) => {
  try {
    const userId = req.user._id;
    const walletAddress = req.user.walletAddress;
    const { fullName, idNumber, dob, address } = req.body;

    const encryptedData = await cryptoService.encryptIdentityData({ fullName, idNumber, dob, address });

    const manifest = {
      userId: userId.toString(),
      walletAddress,
      encryptedData,
      updatedAt: new Date().toISOString(),
    };

    const manifestResult = await ipfsService.uploadJSONToIPFS(manifest, `identity-update-${userId}`);
    console.log("IPFS update manifest result:", manifestResult);

    if (!manifestResult.success || !manifestResult.cid) throw new Error("Failed to upload new manifest");

    const newCID = manifestResult.cid;

    await User.findByIdAndUpdate(userId, { identityCID: newCID });

    await History.create({
      userId,
      action: "identity_updated",
      details: { newCID },
      ipfsCID: newCID,
    });

    return res.status(200).json({
      success: true,
      message: "Identity updated successfully",
      data: { newCID },
    });
  } catch (err) {
    console.error("updateIdentity error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to update identity" });
  }
};
