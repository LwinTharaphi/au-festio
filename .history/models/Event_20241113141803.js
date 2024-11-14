// models/Event.js
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  location : { type: Date, required: true },
  description: { type: String, required: true },
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
