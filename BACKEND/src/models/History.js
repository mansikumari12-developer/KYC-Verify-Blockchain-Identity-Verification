import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'identity_submitted',
      'verification_started',
      'verification_completed',
      'access_granted',
      'access_revoked',
      "liveness_step_submitted",
      'document_uploaded'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipfsCID: {
    type: String
  },
  contractTxHash: {
    type: String
  },
  organization: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
historySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('History', historySchema);