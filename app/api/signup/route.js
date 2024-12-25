import client from "@/lib/mongodb"; // Your MongoDB client
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // For password hashing

export async function POST(request) {
  try {
    // Parse the JSON body of the request
    const { name, surname, email, password, plateNumber, role } = await request.json();

    // Check if all fields are provided (including the new ones)
    if (!name || !surname || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, surname, email, password, and role are required." },
        { status: 400 }
      );
    }

    // Hash the password before storing it (important for security)
    const hashedPassword = await bcrypt.hash(password, 10); // You can adjust the salt rounds as needed

    // Connect to the database
    const db = (await client).db();
    const usersCollection = db.collection("users");

    // Check if the user already exists by email (optional but recommended)
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 409 } // Conflict status
      );
    }

    // Insert the new user into the collection
    const result = await usersCollection.insertOne({
      name,
      surname, // Insert surname
      email,
      password: hashedPassword,
      plateNumber, // Insert plate number (can be optional)
      role, // Insert role
      createdAt: new Date(), // You can add more fields as needed
    });

    // Fetch the newly inserted user (excluding the password)
    const newUser = await usersCollection.findOne({ _id: result.insertedId });
    const { password: _, ...userWithoutPassword } = newUser; // Exclude the password

    // Return the newly created user (without password)
    return NextResponse.json({ user: userWithoutPassword });

  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json(
      { error: "Failed to sign up user. Please try again." },
      { status: 500 }
    );
  }
}
