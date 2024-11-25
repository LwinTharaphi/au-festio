import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  sid: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  faculty: { type: String, required: true },
  phone: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { 
    type: String, 
    enum: ['not viewed', 'paid', 'rejected'], 
    default: 'not viewed' 
  },
  paymentScreenshotUrl: { type: String },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
