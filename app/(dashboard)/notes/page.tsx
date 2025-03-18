"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BottomBar from "@/components/BottomBar";
import Sidebar from "@/components/Sidebar";
import { useSession } from "next-auth/react";
import React from "react";
import { Pangolin } from "next/font/google";

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function NotesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fix: Pass userId in query params
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

  // ✅ Fix: Include userId in request body
  const addNote = async () => {
    if (!title.trim() || !body.trim() || !userId) return;

    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title, content: body }),
      });
      setTitle("");
      setBody("");
      fetchNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // ✅ Fix: Send { noteId, userId } in request body
  const deleteNote = async (noteId: string) => {
    if (!userId) return;

    try {
      await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, userId }),
      });
      fetchNotes();
      setSelectedNote(null);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className={`flex min-h-screen ${pangolin.className}`}>
      {!isMobile && <Sidebar />}
      {isMobile && <BottomBar />}

      <div className="flex flex-col items-center justify-center flex-1 bg-[#FBF2C0] dark:bg-[#4A3628] p-6 relative">
        <h2 className="text-3xl font-bold text-[#4A3628] dark:text-[#FAF3DD] mb-6">Notes</h2>

        {/* Note Input */}
        <div className="bg-white dark:bg-[#3A2B22] shadow-md rounded-lg p-4 w-full max-w-2xl">
          <input
            type="text"
            className="border rounded-lg w-full p-3 bg-[#FAF3DD] dark:bg-[#2A1D14] text-[#4A3628] dark:text-[#FAF3DD] outline-none focus:ring-2 focus:ring-[#F96F5D]"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="border rounded-lg w-full p-3 bg-[#FAF3DD] dark:bg-[#2A1D14] text-[#4A3628] dark:text-[#FAF3DD] resize-none outline-none focus:ring-2 focus:ring-[#F96F5D] mt-3"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your note here..."
          />
          <button
            className="mt-3 w-full bg-[#F96F5D] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#e85b4b] transition-all custom-cursor"
            onClick={addNote}
          >
            Add Note
          </button>
        </div>

        {/* Notes List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 w-full max-w-2xl">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-[#3A2B22] shadow-md rounded-lg p-4 relative transition-transform transform hover:scale-105 custom-cursor"
              onClick={() => setSelectedNote(note)}
            >
              <h3 className="text-xl font-semibold text-[#4A3628] dark:text-[#FAF3DD] mb-2 truncate">
                {note.title}
              </h3>
              <p className="text-[#4A3628] dark:text-[#FAF3DD] mb-4 break-words line-clamp-4 overflow-hidden">
                {note.content}
              </p>

              {/* Delete Button */}
              <button
                className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700 custom-cursor"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Note Modal */}
        <AnimatePresence>
          {selectedNote && (
            <motion.div
              className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center p-4 z-50 custom-cursor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNote(null)}
            >
              <motion.div
                className="bg-white dark:bg-[#3A2B22] rounded-lg p-6 w-full max-w-lg shadow-lg relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-2 right-2 text-red-500 text-lg font-bold custom-cursor"
                  onClick={() => setSelectedNote(null)}
                >
                  ✕
                </button>
                <h3 className="text-2xl font-bold text-[#4A3628] dark:text-[#FAF3DD] mb-3">
                  {selectedNote?.title || "Untitled"}
                </h3>
                <p className="text-[#4A3628] dark:text-[#FAF3DD] whitespace-pre-wrap mb-4">
                  {selectedNote?.content || "No content available."}
                </p>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedNote?.createdAt ? new Date(selectedNote.createdAt).toLocaleString() : ""}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
