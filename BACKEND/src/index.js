import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ES Module path fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env variables early
dotenv.config();

// Import routes
import authRoutes from "./routes/authRoutes.js";
import identityRoutes from "./routes/identityRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import accessRoutes from "./routes/accessRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

// Express app
const app = express();

// ✅ CORS Fix
app.use(cors({
  origin: "http://localhost:3000", // Change to your frontend URL
  credentials: true,               // Allow cookies/JWT headers
}));

// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Static Files
const fileUploadPath = path.join(__dirname, "../dataToSave");
app.use("/uploaded-file", express.static(fileUploadPath));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/identity", identityRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/history", historyRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "KYC Backend is running ✅",
    timestamp: new Date().toISOString(),
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 Fallback
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Database & Server Start
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () =>
      console.log(`🚀 KYC Backend running at http://localhost:${PORT}`)
    );
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  });

export default app;
