import CryptoJS from 'crypto-js';

class EncryptionService {
  constructor() {
    // In a real app, these keys would be generated per user and stored securely
    this.secretKey = 'QueueUpAppSecretKey2024!'; // This should be user-specific
  }

  // Generate a unique encryption key for each conversation
  generateConversationKey(userId1, userId2) {
    const sortedIds = [userId1, userId2].sort();
    const conversationId = `${sortedIds[0]}_${sortedIds[1]}`;
    return CryptoJS.SHA256(conversationId + this.secretKey).toString();
  }

  // Encrypt message content
  encryptMessage(message, senderId, receiverId) {
    try {
      const conversationKey = this.generateConversationKey(senderId, receiverId);
      const encrypted = CryptoJS.AES.encrypt(message, conversationKey).toString();
      
      return {
        encryptedContent: encrypted,
        timestamp: new Date().toISOString(),
        isEncrypted: true,
        version: '1.0'
      };
    } catch (error) {
      console.error('Encryption error:', error);
      return {
        encryptedContent: message, // Fallback to unencrypted
        timestamp: new Date().toISOString(),
        isEncrypted: false,
        version: '1.0',
        error: 'Encryption failed'
      };
    }
  }

  // Decrypt message content
  decryptMessage(encryptedData, senderId, receiverId) {
    try {
      if (!encryptedData.isEncrypted) {
        return encryptedData.encryptedContent; // Return as-is if not encrypted
      }

      const conversationKey = this.generateConversationKey(senderId, receiverId);
      const decrypted = CryptoJS.AES.decrypt(encryptedData.encryptedContent, conversationKey);
      const decryptedMessage = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedMessage) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }
      
      return decryptedMessage;
    } catch (error) {
      console.error('Decryption error:', error);
      return '[Message could not be decrypted]';
    }
  }

  // Encrypt file attachments (for future use)
  encryptFile(fileData, senderId, receiverId) {
    try {
      const conversationKey = this.generateConversationKey(senderId, receiverId);
      const encrypted = CryptoJS.AES.encrypt(fileData, conversationKey).toString();
      
      return {
        encryptedData: encrypted,
        isEncrypted: true,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
    } catch (error) {
      console.error('File encryption error:', error);
      return {
        encryptedData: fileData,
        isEncrypted: false,
        timestamp: new Date().toISOString(),
        error: 'Encryption failed'
      };
    }
  }

  // Decrypt file attachments (for future use)
  decryptFile(encryptedFileData, senderId, receiverId) {
    try {
      if (!encryptedFileData.isEncrypted) {
        return encryptedFileData.encryptedData;
      }

      const conversationKey = this.generateConversationKey(senderId, receiverId);
      const decrypted = CryptoJS.AES.decrypt(encryptedFileData.encryptedData, conversationKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('File decryption error:', error);
      return null;
    }
  }

  // Generate a secure hash for message integrity verification
  generateMessageHash(message, timestamp) {
    return CryptoJS.SHA256(message + timestamp + this.secretKey).toString();
  }

  // Verify message integrity
  verifyMessageIntegrity(message, timestamp, hash) {
    const expectedHash = this.generateMessageHash(message, timestamp);
    return hash === expectedHash;
  }

  // Encrypt sensitive user data
  encryptUserData(data, userId) {
    try {
      const userKey = CryptoJS.SHA256(userId + this.secretKey).toString();
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), userKey).toString();
      
      return {
        encryptedData: encrypted,
        isEncrypted: true,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
    } catch (error) {
      console.error('User data encryption error:', error);
      return {
        encryptedData: data,
        isEncrypted: false,
        timestamp: new Date().toISOString(),
        error: 'Encryption failed'
      };
    }
  }

  // Decrypt sensitive user data
  decryptUserData(encryptedData, userId) {
    try {
      if (!encryptedData.isEncrypted) {
        return encryptedData.encryptedData;
      }

      const userKey = CryptoJS.SHA256(userId + this.secretKey).toString();
      const decrypted = CryptoJS.AES.decrypt(encryptedData.encryptedData, userKey);
      const decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
      
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('User data decryption error:', error);
      return null;
    }
  }
}

export default new EncryptionService();
