// app/api/auth/signup/route.js
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import EventOrganizer from '@/models/EventOrganizer';

export async function POST(req) {
  const { name, email, password } = await req.json();

  await dbConnect();

  try {
    // Check if the email is already registered
    const existingUser = await Organizer.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email is already registered' }), { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new organizer
    const organizer = new Organizer({ name, email, password: hashedPassword });
    await organizer.save();

    return new Response(JSON.stringify({ message: 'Account created successfully' }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
