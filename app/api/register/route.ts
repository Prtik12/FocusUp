import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    let body;

    // Handle potential JSON parsing errors
    try {
      body = await req.json();
    } catch (error) {
      console.error("JSON Parsing Error:", error);
      return NextResponse.json(
        { message: "Invalid JSON format" },
        { status: 400 },
      );
    }

    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "Email already registered" },
          { status: 409 },
        );
      }

      // Hash password securely
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in database
      const newUser = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
        },
        select: { id: true, email: true },
      });

      return NextResponse.json(
        { message: "User registered successfully", user: newUser },
        { status: 201 },
      );
    } catch (dbError) {
      console.error("Database Error:", dbError);
      return NextResponse.json(
        { message: "Database error. Please try again later." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Unexpected Server Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
