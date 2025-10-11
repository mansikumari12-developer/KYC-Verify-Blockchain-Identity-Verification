// services/ipfsService.js
import { PinataSDK } from "pinata-web3";
import fs from "fs";
import { Blob } from "buffer";

const pinata = new PinataSDK({
  pinataJwt: `Bearer ${process.env.PINATA_JWT}`,
});

export async function uploadToIPFS(filePath, fileName) {
  try {
    console.log("📤 Uploading file to IPFS:", filePath);

    // ✅ Verify file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    // ✅ Read file
    const fileBuffer = fs.readFileSync(filePath);
    const fileBlob = new Blob([fileBuffer]);

    // ✅ Upload
    const result = await pinata.upload.file(fileBlob, {
      metadata: { name: fileName },
    });

    console.log("✅ IPFS upload result:", result);

    const cid = result.IpfsHash || result.cid || result.id;

    if (!cid) {
      throw new Error("Pinata did not return a CID or IpfsHash");
    }

    return cid;
  } catch (error) {
    console.error("❌ IPFS Upload Error:", error);
    throw new Error(error.message || "Failed to upload file to IPFS");
  }
}

export default { uploadToIPFS };
