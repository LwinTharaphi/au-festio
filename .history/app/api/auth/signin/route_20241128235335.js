import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import EventOrganizer from '@/models/EventOrganizer';
import { decrypt } from '../../event-organizers/route';

export async function POST(req) {
  const { email, password } = await req.json();

  await dbConnect();

  try {
    // Find the organizer by email
    const organizer = await EventOrganizer.findOne({ email });
    if (!organizer) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401 }
      );
    }

    // Check the password
    const decryptedPassword = decrypt(`${organizer.iv}:${organizer.password}`);

    if (password !== decryptedPassword){
      return new Response(
        JSON.stringify({ error: 'Wrong Password'}),
        { status: 401}
      );
    }
    // Return success with only the required fields
    const responseOrganizer = {
      id: organizer._id.toString(),
      name: organizer.name,
      email: organizer.email,
    };

    return new Response(
      JSON.stringify({
        message: 'Login successful',
        user: responseOrganizer,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/auth/signin:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong, please try again later' }),
      { status: 500 }
    );
  }
}
