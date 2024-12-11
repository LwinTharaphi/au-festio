import mongoose from "mongoose";

const boothSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    boothId: { type: String, required: true },
    boothNumber: { type: String, required: true },
    boothName: { type: String, required: false },
    vendorName: { type: String, required: true },
    image: { type: String, required: false }, // Added image field
    registrationTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Booth || mongoose.model("Booth", boothSchema);
