import { FormLabel } from "@/components/ui/form";
import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface ImagesSectionProps {
  imagePreviews: string[];
  imageFiles: File[];
  setImageFiles: Dispatch<SetStateAction<File[]>>;
  setImagePreviews: Dispatch<SetStateAction<string[]>>;
  setTempImageSrc: Dispatch<SetStateAction<string | null>>;
  setShowCropper: Dispatch<SetStateAction<boolean>>;
}

export function ImagesSection({ 
  imagePreviews, 
  imageFiles, 
  setImageFiles, 
  setImagePreviews, 
  setTempImageSrc, 
  setShowCropper 
}: ImagesSectionProps) {
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && imageFiles.length < 5) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImageSrc(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];
    
    newImageFiles.splice(index, 1);
    newImagePreviews.splice(index, 1);
    
    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);
  };

  return (
    <div className="mb-6">
      <FormLabel className="text-white text-base mb-3">Images (Max 5)</FormLabel>
      
      {/* Image previews grid */}
      {imagePreviews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative aspect-video rounded-md overflow-hidden">
              <img 
                src={preview} 
                alt={`Project image ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload button */}
      {imagePreviews.length < 5 && (
        <div className="flex items-center justify-center border border-dashed border-white/10 rounded-md bg-background/50 h-32 cursor-pointer mt-2 hover:bg-background/70 transition-all duration-200 active:scale-90">
          <label className="w-full h-full flex items-center justify-center cursor-pointer">
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-background/80">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="mt-1 text-xs">Upload image ({imagePreviews.length}/5)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>
      )}
    </div>
  );
}