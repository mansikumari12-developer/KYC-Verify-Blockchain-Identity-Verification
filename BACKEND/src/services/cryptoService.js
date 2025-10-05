import CryptoJS from 'crypto-js';

class CryptoService {
  constructor() {
    this.secretKey = process.env.JWT_SECRET;
  }

  encrypt(text) {
    return CryptoJS.AES.encrypt(text, this.secretKey).toString();
  }

  decrypt(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  encryptObject(obj) {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  decryptObject(ciphertext) {
    const decrypted = this.decrypt(ciphertext);
    return JSON.parse(decrypted);
  }

  // For sensitive identity data
  encryptIdentityData(identityData) {
    const sensitiveFields = ['ssn', 'passportNumber', 'driversLicense', 'taxId'];
    const encryptedData = { ...identityData };

    sensitiveFields.forEach(field => {
      if (encryptedData[field]) {
        encryptedData[field] = this.encrypt(encryptedData[field]);
      }
    });

    return encryptedData;
  }

  decryptIdentityData(encryptedIdentityData) {
    const sensitiveFields = ['ssn', 'passportNumber', 'driversLicense', 'taxId'];
    const decryptedData = { ...encryptedIdentityData };

    sensitiveFields.forEach(field => {
      if (decryptedData[field]) {
        try {
          decryptedData[field] = this.decrypt(decryptedData[field]);
        } catch (error) {
          console.error(`Error decrypting field ${field}:`, error);
        }
      }
    });

    return decryptedData;
  }

  // Generate hash for data integrity
  generateHash(data) {
    return CryptoJS.SHA256(JSON.stringify(data)).toString();
  }

  // Verify data integrity
  verifyHash(data, hash) {
    return this.generateHash(data) === hash;
  }
}

export default new CryptoService();