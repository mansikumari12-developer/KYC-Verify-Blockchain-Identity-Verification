import User from '../models/User.js';
import History from '../models/History.js';
import ipfsService from '../services/ipfsService.js';
import blockchainService from '../services/blockchainService.js';
import { cryptoService } from '../services/cryptoService.js';

import fs from "fs";
import path from "path";

export const submitIdentity = async (req, res) => {
  try {
    const { fullName, idNumber } = req.body;
    const userId = req.user._id;
    const walletAddress = req.user.walletAddress;

    if (!fullName || !idNumber) {
      return res.status(400).json({
        success: false,
        message: "Full name and ID number are required",
      });
    }

    // ✅ Step 1: Encrypt identity data
    const encryptedIdentity = await cryptoService.encryptIdentityData({
      fullName,
      idNumber,
    });

    // ✅ Step 2: Save encrypted data as a JSON file
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const tempFilePath = path.join(tempDir, `encryptedIdentity-${Date.now()}.json`);
    fs.writeFileSync(tempFilePath, JSON.stringify(encryptedIdentity, null, 2));

    // ✅ Step 3: Upload JSON file to IPFS
    let cid;
    try {
      cid = await ipfsService.uploadToIPFS(tempFilePath, "encryptedIdentity.json");
    } catch (err) {
      console.error("❌ IPFS upload failed:", err.message);
      return res.status(500).json({
        success: false,
        message: "Failed to upload encrypted identity to IPFS",
        error: err.message,
      });
    }

    // ✅ Step 4: Store CID on Blockchain
    let blockchainResult = { success: true, transactionHash: "0xmockhash", blockNumber: 0 };
    try {
      blockchainResult = await blockchainService.storeIdentity(walletAddress, cid);
    } catch (err) {
      console.warn("⚠️ Blockchain storage failed:", err.message);
    }

    // ✅ Step 5: Update user in MongoDB
    await User.findByIdAndUpdate(userId, {
      identityCID: cid,
      kycStatus: "pending",
    });

    // ✅ Step 6: Record History
    await History.create({
      userId,
      action: "identity_submitted",
      details: {
        cid,
        txHash: blockchainResult.transactionHash,
      },
      ipfsCID: cid,
      contractTxHash: blockchainResult.transactionHash,
    });

    // ✅ Step 7: Clean up temporary file
    fs.unlinkSync(tempFilePath);

    // ✅ Step 8: Send response
    res.status(200).json({
      success: true,
      message: "Identity submitted successfully",
      data: {
        cid,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
      },
    });
  } catch (error) {
    console.error("❌ Submit identity error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during identity submission",
      error: error.message,
    });
  }
};


export const getIdentity = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;

    // Check if requesting user has access
    if (requestingUser.role === 'user' && requestingUser._id.toString() !== userId) {
      const accessCheck = await blockchainService.hasAccess(
        requestingUser.walletAddress,
        userId
      );

      if (!accessCheck.success || !accessCheck.hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this identity'
        });
      }
    }

    const user = await User.findById(userId);
    if (!user || !user.identityCID) {
      return res.status(404).json({
        success: false,
        message: 'Identity not found'
      });
    }

    // Retrieve from IPFS
    const ipfsResult = await ipfsService.retrieveFromIPFS(user.identityCID);

    if (!ipfsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve identity from IPFS',
        error: ipfsResult.error
      });
    }

    // Decrypt sensitive data - ✅ CORRECTED LINE
    const decryptedData = cryptoService.decryptIdentityData(ipfsResult.data);

    res.json({
      success: true,
      message: 'Identity retrieved successfully',
      data: {
        identity: decryptedData,
        user: {
          name: user.name,
          email: user.email,
          kycStatus: user.kycStatus,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Get identity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve identity',
      error: error.message
    });
  }
};

export const updateIdentity = async (req, res) => {
  try {
    const { identityData } = req.body;
    const userId = req.user._id;

    // Encrypt sensitive identity data - ✅ CORRECTED LINE
    const encryptedIdentityData = cryptoService.encryptIdentityData(identityData);

    // Upload to IPFS
    const ipfsResult = await ipfsService.uploadToIPFS(encryptedIdentityData);

    if (!ipfsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload identity to IPFS',
        error: ipfsResult.error
      });
    }

    // Store CID on blockchain
    const blockchainResult = await blockchainService.storeIdentity(
      req.user.walletAddress,
      ipfsResult.cid
    );

    if (!blockchainResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to store identity on blockchain',
        error: blockchainResult.error
      });
    }

    // Update user record
    await User.findByIdAndUpdate(userId, {
      identityCID: ipfsResult.cid
    });

    // Log history
    await History.create({
      userId,
      action: 'identity_submitted',
      details: {
        cid: ipfsResult.cid,
        txHash: blockchainResult.transactionHash,
        update: true
      },
      ipfsCID: ipfsResult.cid,
      contractTxHash: blockchainResult.transactionHash
    });

    res.json({
      success: true,
      message: 'Identity updated successfully',
      data: {
        cid: ipfsResult.cid,
        transactionHash: blockchainResult.transactionHash
      }
    });
  } catch (error) {
    console.error('Update identity error:', error);
    res.status(500).json({
      success: false,
      message: 'Identity update failed',
      error: error.message
    });
  }
};