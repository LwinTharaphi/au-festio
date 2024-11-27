import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  notificationId: { type: String, unique: true, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
