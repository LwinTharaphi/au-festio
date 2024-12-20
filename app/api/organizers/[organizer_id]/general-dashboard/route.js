import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import Staff from "@/models/Staff";
import Staffrole from "@/models/Staffrole";
import Student from "@/models/Student";
import moment from "moment";

export async function GET(request, { params }) {
    await dbConnect();
    const { organizer_id } = await params;

    // Count total events, paid events, and free events
    const totalEvents = await Event.countDocuments({organizer: organizer_id});
    const paidEvents = await Event.countDocuments({organizer: organizer_id, isPaid: true });
    const freeEvents = await Event.countDocuments({organizer: organizer_id, isPaid: false });

    // Get all events
    const events = await Event.find({organizer: organizer_id});

    // Get all staff and roles
    const staffs = await Staff.find().populate('role'); // Assuming staff has a 'role' field that references Staffrole
    const staffRoles = await Staffrole.find();
    const students = await Student.find();

    // Get today's date
    const today = moment();

    // Initialize counters for event categories
    let ongoingEvent = 0;
    let upcomingEvent = 0;
    let completedEvent = 0;

    // Prepare the staff counts data
    const Events = await Promise.all(events.map(async (event) => {
        const registrationDate = moment(event.registrationDate);
        const eventDate = moment(event.eventDate);

        // Categorize the event based on the dates
        if (today.isBetween(registrationDate, eventDate, "day", "[]")) {
            ongoingEvent++;
        } else if (today.isBefore(registrationDate, "day")) {
            upcomingEvent++;
        } else if (today.isAfter(eventDate, "day")) {
            completedEvent++;
        }
        // Get roles for this event
        const rolesForEvent = staffRoles.filter(role => role.eventId.toString() === event._id.toString());

        // Calculate staff count for each role
        const rolesWithStaffCount = await Promise.all(rolesForEvent.map(async (role) => {
            // Find the staff registered for this role in the current event
            const staffRegistered = staffs.filter(staff => staff.role._id.toString() === role._id.toString() && staff.event.toString() === event._id.toString());
            const staffMissing = role.count - staffRegistered.length;

            return {
                name: role.name,
                staffNeeded: role.count,
                staffRegistered: staffRegistered.length,
                staffMissing: staffMissing,
            };
        }));

        const studentsRegistered = students.filter(s => s.eventId.toString() === event._id.toString());
        const studentsCheckIn = students.filter(s => s.checkInStatus === 'checked-in')

        return {
            eventName: event.eventName,
            studentsRegistered: studentsRegistered.length,
            studentsCheckIn: studentsCheckIn.length,
            roles: rolesWithStaffCount,
        };
    }));

    // Prepare the response data
    const result = {
        totalEvents,
        paidEvents,
        freeEvents,
        upcomingEvent,
        ongoingEvent,
        completedEvent,
        Events,
    };

    // Return the response
    return new Response(
        JSON.stringify({
            result
        }),
        {
            status: 200,
            headers: { "Content-Type": "application/json" }, // Properly set JSON content type
        }
    );
}
