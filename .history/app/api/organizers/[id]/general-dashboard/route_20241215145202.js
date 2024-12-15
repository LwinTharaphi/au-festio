import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import Staff from "@/models/Staff";
export async function GET(request) {
    await dbConnect();
    const totalEvents = await Event.countDocuments();
    const paidEvents = await Event.countDocuments({ isPaid: true });
    const freeEvents = await Event.countDocuments({ isPaid: false });

    const aggregateData = await Event.aggregate([
        {
            $lookup: {
                from: "Staff",
                localField: "_id",
                foreignField: "event",
                as: "staffs",
            },
        },
        {
            $project: {
                requiredStaffCount: {$size: "$staffs"},
            },
        },
    ]);
    // Prepare the response
    const result = {
        totalEvents,
        paidEvents,
        freeEvents,
        staffCounts,
        studentCounts,
      };
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