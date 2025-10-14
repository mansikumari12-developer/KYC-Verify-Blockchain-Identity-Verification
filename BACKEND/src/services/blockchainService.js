// backend/src/services/blockchainService.js
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// --- Load environment variables ---
const PROVIDER_URL = process.env.PROVIDER_URL || process.env.ETH_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI_PATH = process.env.CONTRACT_ABI_PATH || "./src/abi/KycRegistry.json";

// --- Warn if missing critical values ---
if (!PROVIDER_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.warn("⚠️ Blockchain service missing env vars. Check PROVIDER_URL / PRIVATE_KEY / CONTRACT_ADDRESS / CONTRACT_ABI_PATH");
}

// --- Load ABI ---
let CONTRACT_ABI = [];
try {
  const abiPath = path.resolve(CONTRACT_ABI_PATH);
  const abiContent = fs.readFileSync(abiPath, "utf8");
  CONTRACT_ABI = JSON.parse(abiContent).abi || JSON.parse(abiContent);
} catch (err) {
  console.error("❌ Error reading contract ABI:", err.message);
}

// --- Initialize provider, wallet, and contract ---
let provider, wallet, contract;
try {
  provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  console.log("✅ Blockchain service initialized successfully");
} catch (err) {
  console.error("⚠️ Blockchain init failed:", err.message);
}

// --- Store identity CID on-chain ---
export const storeIdentity = async (walletAddress, cid) => {
  try {
    if (!contract) throw new Error("Contract not initialized");

    const tx = await contract.storeIdentity(walletAddress, cid);
    const receipt = await tx.wait();

    console.log("✅ Stored on blockchain:", receipt.transactionHash);

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
    };
  } catch (err) {
    console.error("storeIdentity error:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};

// --- Grant access to an organization ---
export const grantAccess = async (orgWallet, userWallet) => {
  try {
    if (!contract) throw new Error("Contract not initialized");

    const tx = await contract.grantAccess(orgWallet, userWallet);
    const receipt = await tx.wait();

    console.log(`✅ Access granted: ${userWallet} to ${orgWallet}`);

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
    };
  } catch (err) {
    console.error("grantAccess error:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};

// --- Revoke access ---
export const revokeAccess = async (orgWallet, userWallet) => {
  try {
    if (!contract) throw new Error("Contract not initialized");

    const tx = await contract.revokeAccess(orgWallet, userWallet);
    const receipt = await tx.wait();

    console.log(`🚫 Access revoked: ${userWallet} from ${orgWallet}`);

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
    };
  } catch (err) {
    console.error("revokeAccess error:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};

// --- Check access (view-only call, no gas used) ---
export const hasAccess = async (orgWallet, userWallet) => {
  try {
    if (!contract) throw new Error("Contract not initialized");

    const hasAccessValue = await contract.hasAccess(orgWallet, userWallet);

    console.log(`🔍 Access check: ${userWallet} -> ${orgWallet}: ${hasAccessValue}`);

    return {
      success: true,
      hasAccess: Boolean(hasAccessValue),
    };
  } catch (err) {
    console.error("hasAccess error:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};

export default {
  storeIdentity,
  grantAccess,
  revokeAccess,
  hasAccess,
};
