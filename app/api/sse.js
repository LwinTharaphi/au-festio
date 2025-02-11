import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';

let clients = [];

function eventsHandler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
}

function sendEventsToAll(newNotification) {
  clients.forEach(client => client.write(`data: ${JSON.stringify(newNotification)}\n\n`));
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    eventsHandler(req, res);
  } else if (req.method === 'POST') {
    const { eventId, organizerId, title, body } = req.body;

    const newNotification = new Notification({
      notificationId: new mongoose.Types.ObjectId().toString(),
      eventId,
      organizerId,
      title,
      body,
    });

    await newNotification.save();
    sendEventsToAll(newNotification);
    res.status(201).json(newNotification);
  } else {
    res.status(405).end();
  }
}