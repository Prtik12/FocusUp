import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use the service role key for uploads
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `profile_${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    // Convert File to Blob
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage (Ensure bucket name is correct)
    const { data, error } = await supabase.storage
      .from("profile-images") // This must match your actual bucket name
      .upload(filePath, fileBuffer, { contentType: file.type });

    if (error) {
      console.error("Upload error:", data, error.message);
      return NextResponse.json({ message: "Failed to upload image", error: error.message }, { status: 500 });
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from("profile-images").getPublicUrl(filePath);

    if (!publicUrlData) {
      return NextResponse.json({ message: "Failed to get public URL" }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
