import client from "@/lib/mongodb"; // MongoDB client
import bcrypt from "bcryptjs"; // To compare hashed passwords
import { NextResponse } from "next/server"; // For handling responses

export async function POST(request) {
    try {
        const { email, password } = await request.json();
        
        // Check if email and password are provided
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const db = (await client).db();
        const usersCollection = db.collection("users");

        // Check if the user exists
        const user = await usersCollection.findOne({ email });
        
        if (!user) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // Compare the entered password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // Return a success response, excluding the password field for security
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({ message: "Login successful", user: userWithoutPassword }, { status: 200 });
    } catch (error) {
        console.error("Error during login:", error);
        return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
    }
}
