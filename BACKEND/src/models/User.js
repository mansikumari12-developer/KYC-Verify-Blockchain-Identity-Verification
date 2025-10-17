import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  cid: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const verificationSchema = new mongoose.Schema({
  livenessCheck: { type: Boolean, default: false },
  documentCheck: { type: Boolean, default: false },
  verifiedAt: { type: Date },
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: function () {
        return !this.walletAddress;
      },
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.walletAddress;
      },
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["user", "org", "admin"],
      default: "user",
    },
    isVerified: { type: Boolean, default: false },
    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", "not_started"],
      default: "not_started",
    },
    identityCID: { type: String, default: null },
    documents: { type: [documentSchema], default: [] },
    verificationData: { type: verificationSchema, default: {} },
  },
  { timestamps: true }
);

// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Hide password in JSON response
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model("User", userSchema);
