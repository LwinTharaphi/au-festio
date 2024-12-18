// models/Event.js
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  registerationDate: { type: Date, required: true},
  eventDate: {type: Date, required: true},
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location : { type: String, required: true },
  isPaid: {type: Boolean},
  posterName: {type: String},
  poster: {type: Buffer, required: true},
  qrName: {type: String},
  qr: {type: Buffer},
  price: { type: Number, required: function () { return this.isPaid; }, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  refundPolicy: {
    type: [
      {
        days: { type: Number, required: true },
        percentage: { type: Number, required: true },
      },
    ],
    default: [],
  },
  venueName: {type: String},
  latitude: {type: String},
  longitude: {type: String},
  seats: { type: Number, required: false},
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
