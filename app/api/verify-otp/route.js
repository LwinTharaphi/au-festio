import Otp from "@/models/Otp";
import dbConnect from "@/lib/db";
import { NextResponse } from 'next/server';

// const otpStore = new Map();

// export function storeOtp(email, otp, expiresAt) {
//   otpStore.set(email, { otp, expiresAt });
// }

export async function storeOtp(email, otp, expiresAt) {
    try {
      // Store OTP in MongoDB
      const newOtp = new Otp({
        email,
        otp,
        expiresAt: new Date(expiresAt), // Store expiresAt as a Date object
      });
  
      // Save the OTP document
      await newOtp.save();
    } catch (error) {
      console.error('Error storing OTP:', error);
      throw new Error('Error storing OTP');
    }
  }

// export async function POST(request) {
//   try {
//     const { email, otp } = await request.json();

//     if (!email || !otp) {
//       return NextResponse.json({ success: false, message: 'Email and OTP are required.' }, { status: 400 });
//     }

//     const storedOtp = otpStore.get(email);
//     if (!storedOtp) {
//       return NextResponse.json({ success: false, message: 'Invalid or expired OTP.' }, { status: 400 });
//     }

//     if (storedOtp.otp !== otp) {
//       return NextResponse.json({ success: false, message: 'Invalid OTP.' }, { status: 400 });
//     }

//     const currentTime = Date.now();
//     if (currentTime > storedOtp.expiresAt) {
//       otpStore.delete(email);
//       return NextResponse.json({ success: false, message: 'OTP has expired.' }, { status: 400 });
//     }

//     otpStore.delete(email);
//     return NextResponse.json({ success: true, message: 'OTP verified successfully.' });
//   } catch (error) {
//     console.error('Error verifying OTP:', error);
//     return NextResponse.json({ success: false, message: 'An error occurred while verifying OTP.' }, { status: 500 });
//   }
// }



// export async function verifyOtp(email, otp) {
//   try {
//     // Find the OTP document by email
//     const storedOtp = await Otp.findOne({ email });

//     if (!storedOtp) {
//       throw new Error('OTP not found');
//     }

//     // Check if OTP is expired
//     if (Date.now() > new Date(storedOtp.expiresAt)) {
//       await Otp.deleteOne({ email }); // Remove expired OTP
//       throw new Error('OTP has expired');
//     }

//     // Validate OTP
//     if (storedOtp.otp !== otp) {
//       throw new Error('Invalid OTP');
//     }

//     // OTP is valid, remove OTP from the database after successful verification
//     await Otp.deleteOne({ email });

//     return { success: true, message: 'OTP verified successfully' };
//   } catch (error) {
//     console.error('Error verifying OTP:', error);
//     return { success: false, message: error.message };
//   }
// }

// import Otp from "@/models/Otp";
// import dbConnect from "@/lib/db";
// import { NextResponse } from 'next/server';

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
