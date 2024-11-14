// app/api/students/route.js

import Student from "@/models/Student"; // Import the Student model
import dbConnect from "@/lib/db"; // Import the database connection

// GET all students
export async function GET(request) {
  await dbConnect(); // Ensure the database is connected

  try {
    const students = await Student.find(); // Fetch all students
    return new Response(JSON.stringify(students), { status: 200 }); // Return the students in the response
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Error fetching students" }),
      { status: 500 }
    ); // Return an error response if fetching fails
  }
}

// POST a new student
export async function POST(request) {
  await dbConnect(); // Ensure the database is connected

  try {
    const data = await request.json(); // Parse the incoming JSON data from the request
    const newStudent = new Student(data); // Create a new Student instance with the provided data
    await newStudent.save(); // Save the student to the database
    return new Response(JSON.stringify(newStudent), { status: 201 }); // Return the newly created student in the response
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Error registering student" }),
      { status: 500 }
    ); // Return an error response if the student creation fails
  }
}
