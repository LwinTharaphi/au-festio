// app/api/events/[id]/students/route.js
import dbConnect from "@/lib/db";
import Student from "@/models/Student";

export async function GET(req, { params }) {
  await dbConnect();

  const { id: eventId } = params;
  try {
    const students = await Student.find({ eventId });
    return new Response(JSON.stringify(students), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch students" }), { status: 500 });
  }
}
