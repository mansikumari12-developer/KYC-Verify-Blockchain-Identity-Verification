import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Log from "../models/Log.js";

/**
 * 🔐 Verify JWT Token Middleware
 * Attaches decoded user to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — missing or invalid token format",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID embedded in token
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token valid but user not found",
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ [Auth Middleware Error]:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired — please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token — authentication failed.",
    });
  }
};

/**
 * 🛡️ Role-Based Authorization Middleware
 * Example usage: router.get("/admin", authorize("admin"), controller)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied — insufficient permissions",
      });
    }

    next();
  };
};

/**
 * 🧾 Request Logger (non-blocking)
 * Logs request details asynchronously after response is sent
 */
export const logRequest = async (req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    try {
      const duration = `${Date.now() - start}ms`;
      const status = res.statusCode;

      await Log.create({
        userId: req.user?._id || null,
        userEmail: req.user?.email || "guest",
        action: `${req.method} ${req.originalUrl}`,
        endpoint: req.originalUrl,
        ipAddress:
          req.headers["x-forwarded-for"] ||
          req.connection?.remoteAddress ||
          "unknown",
        userAgent: req.get("User-Agent") || "unknown",
        requestBody:
          req.method !== "GET" ? JSON.stringify(req.body).slice(0, 1000) : undefined,
        responseStatus: status,
        error: status >= 400 ? res.statusMessage : undefined,
        duration,
      });
    } catch (logErr) {
      console.error("⚠️ Logging error:", logErr.message);
    }
  });

  next();
};
