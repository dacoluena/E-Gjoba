import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create a unique filename
        const uniqueFilename = `${Date.now()}-${file.name}`;
        
        // Ensure the directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'gjobaImages');
        
        // Save the file
        const filePath = path.join(uploadDir, uniqueFilename);
        await writeFile(filePath, buffer);

        return NextResponse.json({ filename: uniqueFilename });
    } catch (error) {
        console.error('Error in upload route:', error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
} 