import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Notes older than 90 days will be deleted
const EXPIRATION_DAYS = 90;

export async function GET(req: Request) {
  // Authorization check
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - EXPIRATION_DAYS);

    const deletedNotes = await prisma.note.deleteMany({
      where: { createdAt: { lt: expirationDate } },
    });

    return NextResponse.json(
      { message: `Deleted ${deletedNotes.count} old notes.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting old notes:", error);
    return NextResponse.json(
      { error: "Failed to delete old notes." },
      { status: 500 }
    );
  }
}
