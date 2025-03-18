"use client";

import { useEffect, useState } from "react";

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export default function NotesPage() {
  const userId = "your-user-id"; // Replace with actual user ID from authentication
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const response = await fetch(`/api/notes?userId=${userId}`);
    const data = await response.json();
    setNotes(data);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, content: newNote }),
    });

    setNewNote("");
    fetchNotes();
  };

  const deleteNote = async (noteId: string) => {
    await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, userId }),
    });

    fetchNotes();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Notes</h2>

      <div className="flex gap-2 mb-4">
        <textarea
          className="border p-2 w-full"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a note..."
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addNote}
        >
          Add Note
        </button>
      </div>

      <ul className="space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="border p-2 flex justify-between">
            <span>{note.content}</span>
            <button
              className="text-red-500"
              onClick={() => deleteNote(note.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
