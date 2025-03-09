import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true },
  sid: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  faculty: { type: String, required: true },
  phone: { type: String, required: true },
  price: { type: Number},
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { 
    type: String, 
    enum: ['not viewed', 'paid', 'rejected'], 
    default: 'not viewed' 
  },
  refundStatus: { 
    type: String, 
    enum: ['none', 'requested','refund_progress', 'refunded'], 
    default: 'none',
    required: true,
  },
  checkInStatus: {
    type: String,
    enum: ['not checked-in', 'checked-in'],  // Add your custom statuses for check-in
    default: 'not checked-in',
  },
  refundQRCode: { type: String },
  paymentScreenshotUrl: { type: String },
  expoPushToken: { type: String, required: false },

}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
