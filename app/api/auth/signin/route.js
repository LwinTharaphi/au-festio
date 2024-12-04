import dbConnect from '@/lib/db';
import EventOrganizer from '@/models/EventOrganizer';
import { decrypt } from '../../event-organizers/route';
import jwt from 'jsonwebtoken'
import { serializeCookie } from '@/lib/cookies';

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

    // Generate a JWT token
    const token = jwt.sign(
      { id: organizer._id, email: organizer.email, name: organizer.name },
      process.env.JWT_SECRET, // Use an environment variable for the secret
      { expiresIn: '1h' } // Token expiration time
    );

    // Set the token in an HTTP-only cookie
    const cookie = serializeCookie('auth_token', token);

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
      { status: 200 ,
        headers: {
          'Set-Cookie': cookie,
        }
      }
    );
  } catch (error) {
    console.error('Error in /api/auth/signin:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong, please try again later' }),
      { status: 500 }
    );
  }
}
