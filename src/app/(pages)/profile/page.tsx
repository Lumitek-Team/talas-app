"use client";

import { useState } from "react";
import Image from "next/image";
// import { getImageUrl, uploadFile } from '@/lib/supabase/storage'

export default function ProfilePage() {
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [imageUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    // TODO: Implement upload when Supabase storage is ready
    setUploadStatus("Upload feature coming soon");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile Picture</h1>

      <input type="file" id="fileInput" className="mb-4" accept="image/*" />
      <button
        onClick={handleUpload}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Upload Profile Picture
      </button>

      <p className="mt-4 text-sm text-gray-700">{uploadStatus}</p>

      {imageUrl && (
        <div className="mt-6">
          <p className="mb-2">Preview:</p>
          <div className="w-32 h-32 relative">
            <Image
              src={imageUrl}
              alt="Profile"
              fill
              className="rounded-full object-cover shadow"
              sizes="(max-width: 128px) 100vw"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}
