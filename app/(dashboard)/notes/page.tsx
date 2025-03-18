"use client";

import { useEffect, useState, useCallback } from "react";
import BottomBar from "@/components/BottomBar";
import Sidebar from "@/components/Sidebar";
import { useSession } from "next-auth/react";
import React from "react";
import { Pangolin } from "next/font/google";

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export default function NotesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id; // Ensure authenticated user
  const userName = session?.user?.name ?? "User";

  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen size for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch notes with useCallback
  const fetchNotes = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/notes?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async () => {
    if (!newNote.trim() || !userId) return;

    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, content: newNote }),
      });
      setNewNote("");
      fetchNotes(); // Refresh notes after adding
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!userId) return;

    try {
      await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, userId }),
      });
      fetchNotes(); // Refresh notes after deleting
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className={`h-max relative ${pangolin.className} ${isMobile ? "px-0 pb-16" : "ml-20 px-6"}`}>
      {!isMobile && <Sidebar />}
      {isMobile && <BottomBar />}

      <div className="absolute top-5 left-5 text-2xl font-semibold text-[#4A3628] dark:text-[#FAF3DD]">
        Welcome, {userName}!
      </div>

      <div className="min-h-screen pt-16 bg-[#FBF2C0] dark:bg-[#4A3628] text-[#4A3628] dark:text-[#FAF3DD]">
        <div className="max-w-3xl mx-auto mt-10">
          <h2 className="text-3xl font-bold text-center mb-6">Your Notes</h2>

          {/* Note Input Section */}
          <div className="bg-white dark:bg-[#3A2B22] shadow-md rounded-lg p-4 mb-6">
            <textarea
              className="border rounded-lg w-full p-3 bg-[#FAF3DD] dark:bg-[#2A1D14] text-[#4A3628] dark:text-[#FAF3DD] resize-none outline-none focus:ring-2 focus:ring-[#F96F5D]"
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note here..."
            />
            <button
              className="mt-3 w-full bg-[#F96F5D] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#e6584a] transition-all"
              onClick={addNote}
            >
              Add Note
            </button>
          </div>

          {/* Notes List */}
          <ul className="space-y-4">
            {notes.map((note) => (
              <li
                key={note.id}
                className="flex items-center justify-between bg-white dark:bg-[#3A2B22] shadow-md rounded-lg p-4"
              >
                <span className="text-[#4A3628] dark:text-[#FAF3DD]">{note.content}</span>
                <button
                  className="text-red-500 font-bold hover:text-red-700"
                  onClick={() => deleteNote(note.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          {/* Empty State */}
          {notes.length === 0 && (
            <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
              No notes yet. Start adding some!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
