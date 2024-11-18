import { Password } from "@mui/icons-material";
import mongoose from "mongoose";
import { unique } from "next/dist/build/utils";

const EventOrganizerSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
}, { timestamps: true});

export default mongoose.models.EventOrganizer || mongoose.model("EventOrganizer", EventOrganizerSchema);
