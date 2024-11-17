import mongoose from "mongoose";

const boothSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  boothId: {type: String, required: true},
  vendorName: {type: String, required: true},
  registerationTime: {type: Date, default: Date.now},
},{timestamps: true});

export default mongoose.models.Booth || mongoose.model("Booth", boothSchema);
