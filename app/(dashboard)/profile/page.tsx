"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Pangolin } from "next/font/google";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BottomBar from "@/components/BottomBar";
import imageCompression from "browser-image-compression";

const pangolin = Pangolin({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function EditProfile() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [image, setImage] = useState("/avatar-placeholder.png");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Load session data
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "/avatar-placeholder.png");
    }
  }, [session]);

  // Handle image selection & compression
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 🔽 Compression Options
      const options = {
        maxSizeMB: 1, // Max 1MB
        maxWidthOrHeight: 1024, // Resize within 1024px
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      setSelectedFile(compressedFile);
      setImage(URL.createObjectURL(compressedFile)); // Instant preview
    } catch (error) {
      console.error("Image compression error:", error);
      setError("Failed to process image.");
    }
  };

  // Save changes to the profile
  const handleSaveChanges = async () => {
    setLoading(true);
    setError(null);

    try {
      let imageUrl = image;

      // Upload image if a new file is selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error("Failed to upload image");

        const uploadData = await uploadResponse.json();
        if (!uploadData || !uploadData.url) {
          throw new Error("Invalid upload response");
        }
        imageUrl = uploadData.url; // ✅ Ensure correct URL handling
      }

      // Update profile
      const response = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: imageUrl }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();

      // ✅ Force update session & UI state
      // ✅ Force NextAuth to refresh the session properly
      const updated = await update();
      if (!updated) throw new Error("Session update failed");

      // Manually refetch session data
      router.refresh();

      if (!updated) throw new Error("Session update failed");

      setName(data.user.name);
      setImage(data.user.image);

      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`flex min-h-screen ${pangolin.className}`}>
      {!isMobile && <Sidebar />}
      {isMobile && <BottomBar />}
      <div className="flex flex-col items-center justify-center flex-1 bg-[#FBF2C0] dark:bg-[#4A3628] p-6">
        <h1 className="text-2xl font-semibold text-[#4A3628] dark:text-[#FAF3DD] mb-4">
          Edit Profile
        </h1>

        {/* Profile Picture */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-[#4A3628] dark:border-[#FAF3DD]">
          <Image
            src={image}
            alt="Profile"
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
          <label className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-sm cursor-pointer opacity-0 hover:opacity-100 transition">
            Change
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>

        {/* Name Input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded-md border border-[#4A3628] dark:border-[#FAF3DD] bg-transparent text-[#4A3628] dark:text-[#FAF3DD] w-64 text-center mb-4"
        />

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {/* Save Changes Button */}
        <button
          onClick={handleSaveChanges}
          disabled={loading}
          className={`px-6 py-2 rounded-lg transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#F96F5D] text-white hover:bg-[#e85b4b]"
          }`}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
