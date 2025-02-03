// import Event from "@/models/Event";
// import dbConnect from "@/lib/db";
// import generatePayload from "promptpay-qr";
// import qrcode from 'qrcode';

// export async function GET(request, { params }) {
//   await dbConnect();
//   const { organizer_id, id } = await params;

//   try {
//     const event = await Event.findOne({ organizer: organizer_id, _id: id });
//     if (!event) {
//       return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
//     }
//     const isEarlyBirdValidFlag = event.isPaid && event.discount > 0 && isEarlyBirdValid(event.registerationDate);
//     const discountPrice = isEarlyBirdValidFlag ? event.price - (event.price * event.discount)/100 : 0;
//     const amount = isEarlyBirdValidFlag ? discountPrice : event.price;

//     const qrData = event.isPaid ? generatePayload(event.phone, { amount: amount }): null;
//     const qrSvg = event.isPaid
//       ? await qrcode.toString(qrData, { type: "svg", color: { dark: "#000", light: "#fff" } })
//       : null;

//     return new Response(JSON.stringify({amount, qrSvg, isEarlyBirdValidFlag}), { status: 200 });
//   } catch (error) {
//     return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
//   }
// }

// const isEarlyBirdValid = (registrationTimestamp) => {
//   const now = new Date();
//   const registrationDate = new Date(registrationTimestamp);
//   const timeDifference = now - registrationDate; // in milliseconds
//   const hoursPassed = timeDifference / (1000 * 60 * 60); // convert to hours

//   return hoursPassed <= 24; // Early bird discount valid for 24 hours
// };


import Event from "@/models/Event";
import dbConnect from "@/lib/db";
import generatePayload from "promptpay-qr";
import qrcode from 'qrcode';

export async function GET(request, { params }) {
  await dbConnect();
  const { organizer_id, id } = await params;

  try {
    const event = await Event.findOne({ organizer: organizer_id, _id: id });
    if (!event) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }

    // Check if early bird discount is applicable
    const isEarlyBirdValidFlag = event.isPaid && event.discount > 0 && isEarlyBirdValid(event.createdAt);
    const discountPrice = isEarlyBirdValidFlag ? event.price - (event.price * event.discount) / 100 : 0;
    const amount = isEarlyBirdValidFlag ? discountPrice : event.price;

    // Ensure amount is in number format
    const validAmount = parseFloat(amount.toFixed(2));
    
    // Generate the QR code as PNG or Base64 encoded string (Krungsri may prefer this format)
    const qrData = event.isPaid ? generatePayload(event.phone, { amount: validAmount }): null;
    // const qrSvg = event.isPaid
    //   ? await qrcode.toString(qrData, { type: "svg", color: { dark: "#000", light: "#fff" } })
    //   : null;
    // const qrSvg = event.isPaid
    //   ? await qrcode.toDataURL(qrData, { errorCorrectionLevel: 'H' })
    //   : null;

    const qrCanvas = document.createElement('canvas');
    await new Promise((resolve, reject) => {
      qrcode.toCanvas(qrCanvas, qrData, { errorCorrectionLevel: 'H', width: 500, height: 500 }, function(error) {
        if (error) reject(error);
        else resolve();
      });
    });

    // Get the Base64-encoded image from the canvas
    const qrSvg = qrCanvas.toDataURL();  // This will be the high-resolution QR code
      

    return new Response(JSON.stringify({ amount, qrSvg, isEarlyBirdValidFlag }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

const isEarlyBirdValid = (createdAtTimestamp) => {
  const now = new Date();
  const createdAtDate = new Date(createdAtTimestamp);
  const timeDifference = now - createdAtDate; // in milliseconds
  const hoursPassed = timeDifference / (1000 * 60 * 60); // convert to hours

  return hoursPassed <= 24; // Early bird discount valid for 24 hours
};
