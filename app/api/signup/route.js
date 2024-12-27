import client from "@/lib/mongodb"; 
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
  
    const { name, surname, email, password, plateNumber, role } = await request.json();


    if (!name || !surname || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, surname, email, password, and role are required." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

   
    const db = (await client).db();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 409 } 
      );
    }

  
    const result = await usersCollection.insertOne({
      name,
      surname, 
      email,
      password: hashedPassword,
      plateNumber,
      role, 
      createdAt: new Date(),
    });


    const newUser = await usersCollection.findOne({ _id: result.insertedId });
    const { password: _, ...userWithoutPassword } = newUser; 

    return NextResponse.json({ user: userWithoutPassword });

  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json(
      { error: "Failed to sign up user. Please try again." },
      { status: 500 }
    );
  }
}
