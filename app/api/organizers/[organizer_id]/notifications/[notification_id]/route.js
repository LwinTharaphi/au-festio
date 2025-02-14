import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import mongoose from "mongoose";
export async function PATCH(req, { params }) {
    const { notification_id } = await params;
    const { read } = await req.json();
    
    if (!notification_id) {
        return new Response("Missing notification_id", { status: 400 });
    }
    
    await dbConnect();
    
    const notification = await Notification.findOneAndUpdate(
        { notificationId: notification_id },
        { read },
        { new: true }
    );
    
    if (!notification) {
        return new Response("Notification not found", { status: 404 });
    }
    
    return new Response(JSON.stringify(notification));
}
