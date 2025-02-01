import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    firebaseUID: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    faculty: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Staffrole", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    status: { 
      type: String, 
      enum: ['not viewed', 'approved', 'rejected'], 
      default: 'not viewed' 
    }
  },
  { timestamps: true } // Move timestamps here inside schema options
);

export default mongoose.models.Staff || mongoose.model("Staff", staffSchema);
