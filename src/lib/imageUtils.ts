import { createClerkSupabaseClient, supabase as defaultSupabase } from "./supabase";
import { randomUUID } from "crypto";

const BUCKET_NAME = "project-images";

export async function uploadImage(file: File, folder: string, token?: string): Promise<string> {
  try {
    // Use authenticated client if token is provided, otherwise use default
    const supabase = token ? createClerkSupabaseClient(token) : defaultSupabase;

    // Convert the file to buffer/arrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer();

    // Extract file extension
    const fileExt = file.name.split(".").pop();

    // Generate unique file name
    const uniqueId = randomUUID();
    const fileName = `${Date.now()}-${uniqueId}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image to Supabase:", error);
    throw new Error("Failed to upload image");
  }
}

export async function deleteImages(imageUrls: string[], token?: string): Promise<void> {
  // Use authenticated client if token is provided, otherwise use default
  const supabase = token ? createClerkSupabaseClient(token) : defaultSupabase;

  for (const url of imageUrls) {
    try {
      // Extract relative path from Supabase Public URL
      // Example URL: https://xyz.supabase.co/storage/v1/object/public/project-image/folder/name.jpg
      // We need: folder/name.jpg
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split(`/public/${BUCKET_NAME}/`);

      if (pathParts.length < 2) {
        console.warn("Invalid Supabase URL format, skipping delete:", url);
        continue;
      }

      const filePath = pathParts[1];

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      console.log("Deleted file from Supabase:", filePath);
    } catch (err) {
      console.error("Error deleting image from Supabase:", err);
    }
  }
}
