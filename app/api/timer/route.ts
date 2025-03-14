import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Fetch the timer session
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timerSession = await prisma.timerSession.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(timerSession);
}

// Start or update the timer session
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { focusTime, restTime, isFocusMode, isRunning } = await req.json();

  const updatedTimer = await prisma.timerSession.upsert({
    where: { userId: session.user.id },
    update: {
      focusTime,
      restTime,
      timeLeft: focusTime,
      isFocusMode,
      isRunning,
      startTime: isRunning ? new Date() : null,
    },
    create: {
      userId: session.user.id,
      focusTime,
      restTime,
      timeLeft: focusTime,
      isFocusMode,
      isRunning,
      startTime: isRunning ? new Date() : null,
    },
  });

  return NextResponse.json(updatedTimer);
}

// Update timer progress
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { timeLeft, isRunning } = await req.json();

  const updatedTimer = await prisma.timerSession.update({
    where: { userId: session.user.id },
    data: {
      timeLeft,
      isRunning,
      startTime: isRunning ? new Date() : null,
    },
  });

  return NextResponse.json(updatedTimer);
}

// Reset timer
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.timerSession.deleteMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ message: "Timer reset" });
}
