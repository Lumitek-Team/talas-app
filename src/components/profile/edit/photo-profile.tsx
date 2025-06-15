"use client";

import { useRef, useState, useEffect } from "react";
import { UserRound, Plus } from "lucide-react";
import Image from "next/image";
import ImageCropperModal from "@/components/imageCropper"; // ⬅️ sesuaikan path-nya

interface PhotoProfileProps {
  photoUrl?: string;
  onChange?: (file: File) => void;
}

export function PhotoProfile({ photoUrl, onChange }: PhotoProfileProps) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  const handleClick = () => {
    inputFileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRawImage(url);            // tampilkan modal crop
      setCropModalOpen(true);
    }
  };

  const handleCropDone = (file: File) => {
    const croppedUrl = URL.createObjectURL(file);
    setPreview(croppedUrl);
    onChange?.(file);              // hasil crop dikirim ke parent
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="space-y-2">
      <div className="relative w-18 h-18 cursor-pointer" onClick={handleClick}>
        {preview || photoUrl ? (
          <Image
            src={preview || photoUrl!}
            alt="Profile"
            width={72}
            height={72}
            className="rounded-full object-cover object-center w-[72px] h-[72px]"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <UserRound className="w-10 h-10 text-black" />
          </div>
        )}

        <div className="absolute -bottom-0 -right-0 w-6 h-6 bg-[#68DE68] rounded-full border-2 border-[#1e1e1e] flex items-center justify-center">
          <Plus className="w-3 h-3 text-black" />
        </div>

        <input
          ref={inputFileRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label="Upload profile photo"
          onChange={handleFileChange}
        />
      </div>

      {rawImage && (
        <ImageCropperModal
          open={cropModalOpen}
          imageSrc={rawImage}
          aspectRatio={1} // untuk foto profil (square)
          onClose={() => {
            setCropModalOpen(false);
            setRawImage(null); // bersihkan setelah modal ditutup
          }}
          onCropDone={handleCropDone}
        />
      )}
    </div>
  );
}