// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from '@/lib/db';
import EventOrganizer from '@/models/EventOrganizer';
import crypto from 'crypto';
export function decrypt(text) {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
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
const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        // email: {label: }
      },
      async authorize(credentials){
        const {email, password, role } = credentials;
        try{
          if(role === 'admin'){
            if(password === 'admin'){
              return {id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin'};
            } else{
              throw new Error("Invalid admin username or password");
            } 
          }
          if(role === 'organizer'){
            await dbConnect();
            const organizer = await EventOrganizer.findOne({email});
            if(!organizer){
              throw new Error('Invalid email or password');
            }
  
            const decryptedPassword = decrypt(`${organizer.iv}:${organizer.password}`);
  
            if (password !== decryptedPassword){
              throw new Error('Wrong Password');
            }
  
            const responseOrganizer = {
              id: organizer._id.toString(),
              name: organizer.name,
              email: organizer.email,
              role: 'organizer'
              };
            return responseOrganizer;
          }
          throw new Error("Invalid role");
        } catch(error){
          console.error("Authentication error:",error.message);
          throw new Error("Authentication failed;")
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({token,user}){
      if (user){
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({session, token,user}){
      if(token){
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages:{
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);
export {handler as GET , handler as POST};
