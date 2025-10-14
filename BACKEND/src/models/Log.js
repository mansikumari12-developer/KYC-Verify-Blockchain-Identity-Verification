import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    endpoint: {
      type: String,
      required: true,
      trim: true,
    },
    ipAddress: String,
    userAgent: String,
    requestBody: mongoose.Schema.Types.Mixed,
    responseStatus: Number,
    error: String,
    duration: String,
  },
  { timestamps: true }
);

// ✅ Indexes for fast querying
logSchema.index({ createdAt: -1 });
logSchema.index({ userId: 1 });

export default mongoose.model("Log", logSchema);
