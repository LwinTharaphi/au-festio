import Otp from "@/models/Otp";
import dbConnect from "@/lib/db";
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { storeOtp } from '../verify-otp/route'; // Import the storeOtp function

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }
  await dbConnect();
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes

  
    try {
        // Store OTP in MongoDB
        await storeOtp(email, otp, expiresAt);
    
        // Set up the transporter for Nodemailer
        const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
    
        // Send OTP email
        await transporter.sendMail({
          from: 'your-email@gmail.com',
          to: email,
          subject: 'Your OTP Code',
          text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
        });
    
        return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
      } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json({ message: 'Failed to send OTP' }, { status: 500 });
      }
    }
