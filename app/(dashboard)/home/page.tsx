"use client";

import { useEffect, useState } from "react";
import BottomBar from "@/components/BottomBar";
import Sidebar from "@/components/Sidebar";
import { useSession } from "next-auth/react";
import React from "react";

export default function Home() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "User";

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`h-max relative ${isMobile ? "px-0 pb-16" : "ml-20 px-0"}`}>
      {!isMobile && <Sidebar />}
      {isMobile && <BottomBar />}

      <div className="absolute top-5 left-5 text-2xl font-semibold text-[#4A3628] dark:text-[#FAF3DD]">
        Welcome, {userName} ! 
      </div>

      <div className="min-h-screen bg-[#FBF2C0] dark:bg-[#4A3628]">
        {/* Page Content */}
      </div>

      <div className="h-screen w-full bg-red-600"></div>
      <div className="h-30 w-full bg-yellow-500"></div>
    </div>
  );
}
