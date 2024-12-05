import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import Student from '@/models/Student';

export async function POST(request, { params }) {
    await dbConnect(); // Ensure the database is connected

    try {
        // Access dynamic route parameters
        const { eventId, studentId } = await params;

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return new Response(
                JSON.stringify({ message: 'Event not found' }),
                { status: 404 }
            );
        }

        // Find the student
        const student = await Student.findById(studentId);
        if (!student) {
            return new Response(
                JSON.stringify({ message: 'Student not found' }),
                { status: 404 }
            );
        }

        // Check if the student is already checked-in
        if (student.checkInStatus === 'checked-in') {
            return new Response(
                JSON.stringify({ message: 'Student already checked in' }),
                { status: 400 }
            );
        }

        // Update student's check-in status
        student.checkInStatus = 'checked-in';
        await student.save();

        // Increment the check-in count for the event (optional)
        event.checkInCount = (event.checkInCount || 0) + 1;
        await event.save();

        // Return success response
        return new Response(
            JSON.stringify({ message: 'Check-in successful' }),
            { status: 200 }
        );

   
    } catch (error) {
        console.error('Error checking in student:', error);
        return new Response(
            JSON.stringify({ message: 'Internal Server Error' }),
            { status: 500 }
        );
    }
}
