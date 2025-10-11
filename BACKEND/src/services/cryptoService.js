import crypto from "crypto";
import CryptoJS from "crypto-js";

// ✅ Environment-based secret keys

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET_KEY || "myverysecureencryptionkey1234567";
const IV_LENGTH = 16;
const SECRET_KEY = process.env.JWT_SECRET || "defaultsecretkey";

// =============================
// 🔒 BASIC STRING ENCRYPTION
// =============================
export const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// =============================
// 🔒 OBJECT ENCRYPTION USING AES-256-CBC (Node Crypto)
// =============================
export const encryptIdentityData = async (data) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);

  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted.toString("hex"),
  };
};

export const decryptIdentityData = async (encryptedObject) => {
  const iv = Buffer.from(encryptedObject.iv, "hex");
  const encryptedText = Buffer.from(encryptedObject.encryptedData, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return JSON.parse(decrypted.toString());
};

// =============================
// 🔑 DATA INTEGRITY HASHING
// =============================
export const generateHash = (data) => {
  return CryptoJS.SHA256(JSON.stringify(data)).toString();
};

export const verifyHash = (data, hash) => {
  return generateHash(data) === hash;
};

// =============================
// 🧩 EXPORT ALL
// =============================
export const cryptoService = {
  encrypt,
  decrypt,
  encryptIdentityData,
  decryptIdentityData,
  generateHash,
  verifyHash,
};
