import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  serialNo: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.Performance || mongoose.model("Performance", performanceSchema);
