import client from "@/lib/mongodb";
import { NextResponse } from "next/server";



export async function GET() {
  try {
    const db = (await client).db();  
    const usersCollection = db.collection("users");  
    const users = await usersCollection.find().toArray();  
    return NextResponse.json(users);  
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
