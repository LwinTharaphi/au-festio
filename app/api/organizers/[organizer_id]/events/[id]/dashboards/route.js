import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import Booth from "@/models/Booth";
import Feedback from "@/models/Feedback";
import Performance from "@/models/Performance";
import Student from "@/models/Student";

export async function GET(req, { params }) {
  const { id } = await params; // Get dynamic ID from the request parameters

  await dbConnect();

  try {
    // Find the event by ID
    const event = await Event.findById(id);
    if (!event) {
      return new Response(JSON.stringify({ message: "Event not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch related data
    // const registrations =  await Student.find({ eventId: id });
    const registrations = await Student.find({ eventId: id, refundStatus: { $ne: "refunded" } });
    const booths = await Booth.find({ eventId: id });
    const feedbacks = await Feedback.find({eventId: id});
    const performances = await Performance.find({eventId: id});

    // Extract performance details (name, startTime, endTime)
    const performanceDetails = performances.map((performance) => ({
      name: performance.name,
      startTime: performance.startTime,
      endTime: performance.endTime,
    }));

    // average reating
    const totalRatings = feedbacks.length;
    const ratings = feedbacks.filter((feedback)=> feedback.stars).map((feedback)=>feedback.stars);
    const sumRatings = ratings.reduce((acc,rating) => acc + rating,0);
    const averageRating = totalRatings > 0 ? sumRatings/totalRatings : 0;

    // Calculate stats
    const checkInCount = await Student.countDocuments({
      eventId: id,
      checkInStatus: "checked-in",
    });

    // Extract entry times
    const entryTimes = registrations
      .filter((reg) => reg.checkInTime)
      .map((reg) => reg.checkInTime);

    // Calculate monthly data
    const monthData = registrations.reduce((acc, reg) => {
      if (reg.checkInTime) {
        const month = new Date(reg.checkInTime).getMonth();
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {});

    // Return a successful response
    return new Response(
      JSON.stringify({
        event,
        stats: {
          totalRegistrations: registrations.length,
          boothsRegistered: booths.length,
          checkIns: checkInCount,
        },
        entryTimes,
        monthData,
        averageRating,
        performanceDetails,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    // Return error response
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
