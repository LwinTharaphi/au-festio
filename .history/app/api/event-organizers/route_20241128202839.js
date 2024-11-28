import EventOrganizer from "@/models/EventOrganizer";
import dbConnect from "@/lib/db";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// GET: Fetch all performances for a specific event
export async function GET() {
  await dbConnect();
  const organizers = await EventOrganizer.find(); // Fetch performances by event ID

  const decryptedPasswords = organizers.map((organizer)=> ({
    ...organizer.toObject(),
    decryptedPasswords: decrypt(organizer.encryptedPassword),
  }))
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
      const encryptedPassword = encrypt(password);
  
      // Create a new user
      const newUser = new EventOrganizer({
        name,
        email,
        hashedpassword: hashedPassword,
        encryptedPassword: encryptedPassword.split(":")[1],
        iv: encryptedPassword.split(":")[0],
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
export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const keyBuffer = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

// Decrypt function
export function decrypt(text) {
  const [iv, encryptedText] = text.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(Buffer.from(encryptedText, "hex"),"hex","utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

