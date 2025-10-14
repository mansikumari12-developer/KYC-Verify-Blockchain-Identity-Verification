import jwt from "jsonwebtoken";

/**
 * ✅ Generate JWT Token
 * @param {string} userId - MongoDB user ID
 * @returns {string} Signed JWT token valid for 7 days
 */
export const generateToken = (userId) => {
  try {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || "supersecretkey", // fallback for safety
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d", // default 7 days
      }
    );
  } catch (error) {
    console.error("❌ Error generating token:", error.message);
    throw new Error("Token generation failed");
  }
};

/**
 * ✅ Verify JWT Token safely
 * Returns decoded token or null if invalid/expired
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.warn("⚠️ Token expired");
    } else {
      console.warn("⚠️ Invalid token:", error.message);
    }
    return null; // Return null instead of throwing error
  }
};
