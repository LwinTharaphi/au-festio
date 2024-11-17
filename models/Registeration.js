import mongoose from "mongoose";

const registerationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  registerationTime: {type: Date, default: Date.now},
  checkInTime: {type: Date},
},{timestamps: true});

export default mongoose.models.Registeration || mongoose.model("Registeration", registerationSchema);
