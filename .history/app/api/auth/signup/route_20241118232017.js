import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import EventOrganizer from '@/models/EventOrganizer';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // Check for missing fields
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if email is already registered
    const existingUser = await EventOrganizer.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Email is already registered' }),
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new EventOrganizer({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return new Response(
      JSON.stringify({ message: 'Account created successfully' }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in Sign Up API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
