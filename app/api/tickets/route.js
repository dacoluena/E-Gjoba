import client from "@/lib/mongodb"; // MongoDB client
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Parse the JSON body of the request
    const { vehicleNumber, offense, fineAmount, createdBy } = await request.json();

    // Check if all required fields are provided
    if (!vehicleNumber || !offense || !fineAmount || !createdBy) {
      return NextResponse.json(
        { error: "Vehicle number, offense, fine amount, and createdBy are required." },
        { status: 400 }
      );
    }

    // Connect to the database
    const db = (await client).db();
    const ticketsCollection = db.collection("tickets");

    // Insert the new ticket into the collection
    const result = await ticketsCollection.insertOne({
      vehicleNumber,
      offense,
      fineAmount,
      createdBy, // createdBy would be the police officer creating the ticket
      createdAt: new Date(), // Timestamp for ticket creation
    });

    // Fetch the newly inserted ticket
    const newTicket = await ticketsCollection.findOne({ _id: result.insertedId });

    // Return the newly created ticket
    return NextResponse.json({ ticket: newTicket });

  } catch (error) {
    console.error("Error during ticket creation:", error);
    return NextResponse.json(
      { error: "Failed to create ticket. Please try again." },
      { status: 500 }
    );
  }
}
