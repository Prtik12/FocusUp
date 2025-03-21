import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth"; // Ensure you have this

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await prisma.event.findMany({
    where: { user: { email: session.user.email } },
  });

  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, date } = await req.json();
  if (!title || !date)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const event = await prisma.event.create({
    data: {
      title,
      date: new Date(date),
      userId: user.id,
    },
  });

  return NextResponse.json(event);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
  }

  // Convert id to a number
  const eventId = Number(id);

  // Check if event exists and belongs to the user
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { user: true }, // Get user info for validation
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.user.email !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete event
  await prisma.event.delete({
    where: { id: eventId },
  });

  return NextResponse.json({ success: true });
}
