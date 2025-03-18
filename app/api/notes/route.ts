import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all notes for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notes, { status: 200 });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

// POST a new note
export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const { userId, title, content } = body;
  
      if (!userId || !title || !content) {
        return NextResponse.json({ error: "Missing userId, title, or content" }, { status: 400 });
      }
  
      const newNote = await prisma.note.create({
        data: { userId, title, content },
      });
  
      return NextResponse.json(newNote, { status: 201 });
    } catch (error) {
      console.error("Error creating note:", error);
      return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
    }
  }  

// DELETE a note
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { noteId, userId } = body;

    if (!noteId || !userId) {
      return NextResponse.json({ error: "Missing noteId or userId" }, { status: 400 });
    }

    const note = await prisma.note.findUnique({ where: { id: noteId } });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized: Cannot delete this note" }, { status: 403 });
    }

    await prisma.note.delete({ where: { id: noteId } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
