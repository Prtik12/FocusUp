"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner"; // Sonner for toasts
import { z } from "zod";
import { FcGoogle } from "react-icons/fc"; // Google logo

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function SignInForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (email: string, password: string) => {
    try {
      signInSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!validateForm(email, password)) {
      setLoading(false);
      return;
    }

    try {
      // Check if the user exists before attempting sign-in
      const userCheck = await fetch("/api/check-user", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      const { userExists } = await userCheck.json();

      if (!userExists) {
        toast.warning("User Not Found", {
          description: "Please sign up first.",
        });

        setTimeout(() => {
          router.push("/register");
        }, 2000);

        return;
      }

      // Attempt to sign in
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid Credentials", {
          description: "The email or password you entered is incorrect.",
        });
        return;
      }

      toast.success("Logged in successfully!");

      router.push("/home");
      router.refresh();
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("User Not Found", {
        description: "Please sign up first.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          name="email"
          placeholder="Email"
          required
          className={`w-full text-[#FAF3DD] ${errors.email ? "border-red-500" : ""}`}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email}</p>
        )}
      </div>
      <div>
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
          className={`w-full text-[#FAF3DD] ${errors.password ? "border-red-500" : ""}`}
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full cursor-pointer text-black bg-[#FAF3DD] hover:bg-[#e3dcc9]"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      {/* Google Sign-In Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/home" })}
          className="w-auto mt-2 flex items-center justify-center"
        >
          <FcGoogle className="h-6 w-6" />
        </button>
      </div>

      {/* Sonner Toaster (placed at the bottom to ensure only one instance) */}
      <Toaster position="bottom-right" richColors closeButton />
    </form>
  );
}
