import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Define expiration period (e.g., 90 days)
const EXPIRATION_DAYS = 90;

export async function GET() {
  try {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - EXPIRATION_DAYS);

    const deletedNotes = await prisma.note.deleteMany({
      where: { createdAt: { lt: expirationDate } },
    });

    return NextResponse.json({
      message: `Deleted ${deletedNotes.count} old notes.`,
    });
  } catch (error) {
    console.error("Error deleting old notes:", error);
    return NextResponse.json(
      { error: "Failed to delete old notes." },
      { status: 500 },
    );
  }
}
