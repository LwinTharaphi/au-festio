import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  faculty: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true }, // Assuming Role is a separate model
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true }, // Reference to Event model
});

export default mongoose.models.Staff || mongoose.model("Staff", staffSchema);
