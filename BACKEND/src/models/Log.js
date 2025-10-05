import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: String,
  action: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  ipAddress: String,
  userAgent: String,
  requestBody: {
    type: mongoose.Schema.Types.Mixed
  },
  responseStatus: {
    type: Number
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
logSchema.index({ createdAt: -1 });
logSchema.index({ userId: 1 });

export default mongoose.model('Log', logSchema);