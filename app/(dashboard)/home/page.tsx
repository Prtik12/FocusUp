import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="flex">
      {/* Sidebar (takes up space) */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold">Welcome to FocusUp</h1>
        <p>Here’s your home page content...</p>
      </div>
    </div>
  );
}
