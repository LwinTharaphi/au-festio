import Otp from "@/models/Otp";
import dbConnect from "@/lib/db";
import { NextResponse } from 'next/server';

export async function storeOtp(email, otp, expiresAt) {
  try {
      await Otp.updateOne(
          { email }, // Match by email
          { $set: { otp, expiresAt: new Date(expiresAt) } }, // Update or insert OTP and expiry
          { upsert: true } // Insert if not found
      );
  } catch (error) {
      console.error('Error storing OTP:', error);
      throw new Error('Error storing OTP');
  }
}


// This is to ensure the database connection is established before any request is made.
async function connectDb() {
  if (dbConnect.isConnected) return;
  await dbConnect();
}

export async function POST(request) {
  try {
    // Ensure DB connection
    await connectDb();

    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: 'Email and OTP are required.' }, { status: 400 });
    }

    // Find the OTP document by email from the database
    const storedOtp = await Otp.findOne({ email });

    if (!storedOtp) {
      return NextResponse.json({ success: false, message: 'OTP not found.' }, { status: 400 });
    }

    // Check if OTP is expired
    if (Date.now() > new Date(storedOtp.expiresAt)) {
      await Otp.deleteOne({ email }); // Remove expired OTP
      return NextResponse.json({ success: false, message: 'OTP has expired.' }, { status: 400 });
    }

    // Validate OTP
    if (storedOtp.otp !== otp) {
      return NextResponse.json({ success: false, message: 'Invalid OTP.' }, { status: 400 });
    }

    // OTP is valid, remove OTP from the database after successful verification
    await Otp.deleteOne({ email });

    return NextResponse.json({ success: true, message: 'OTP verified successfully.' });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ success: false, message: 'An error occurred while verifying OTP.' }, { status: 500 });
  }
}
