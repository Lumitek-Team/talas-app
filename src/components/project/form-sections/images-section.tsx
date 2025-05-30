// components/project/form-sections/images-section.tsx
import { FormLabel } from "@/components/ui/form";
import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface ImagesSectionProps {
  imagePreviews: string[];
  imageFiles: File[]; // Needed for the length check when adding new images
  maxFiles: number;
  // Setters are now expected (not optional)
  setImageFiles: Dispatch<SetStateAction<File[]>>;
  setImagePreviews: Dispatch<SetStateAction<string[]>>;
  setTempImageSrc: Dispatch<SetStateAction<string | null>>;
  setShowCropper: Dispatch<SetStateAction<boolean>>;
  isEditMode?: boolean; 
}

export function ImagesSection({ 
  imagePreviews, 
  imageFiles, 
  maxFiles,
  setImageFiles, 
  setImagePreviews, 
  setTempImageSrc, 
  setShowCropper,
  isEditMode = false, 
}: ImagesSectionProps) {
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditMode) return; // Do nothing if in edit mode

    const file = e.target.files?.[0];
    // Check against imageFiles.length as per your original logic for adding new files
    if (file && imageFiles.length < maxFiles) { 
      const reader = new FileReader();
      reader.onload = () => {
        setTempImageSrc(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    } else if (file && imageFiles.length >= maxFiles) {
      alert(`You can upload a maximum of ${maxFiles} images.`);
    }
    
    if (e.target) {
        e.target.value = ""; 
    }
  };

  const removeImage = (index: number) => {
    if (isEditMode) return; // Do nothing if in edit mode

    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];
    
    newImageFiles.splice(index, 1);
    newImagePreviews.splice(index, 1);
    
    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);
  };

  return (
    <div className="mb-6">
      <FormLabel className="text-white text-base mb-3">Images (Max {maxFiles})</FormLabel>
      
      {imagePreviews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative aspect-video rounded-md overflow-hidden">
              <img 
                src={preview} 
                alt={`Project image ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              {!isEditMode && ( // Only show remove button if not in edit mode
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {!isEditMode && imageFiles.length < maxFiles && ( // Show upload if not edit mode and space available
        <div className="flex items-center justify-center border border-dashed border-white/10 rounded-md bg-background/50 h-32 cursor-pointer mt-2 hover:bg-background/70 transition-all duration-200 active:scale-90">
          <label className="w-full h-full flex items-center justify-center cursor-pointer">
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-background/80">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              {/* Use imageFiles.length for the counter as it reflects processed files */}
              <p className="mt-1 text-xs">Upload image ({imageFiles.length}/{maxFiles})</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isEditMode} 
            />
          </label>
        </div>
      )}
      {isEditMode && imagePreviews.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No images were uploaded for this project.</p>
      )}
    </div>
  );
}