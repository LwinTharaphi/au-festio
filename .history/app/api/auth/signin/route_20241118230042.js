// app/api/auth/signin/route.js
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import EventOrganizer from '@/models/EventOrganizer';

export default async function POST(req) {
  const { email, password } = await req.json();

  await dbConnect();

  try {
    // Find the organizer by email
    const organizer = await EventOrganizer.findOne({ email });
    if (!organizer) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
    }

    // Check the password
    const isMatch = await bcrypt.compare(password, organizer.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
    }

    return new Response(JSON.stringify({ message: 'Login successful', organizer }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
