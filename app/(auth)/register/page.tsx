"use client"

import { SignUpForm } from "@/components/Forms/SignUp/signUpForm"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Pangolin } from "next/font/google"
import Link from "next/link"

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

export default function RegisterPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/home');
    }
  }, [session, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6 sm:py-12 bg-[#FBF2C0] px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <h1 className={`${pangolin.className} text-2xl sm:text-4xl font-bold text-center text-[#48392A] mb-4 sm:mb-6`}>
          Create Your Account
        </h1>
        <div className="bg-[#48392A] px-4 sm:px-10 py-6 sm:py-8 shadow rounded-lg sm:rounded-lg border-2 border-[#43281C]">
          <SignUpForm />
          <p className="mt-4 text-center text-xs sm:text-sm text-[#FBF2C0]">
            Already have an account?{' '}
            <Link href="/signin" className="text-[#F96F5D] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
