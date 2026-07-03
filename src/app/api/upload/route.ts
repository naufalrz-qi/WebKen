import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
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

    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    const section = formData.get("section") as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Convert to webp using sharp
      // We resize it to a max of 1200px width/height to keep size low but quality acceptable
      const webpBuffer = await sharp(buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toBuffer();

      // Create filename: fixed name if section provided, otherwise unique
      const filename = section ? `${section}.webp` : `${Date.now()}-${randomBytes(8).toString("hex")}.webp`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage.from(BUCKET).upload(filename, webpBuffer, {
        contentType: "image/webp",
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
