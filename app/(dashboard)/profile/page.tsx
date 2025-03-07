"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";

export default function EditProfile() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [image, setImage] = useState(session?.user?.image ?? "/avatar-placeholder.png");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "/avatar-placeholder.png");
    }
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();

      // Update session with new user data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.user.name,
          image: data.user.image,
        },
      });

      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col items-center justify-center flex-1 bg-[#FBF2C0] dark:bg-[#4A3628] p-6">
        <h1 className="text-2xl font-semibold text-[#4A3628] dark:text-[#FAF3DD] mb-4">Edit Profile</h1>

        {/* Profile Picture */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
          <Image src={image} alt="Profile" width={128} height={128} className="rounded-full object-cover" />
          <label className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-sm cursor-pointer opacity-0 hover:opacity-100 transition">
            Change
            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
        </div>

        {/* Name Input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded-md border border-[#4A3628] dark:border-[#FAF3DD] bg-transparent text-[#4A3628] dark:text-[#FAF3DD] w-64 text-center mb-4"
        />

        {/* Save Changes Button */}
        <button
          onClick={handleSaveChanges}
          className="px-6 py-2 bg-[#F96F5D] text-white rounded-lg hover:bg-[#e85b4b] transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
