import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import Staff from "@/models/Staff";
export async function GET(request) {
    await dbConnect();
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
                requiredStaffCount: {$size: "$Staff"},
            },
        },
    ]);
    return new Response(
        JSON.stringify({
          totalEvents: aggregateData.length,
          events: aggregateData,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }, // Properly set JSON content type
        }
      );
}