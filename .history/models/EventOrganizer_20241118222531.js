import mongoose from "mongoose";

const EventOrganizerSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  location : { type: String, required: true },
  isPaid: {type: Boolean},
  posterName: {type: String},
  poster: {type: Buffer, required: true},
  venueName: {type: String},
  latitude: {type: String},
  longitude: {type: String},
  price: { type: Number, required: false },
  seats: { type: Number, required: false},
  booths: { type: Number, required: false},
});

export default mongoose.models.EventOrganizer || mongoose.model("EventOrganizer", EventOrganizerSchema);
