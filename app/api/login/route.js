import client from "@/lib/mongodb"; 
import bcrypt from "bcryptjs"; 
import { NextResponse } from "next/server"; 

export async function POST(request) {
    try {
        const { email, password } = await request.json();
        
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const db = (await client).db();
        const usersCollection = db.collection("users");

        
        const user = await usersCollection.findOne({ email });
        
        if (!user) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }


        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({ message: "Login successful", user: userWithoutPassword }, { status: 200 });
    } catch (error) {
        console.error("Error during login:", error);
        return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
    }
}
