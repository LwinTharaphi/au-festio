// app/api/students/route.js

import Student from "@/models/Student"; // Import the Student model
import dbConnect from "@/lib/db"; // Import the database connection
import { S3Client, DeleteObjectCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const baseS3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

// GET: Fetch students for a specific event
export async function GET(request, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID from URL parameters
  const students = await Student.find({ eventId: id }); // Fetch students by event ID
  return new Response(JSON.stringify(students), { status: 200 });
}


// POST a new student
export async function POST(request) {
  await dbConnect(); // Ensure the database is connected

  try {
    const data = await request.json(); // Parse the incoming JSON data from the request
    
    // let paymentScreenshotUrl = null; // Initialize the payment screenshot URL to null
    // if (data.paymentScreenshot && data.paymentScreenshot.uri) {
    //   const { uri, fileName } = data.paymentScreenshot; // Extract the URI and file name from the payment screenshot
    //   const paymentScreenshotUrl = await uploadFileToS3(uri, fileName); // Upload the payment screenshot to S3 
    // }
    // const newStudent = new Student({ ...data, paymentScreenshotUrl}); // Create a new Student instance with the provided data and the S3 URL
    const newStudent = new Student(data); // Create a new Student instance with the provided data
    await newStudent.save(); // Save the new student to the database
    return new Response(JSON.stringify(newStudent), { status: 201 }); // Return the newly created student
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Error registering student" }),
      { status: 500 }
    ); // Return an error response if the student creation fails
  }
}

async function uploadFileToS3(fileUri, fileName) {
  const fileStream = fs.createReadStream(fileUri);
  
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `payment-screenshots/${fileName}`,
    Body: fileStream,
    ContentType: 'image/png', // Adjust this based on your file type
  };

  try {
    const data = await s3.send(new PutObjectCommand(uploadParams));
    return `payment-screenshots/${fileName}`; // Return the S3 URL of the uploaded file
  } catch (err) {
    console.error('Error uploading file to S3', err);
    throw new Error('Error uploading file to S3');
  }
}
