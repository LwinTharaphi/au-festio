// models/Event.js
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  registerationDate: { type: Date},
  location : { type: String, required: true },
  isPaid: {type: Boolean},
  posterName: {type: String},
  poster: {type: Buffer, required: true},
  qrName: {type: String},
  qr: {type: Buffer},
  venueName: {type: String},
  latitude: {type: String},
  longitude: {type: String},
  seats: { type: Number, required: false},
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
