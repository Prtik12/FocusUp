import { Toaster } from "sonner"

export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen bg-[#FAF3DD] w-full max-w-[100vw] overflow-x-hidden"> 
        {children}
        <Toaster />
      </div>
    )
  } 