import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, enum: ['approved', 'denied', 'not viewed'], default: 'not viewed' }
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
