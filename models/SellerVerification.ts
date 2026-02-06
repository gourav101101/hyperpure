import mongoose from 'mongoose';

const SellerVerificationSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true, unique: true },
  
  // Documents
  documents: {
    businessRegistration: { url: String, verified: { type: Boolean, default: false } },
    fssaiLicense: { url: String, number: String, verified: { type: Boolean, default: false } },
    bankProof: { url: String, verified: { type: Boolean, default: false } },
    addressProof: { url: String, verified: { type: Boolean, default: false } },
    panCard: { url: String, number: String, verified: { type: Boolean, default: false } }
  },
  
  // Verification Steps
  steps: {
    documentsSubmitted: { type: Boolean, default: false },
    documentsVerified: { type: Boolean, default: false },
    sampleProductChecked: { type: Boolean, default: false },
    trainingCompleted: { type: Boolean, default: false },
    trialPeriodActive: { type: Boolean, default: false }
  },
  
  // Trial Period
  trialStartDate: Date,
  trialEndDate: Date,
  trialOrdersCompleted: { type: Number, default: 0 },
  trialOrdersTarget: { type: Number, default: 50 },
  
  // Status
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'documents_review', 'sample_check', 'training', 'trial', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Notes
  rejectionReason: String,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  notes: String,
  
}, { timestamps: true });

export default mongoose.models.SellerVerification || mongoose.model('SellerVerification', SellerVerificationSchema);
