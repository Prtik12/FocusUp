import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    // 1️⃣ Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Parse request body
    const { name, image } = await req.json();

    // 3️⃣ Validate input
    if (!name?.trim() && !image) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    // 4️⃣ Prepare update data
    const updateData: { name?: string; image?: string } = {};
    if (name?.trim()) updateData.name = name.trim();
    if (image) updateData.image = image;

    // 5️⃣ Update user in DB
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    // 6️⃣ Return updated session data
    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 },
    );
  }
}
