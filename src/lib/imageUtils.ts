import { createClerkSupabaseClient, supabase as defaultSupabase } from "./supabase";
// import imageCompression from "browser-image-compression"; // Moved to dynamic import

const BUCKET_NAME = "project-images";

/**
 * Uploads an image to Supabase Storage with compression and WebP conversion.
 * Aligned with Backend RLS requirements.
 */
export async function uploadImage(file: File, folder: string, token?: string): Promise<string> {
  try {
    // Dynamically import image-compression to prevent backend crashes
    const imageCompression = (await import("browser-image-compression")).default;

    // 1. Validate auth token if RLS is expected
    if (!token && process.env.NODE_ENV === "production") {
      console.warn("No auth token provided for Supabase upload. This may fail if RLS is enabled.");
    }

    const supabase = token ? createClerkSupabaseClient(token) : defaultSupabase;

    // 2. Compress and convert to WebP (optimized for performance and storage)
    const config = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/webp" as const,
      initialQuality: 0.8,
    };

    let uploadData: File | Blob = file;
    try {
      uploadData = await imageCompression(file, config);
    } catch (compressionError) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Image compression failed, uploading original:", compressionError);
      }
    }

    // 3. Generate unique file name
    // Use browser-native crypto for reliability in client components
    const uniqueId = typeof window !== "undefined" && window.crypto?.randomUUID 
      ? window.crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15);
    
    const fileName = `${Date.now()}-${uniqueId}.webp`;
    const filePath = `${folder}/${fileName}`;

    // 4. Convert to ArrayBuffer for maximum compatibility with Supabase Storage API
    const buffer = await uploadData.arrayBuffer();

    // 5. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: "image/webp",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("CRITICAL: Supabase Storage Error:", {
        message: error.message,
        name: error.name,
        status: (error as any).status,
        path: filePath,
        bucket: BUCKET_NAME
      });
      throw error;
    }

    // 6. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Upload Helper Caught Error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload image";
    throw new Error(message);
  }
}

export async function deleteImages(imageUrls: string[], token?: string): Promise<void> {
  // Use authenticated client if token is provided, otherwise use default
  const supabase = token ? createClerkSupabaseClient(token) : defaultSupabase;

  const filePaths: string[] = [];

  for (const url of imageUrls) {
    try {
      // Extract relative path from Supabase Public URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split(`/public/${BUCKET_NAME}/`);

      if (pathParts.length >= 2) {
        filePaths.push(pathParts[1]);
      } else if (process.env.NODE_ENV === "development") {
        console.warn("Invalid Supabase URL format, skipping delete candidate:", url);
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error parsing image URL for deletion:", err);
      }
    }
  }

  if (filePaths.length > 0) {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths);

      if (error) {
        throw error;
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error deleting images from Supabase:", err);
      }
    }
  }
}
