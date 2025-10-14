import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_BASE = "https://api.pinata.cloud/pinning";

// ✅ Upload file (supports Buffer)
export const uploadFileToIPFS = async (fileBuffer, fileName) => {
  try {
    const formData = new FormData();
    formData.append("file", fileBuffer, { filename: fileName || "file" });

    const metadata = JSON.stringify({ name: fileName || "kyc-upload" });
    formData.append("pinataMetadata", metadata);

    const response = await axios.post(`${PINATA_API_BASE}/pinFileToIPFS`, formData, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        ...formData.getHeaders(),
      },
    });

    return {
      success: true,
      cid: response.data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
    };
  } catch (error) {
    console.error("❌ uploadFileToIPFS error:", error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

// ✅ Upload JSON (manifest)
export const uploadJSONToIPFS = async (jsonData, name) => {
  try {
    const payload = {
      pinataMetadata: { name: name || "identity-manifest" },
      pinataContent: jsonData,
    };

    const response = await axios.post(`${PINATA_API_BASE}/pinJSONToIPFS`, payload, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      cid: response.data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
    };
  } catch (error) {
    console.error("❌ uploadJSONToIPFS error:", error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};
