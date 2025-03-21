import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession();

  // Check if the user is authenticated
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await request.json();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save activity data" },
      { status: 500 },
    );
  }
}
