import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables!");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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

    // Convert File to ArrayBuffer and then Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage (ignore unused 'data' variable)
    const { error } = await supabase.storage
      .from("profile-images") // Ensure bucket name is correct
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true, // Allows overwriting existing files
      });

    if (error) {
      console.error("Upload error:", error.message);
      return NextResponse.json({ message: "Failed to upload image", error: error.message }, { status: 500 });
    }

    // Retrieve the public URL
    const { data: urlData } = supabase.storage.from("profile-images").getPublicUrl(filePath);
    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      return NextResponse.json({ message: "Failed to retrieve public URL" }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
