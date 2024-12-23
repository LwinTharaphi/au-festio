import EventOrganizer from "@/models/EventOrganizer";
import dbConnect from "@/lib/db";
import { encrypt, decrypt } from "../route";
import nodemailer from 'nodemailer';

export async function POST(request) {
    try {
        await dbConnect(); // Connect to the database
        // Parse request body
        const body = await request.json();
        const { defaultPassword } = body;

        // Validate defaultPassword
        if (!defaultPassword || typeof defaultPassword !== "string") {
        return new Response(
            JSON.stringify({ error: "Default password is missing or invalid" }),
            { status: 400 }
        );
        }
        const organizers = await EventOrganizer.find();
        // Encrypt the password
        const encrypted = encrypt(defaultPassword);
        const password = encrypted.split(":")[1];
        const iv = encrypted.split(":")[0];

        for (const organizer of organizers) {
            organizer.password = password;
            organizer.iv = iv;
            await organizer.save();

            // Set up the transporter for Nodemailer
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
                },
            });
        
            // Send email
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: organizer.email,
                subject: "Password Reset Notification",
                text: `Your password has been reset to: ${defaultPassword}. Please log in and update it immediately.`,
            });

        }

        return new Response(
            JSON.stringify({ message: "Passwords reset successfully." }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating password:", error);
        return new Response(
        JSON.stringify({ error: "Failed to reset the password" }),
        { status: 500 }
        );
    }
}