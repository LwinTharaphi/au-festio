// models/QRCode.js
import mongoose from "mongoose";

const QRCodeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  qrCodeData: {
    type: String,
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
}, { timestamps: true });
export default mongoose.models.QRcode || mongoose.model("QRcode", QRCodeSchema);