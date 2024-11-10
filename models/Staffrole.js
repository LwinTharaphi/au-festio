// models/Staffrole.js
import mongoose from "mongoose";

const StaffroleSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.Staffrole || mongoose.model('Staffrole', StaffroleSchema);
