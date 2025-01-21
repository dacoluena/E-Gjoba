import client from "@/lib/mongodb"; 
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const db = (await client).db();
    const ticketsCollection = db.collection("tickets");

    const { searchParams } = new URL(req.url);
    const plate = searchParams.get("plate");
    const createdBy = searchParams.get("createdBy");  // Get createdBy from query params

    // If no plate or createdBy is provided, return an error
    if (!plate && !createdBy) {
      return NextResponse.json({ error: "Plate number or createdBy is required to fetch tickets." }, { status: 400 });
    }

    // Build query object to filter tickets by either vehicle number or createdBy
    const query = {};
    if (plate) query.vehicleNumber = plate;
    if (createdBy) query.createdBy = createdBy;  // Use createdBy for filtering

    const tickets = await ticketsCollection.find(query).toArray();

    if (tickets.length === 0) {
      return NextResponse.json({ message: "No tickets found." }, { status: 404 });
    }

    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    // Extract the necessary fields from the request body
    const { vehicleNumber, offense, fineAmount, createdBy, imageUrls } = await request.json();

    // Validate required fields
    if (!vehicleNumber || !offense || !fineAmount || !createdBy) {
      return NextResponse.json(
        { error: "Vehicle number, offense, fine amount, and createdBy are required." },
        { status: 400 }
      );
    }

    // Connect to the database
    const db = (await client).db();
    const ticketsCollection = db.collection("tickets");

    // Insert the ticket data along with the image URLs
    const result = await ticketsCollection.insertOne({
      vehicleNumber,
      offense,
      fineAmount,
      createdBy,
      imageUrls, // Store image URLs in the database
      createdAt: new Date(),
    });

    // Fetch the newly inserted ticket from the database
    const newTicket = await ticketsCollection.findOne({ _id: result.insertedId });

    return NextResponse.json({ ticket: newTicket }, { status: 200 });

  } catch (error) {
    console.error("Error during ticket creation:", error);
    return NextResponse.json(
      { error: "Failed to create ticket. Please try again." },
      { status: 500 }
    );
  }
}
