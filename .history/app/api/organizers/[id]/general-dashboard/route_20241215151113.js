import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import Staff from "@/models/Staff";
export async function GET(request) {
    await dbConnect();
    const totalEvents = await Event.countDocuments();
    const paidEvents = await Event.countDocuments({ isPaid: true });
    const freeEvents = await Event.countDocuments({ isPaid: false });

    const staffCounts = await Event.aggregate([
        {
            $lookup: {
                from: "staffs",
                localField: "_id",
                foreignField: "event",
                as: "staffs",
            },
        },
        {
            $lookup: {
                from: "staffroles",
                localField: '_id',
                foreignField: 'eventId',
                as: 'roles',
            },
        },
        {
            $project: {
                eventName: 1,
                staffRegistered: {$size: "$staffs"},
                roles: 1,
            },
        },
        {
            $addFields: {
                roles: {
                    $map: {
                        input: '$roles',
                        as: 'role',
                        in: {
                            name: '$$role.name',
                            staffNeeded: '$$role.count',
                            staffRegistered: {
                                $size: {
                                    $filter: {
                                        input: '$staffs',
                                        as: 'staff',
                                        cond: { $eq: ['$$staff.role','$$role._id']},
                                    },

                                },
                            },
                            staffMissing: {
                                $subtract: ['$$role.count',{
                                    $size: {
                                        $filter: {
                                            input: '$staffs',
                                            as: 'staff',
                                            cond: {$eq: ['$$staff.role','$$role._id']},
                                        },
                                    },
                                }],
                            },
                        },
                    },
                },
            },
        },
    ]);
    // Prepare the response
    const result = {
        totalEvents,
        paidEvents,
        freeEvents,
        staffCounts
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