// services/ipfsService.js
import { PinataSDK } from "pinata-web3";
import fs from "fs";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

// Client
const pinata = new PinataSDK({
  pinataApiKey: PINATA_API_KEY,
  pinataSecretApiKey: PINATA_SECRET_KEY,
});

// Upload file
export async function uploadToIPFS(filePath, fileName) {
  const readableStream = fs.createReadStream(filePath);
  const result = await pinata.pinFileToIPFS(readableStream, {
    metadata: { name: fileName },
  });
  return result.IpfsHash;
}

export default { uploadToIPFS };
