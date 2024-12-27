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

    const { vehicleNumber, offense, fineAmount, createdBy } = await request.json();

   
    if (!vehicleNumber || !offense || !fineAmount || !createdBy) {
      return NextResponse.json(
        { error: "Vehicle number, offense, fine amount, and createdBy are required." },
        { status: 400 }
      );
    }

    const db = (await client).db();
    const ticketsCollection = db.collection("tickets");

  
    const result = await ticketsCollection.insertOne({
      vehicleNumber,
      offense,
      fineAmount,
      createdBy, 
      createdAt: new Date(),
    });

  
    const newTicket = await ticketsCollection.findOne({ _id: result.insertedId });

  
    return NextResponse.json({ ticket: newTicket });

  } catch (error) {
    console.error("Error during ticket creation:", error);
    return NextResponse.json(
      { error: "Failed to create ticket. Please try again." },
      { status: 500 }
    );
  }
}

