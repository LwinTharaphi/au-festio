import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import Staff from "@/models/Staff";
import Staffrole from "@/models/Staffrole";
import Student from "@/models/Student";

export async function GET(request) {
    await dbConnect();

    // Count total events, paid events, and free events
    const totalEvents = await Event.countDocuments();
    const paidEvents = await Event.countDocuments({ isPaid: true });
    const freeEvents = await Event.countDocuments({ isPaid: false });

    // Get all events
    const events = await Event.find();

    // Get all staff and roles
    const staffs = await Staff.find().populate('role'); // Assuming staff has a 'role' field that references Staffrole
    const staffRoles = await Staffrole.find();

    // Prepare the staff counts data
    const staffCounts = await Promise.all(events.map(async (event) => {
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

        return {
            eventName: event.eventName,
            roles: rolesWithStaffCount,
        };
    }));
    const students = await Student.find({eventId: event._id});
    const studentsRegistered = students.length;
    const studentsCheckedIn = students.filter(s=> s.checkInStatus === 'checked-in');

    // Prepare the response data
    const result = {
        totalEvents,
        paidEvents,
        freeEvents,
        staffCounts
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
