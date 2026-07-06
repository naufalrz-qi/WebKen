import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "images";

export async function POST(req: NextRequest) {
  try {
    // Enforce authentication
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    const section = formData.get("section") as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Direct upload without sharp to avoid Vercel native module/memory issues
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = section ? `${section}.${ext}` : `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;

      // Upload the raw file directly to Supabase Storage
      const { error } = await supabase.storage.from(BUCKET).upload(filename, file, {
        contentType: file.type || `image/${ext}`,
        upsert: !!section, // overwrite section images (hero, about, etc.)
      });

      if (error) {
        console.error("Supabase Storage upload error:", error.message);
        return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      uploadedUrls.push(urlData.publicUrl);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "File upload failed" }, { status: 500 });
  }
}
