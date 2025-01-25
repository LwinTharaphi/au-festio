import mongoose from "mongoose";

const RefundSchema = new mongoose.Schema({
  studentId: {type: mongoose.Schema.Types.ObjectId,ref: 'Student',required: true},
  // eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  refundPercentage: {type: Number,required: true},
  createdAt: {type: Date,default: Date.now},
});

export default mongoose.models.Refund || mongoose.model("Refund", RefundSchema);
