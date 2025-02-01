import mongoose from "mongoose";
const staffSchema = new mongoose.Schema({
  id: { type: String, required: true },
  firebaseUID: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  faculty: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Staffrole", required: true }, // Assuming Role is a separate model
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true }, // Reference to Event model
  status: { 
    type: String, 
    enum: ['not viewed', 'approved', 'rejected'], 
    default: 'not viewed' 
  },
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

export default mongoose.models.Staff || mongoose.model("Staff", staffSchema);
