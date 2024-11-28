import EventOrganizer from "@/models/EventOrganizer";
import dbConnect from "@/lib/db";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// GET: Fetch all performances for a specific event
export async function GET() {
  await dbConnect();
  const organizers = await EventOrganizer.find(); // Fetch performances by event ID
  return new Response(JSON.stringify(organizers), { status: 200 });
}

export async function POST(req) {
    try {
      const { name, email, password, phone } = await req.json();
  
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
        phone
      });
  
      await newUser.save();
  
      return new Response(
        JSON.stringify({ message: 'Account created successfully' }),
        { status: 201 }
      );
    } catch (error) {
      console.error('Error in Sign Up API:', error); // log the error to the server logs
      return new Response(
        JSON.stringify({ error: `Internal Server Error: ${error.message}` }),
        { status: 500 }
      );
    }
}

// Secret key for encryption
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16; // Initialization vector length

// Encrypt function
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

// Decrypt function
function decrypt(text) {
  const [iv, encryptedText] = text.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(Buffer.from(encryptedText, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

