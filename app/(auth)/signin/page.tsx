"use client";

import { SignInForm } from "@/components/Forms/SignIn/signInForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pangolin } from "next/font/google";
import { useEffect } from "react";
import Link from "next/link";

// ✅ Move font import OUTSIDE the component
const pangolin = Pangolin({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function SignInPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/home");
    }
  }, [session, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6 sm:py-12 bg-[#FBF2C0] px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* ✅ Fixed className syntax */}
        <h2
          className={`${pangolin.className} mt-4 sm:mt-6 text-center text-4xl sm:text-5xl font-bold tracking-tight text-[#48392A]`}
        >
          FocusUp <span className="text-[#F96F5D]">!</span>
        </h2>
        <p
          className={`${pangolin.className} mt-2 text-center text-xs sm:text-sm text-[#48392A]`}
        >
          Let&apos;s get started
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full max-w-md">
        <div className="bg-[#48392A] px-4 sm:px-10 py-6 sm:py-8 shadow rounded-lg sm:rounded-lg border-2 border-[#43281C]">
          <SignInForm />
          <p className="mt-4 text-center text-xs sm:text-sm text-[#FBF2C0]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#F96F5D] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
