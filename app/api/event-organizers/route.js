import EventOrganizer from "@/models/EventOrganizer";
import dbConnect from "@/lib/db";
import crypto from 'crypto';

// GET: Fetch all performances for a specific event
export async function GET() {
  await dbConnect();
  const organizers = await EventOrganizer.find();

  const decryptedOrganizers = organizers.map((organizer) => {
    try {
      const decryptedPassword = decrypt(`${organizer.iv}:${organizer.password}`);
      return {
        ...organizer.toObject(),
        password: decryptedPassword, // Decrypted password
      };
    } catch (error) {
      return {
        ...organizer.toObject(),
        password: "Decryption failed", // Handle decryption error
      };
    }
  });

  return new Response(JSON.stringify(decryptedOrganizers), { status: 200 });
}

export async function POST(req) {
    try {
      const { name, email, password, phone, lifetime } = await req.json();
      console.log({ name, email, password, phone, lifetime });
  
      // Check for missing fields
      if (!name || !email || !password || !phone || !lifetime) {
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
      // const hashedPassword = await bcrypt.hash(password, 10);
      const encryptedPassword = encrypt(password);
  
      // Create a new user
      const newUser = new EventOrganizer({
        name,
        email,
        lifetime,
        // hashedpassword: hashedPassword,
        password: encryptedPassword.split(":")[1],
        iv: encryptedPassword.split(":")[0],
        phone
      });
  
      await newUser.save();
      console.log('New User:', newUser);
 
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
  const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

// Decrypt function
export function decrypt(text) {
  const [iv, encryptedText] = text.split(":");
  const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");
  try{
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      keyBuffer,
      Buffer.from(iv, "hex")
    );
    let decrypted = decipher.update(encryptedText,"hex","utf8");
    decrypted += decipher.final("utf8");
    console.log("Decrypted data", decrypted)
    return decrypted;
  } catch (error){
    console.error(error.message);
  }
}

