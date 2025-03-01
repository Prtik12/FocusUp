'use client'

import { SignUpForm } from "@/components/Forms/SignUp/signUpForm"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function RegisterPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/home')
    }
  }, [session, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6 sm:py-12 bg-[#FAF3DD] px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-[#E4C1F9] px-4 sm:px-10 py-6 sm:py-8 shadow rounded-lg sm:rounded-lg border-2 border-black">
          <h1 className="text-xl text-[#4A4E69] sm:text-2xl font-bold text-center mb-4 sm:mb-6">Create your account</h1>
          <SignUpForm />
          <p className="mt-4 text-center text-xs sm:text-sm text-[#4A4E69]">
            Already have an account?{' '}
            <Link href="/signin" className="text-[#7fb236] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 