import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    stars: { type: Number, required: true, min: 1, max: 5 }, // Ratings from 1 to 5
    suggestion: { type: String, required: true, maxlength: 500 }, // Feedback text with a max length
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

export default mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
