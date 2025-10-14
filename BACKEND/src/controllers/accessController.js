import User from "../models/User.js";
import History from "../models/History.js";
import * as blockchainService from "../services/blockchainService.js"; // ✅ updated import

// =========================
// 🚀 Grant Access
// =========================
export const grantAccess = async (req, res) => {
  try {
    const { targetUserId, orgWallet } = req.body;
    const grantingUser = req.user;

    // ✅ Only orgs/admins can grant access
    if (grantingUser.role !== "org" && grantingUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only organizations can grant access",
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found",
      });
    }

    // ✅ Call blockchain grant function
    const blockchainResult = await blockchainService.grantAccess(
      orgWallet || grantingUser.walletAddress,
      targetUser.walletAddress
    );

    if (!blockchainResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to grant access on blockchain",
        error: blockchainResult.error,
      });
    }

    // ✅ Log history
    await History.create({
      userId: targetUserId,
      action: "access_granted",
      details: {
        grantedBy: grantingUser._id,
        organization: orgWallet || grantingUser.walletAddress,
        txHash: blockchainResult.transactionHash,
      },
      organization: orgWallet || grantingUser.walletAddress,
      contractTxHash: blockchainResult.transactionHash,
    });

    res.json({
      success: true,
      message: "Access granted successfully",
      data: {
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        organization: orgWallet || grantingUser.walletAddress,
        targetUser: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
        },
      },
    });
  } catch (error) {
    console.error("Grant access error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to grant access",
      error: error.message,
    });
  }
};

// =========================
// 🚫 Revoke Access
// =========================
export const revokeAccess = async (req, res) => {
  try {
    const { targetUserId, orgWallet } = req.body;
    const revokingUser = req.user;

    if (revokingUser.role !== "org" && revokingUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only organizations can revoke access",
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found",
      });
    }

    const blockchainResult = await blockchainService.revokeAccess(
      orgWallet || revokingUser.walletAddress,
      targetUser.walletAddress
    );

    if (!blockchainResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to revoke access on blockchain",
        error: blockchainResult.error,
      });
    }

    await History.create({
      userId: targetUserId,
      action: "access_revoked",
      details: {
        revokedBy: revokingUser._id,
        organization: orgWallet || revokingUser.walletAddress,
        txHash: blockchainResult.transactionHash,
      },
      organization: orgWallet || revokingUser.walletAddress,
      contractTxHash: blockchainResult.transactionHash,
    });

    res.json({
      success: true,
      message: "Access revoked successfully",
      data: {
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        organization: orgWallet || revokingUser.walletAddress,
        targetUser: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
        },
      },
    });
  } catch (error) {
    console.error("Revoke access error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to revoke access",
      error: error.message,
    });
  }
};

// =========================
// 📜 Get Access List
// =========================
export const getAccessList = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;

    // ✅ Users can only see their own list unless org/admin
    if (
      requestingUser.role === "user" &&
      requestingUser._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const accessHistory = await History.find({
      userId,
      action: { $in: ["access_granted", "access_revoked"] },
    }).sort({ createdAt: -1 });

    // Simplified current access state
    const currentAccess = accessHistory
      .filter((record) => record.action === "access_granted")
      .map((record) => ({
        organization: record.organization,
        grantedAt: record.createdAt,
        grantedBy: record.details.grantedBy,
      }));

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        currentAccess,
        accessHistory,
      },
    });
  } catch (error) {
    console.error("Get access list error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get access list",
      error: error.message,
    });
  }
};

// =========================
// 🔍 Check Access
// =========================
export const checkAccess = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const requestingUser = req.user;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found",
      });
    }

    const accessCheck = await blockchainService.hasAccess(
      requestingUser.walletAddress,
      targetUser.walletAddress
    );

    res.json({
      success: true,
      data: {
        hasAccess: accessCheck.success ? accessCheck.hasAccess : false,
        targetUser: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
        },
      },
    });
  } catch (error) {
    console.error("Check access error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check access",
      error: error.message,
    });
  }
};
