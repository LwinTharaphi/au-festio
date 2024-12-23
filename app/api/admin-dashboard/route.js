import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import EventOrganizer from "@/models/EventOrganizer";
import Staff from "@/models/Staff";
import Staffrole from "@/models/Staffrole";
import Student from "@/models/Student";
import moment from "moment";

export async function GET(request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const organizer_id = searchParams.get('organizer_id');

    if (!organizer_id) {
      return new Response(JSON.stringify({ error: 'Organizer ID is required' }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const organizers = await EventOrganizer.find();
    // Fetch all events
    const events = await Event.find({ organizer: organizer_id }).populate('organizer');

    // Get today's date
    const today = moment();

    // Initialize counters for event categories
    let ongoingEvent = 0;
    let upcomingEvent = 0;
    let completedEvent = 0;

    // Prepare the staff counts data
    const Events = await Promise.all(events.map(async (event) => {
        const registrationDate = moment(event.registerationDate);
        const eventDate = moment(event.eventDate);

        if (today.isBetween(registrationDate, eventDate, "day", "[]")) {
            ongoingEvent++;
        } else if (today.isBefore(registrationDate, "day")) {
            upcomingEvent++;
        } else if (today.isAfter(eventDate, "day")) {
            completedEvent++;
        }

        // Get all staff and roles
        const staffs = await Staff.find().populate('role'); // Assuming staff has a 'role' field that references Staffrole
        const staffRoles = await Staffrole.find();
        const students = await Student.find();
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
        const studentsCheckIn = students.filter(s => s.checkInStatus === 'checked-in' && s.eventId.toString() === event._id.toString())

        return {
            eventName: event.eventName,
            organizer: event.organizer._id,
            studentsRegistered: studentsRegistered.length,
            studentsCheckIn: studentsCheckIn.length,
            roles: rolesWithStaffCount,
        };
    }));

    // Prepare the response data
    const result = {
        Organizer: {
            totalEvents: events.length,
            paidEvents: events.filter(event => event.isPaid).length,
            freeEvents: events.filter(event => !event.isPaid).length,
            ongoingEvent,
            upcomingEvent,
            completedEvent,
            Events,
          },
          organizers,
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
