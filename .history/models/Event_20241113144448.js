// models/Event.js
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  location : { type: Date, required: true },
  organizerName: { type: Date, required: true },
  isPaid: {type: Boolean},
  posterName: {type: String},
  poster: {type: Buffer, required: ture},
  qrCodeName: {type: String},
  qrCode: {type: Buffer},
  venueName: {type: String},
  latitude: {type: String},
  longitude: {type: String},
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
