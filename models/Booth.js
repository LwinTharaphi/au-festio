import mongoose from "mongoose";

const boothSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  boothId: { type: String, required: true },
  boothNumber: { type: String, required: true },
  boothName: { type: String, required: false },
  vendorName: { type: String, required: true },
  imagePath: { type: String, required: false }, // Add this line for image storage
  registerationTime: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Booth || mongoose.model("Booth", boothSchema);