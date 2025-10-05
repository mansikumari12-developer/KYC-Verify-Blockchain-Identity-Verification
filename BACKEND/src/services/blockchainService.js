import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// 🟢 Load .env values
const RPC_URL = process.env.ETH_RPC_URL;
const rawKey = (process.env.PRIVATE_KEY || "").trim(); // trim invisible chars
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI_PATH = process.env.CONTRACT_ABI_PATH;

// 🟢 Debugging output
console.log("➡️ Loaded PRIVATE_KEY length:", rawKey.length);
if (!rawKey.startsWith("0x")) {
  console.error("❌ PRIVATE_KEY must start with 0x");
}
if (rawKey.length !== 66) {
  console.error("❌ PRIVATE_KEY length must be 66 chars (0x + 64 hex). Current:", rawKey.length);
}

// 🟢 Setup provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// 🟢 Setup wallet safely
let wallet;
try {
  wallet = new ethers.Wallet(rawKey, provider);
  console.log("✅ Wallet initialized:", wallet.address);
} catch (err) {
  console.error("❌ Wallet init failed:", err.message);
  process.exit(1); // stop backend if wallet invalid
}

// 🟢 Load contract ABI
const abi = JSON.parse(fs.readFileSync(CONTRACT_ABI_PATH, "utf8"));

// 🟢 Setup contract instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

export async function storeIdentity(cid) {
  try {
    const tx = await contract.storeIdentity(cid);
    console.log("🟢 Identity submitted, tx hash:", tx.hash);
    return await tx.wait();
  } catch (err) {
    console.error("❌ storeIdentity error:", err.message);
    throw err;
  }
}

export async function setStatus(user, status) {
  try {
    const tx = await contract.setStatus(user, status);
    console.log("🟢 Status updated, tx hash:", tx.hash);
    return await tx.wait();
  } catch (err) {
    console.error("❌ setStatus error:", err.message);
    throw err;
  }
}

export async function getIdentity(user) {
  try {
    const [cid, status] = await contract.getIdentity(user);
    return { cid, status };
  } catch (err) {
    console.error("❌ getIdentity error:", err.message);
    throw err;
  }
}

export default {
  storeIdentity,
  setStatus,
  getIdentity,
};
