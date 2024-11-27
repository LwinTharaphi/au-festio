
import mongoose from "mongoose";

const EventOrganizerSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    phone: {type: String, required: ture},
}, { timestamps: true});

export default mongoose.models.EventOrganizer || mongoose.model("EventOrganizer", EventOrganizerSchema);
