import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },  // Email associated with the OTP
    otp: { type: String, required: true },                  // The OTP value
    expiresAt: { type: Date, required: true },              // Expiration time of the OTP
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export default mongoose.models.Otp || mongoose.model("Otp", otpSchema);

// Create a model from the schema
// const Otp = mongoose.model('Otp', otpSchema);

// export default Otp;
