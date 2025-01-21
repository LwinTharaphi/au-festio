import mongoose from "mongoose";

const RefundSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  refundPercentage: {
    type: Number,
    required: true,
  },
  qrImage: {
    type: String, // URL or base64 string of the QR image
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Refund || mongoose.model("Refund", RefundSchema);
