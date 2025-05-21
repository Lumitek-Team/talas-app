"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import ImageCropperModal from "@/components/imageCropper";
import { usePostsStore } from "@/lib/store/posts-store";
import { TitleSection } from "./form-sections/title-section";
import { CaptionSection } from "./form-sections/caption-section";
import { GithubUrlSection } from "./form-sections/github-url-section";
import { FigmaUrlSection } from "./form-sections/figma-url-section";
import { ImagesSection } from "./form-sections/images-section";
import { CategorySection } from "./form-sections/category-section";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  caption: z.string().min(1, "Caption is required"),
  githubUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  figmaUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

const availableCategories = [
  { id: "design", title: "Design" },
  { id: "development", title: "Development" },
  { id: "showcase", title: "Showcase" },
  { id: "research", title: "Research" },
  { id: "tutorial", title: "Tutorial" },
  { id: "mobile", title: "Mobile" },
  { id: "web", title: "Web" },
  { id: "ai", title: "AI" },
  { id: "backend", title: "Backend" },
  { id: "frontend", title: "Frontend" }
];

export function ProjectForm() {
  const router = useRouter();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const postsStore = usePostsStore();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      caption: "",
      githubUrl: "",
      figmaUrl: "",
      category: "",
    },
  });

  const handleCropComplete = (croppedFile: File) => {
    if (imageFiles.length < 5) {
      setImageFiles([...imageFiles, croppedFile]);
      
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews([...imagePreviews, reader.result as string]);
      };
      reader.readAsDataURL(croppedFile);
    }
  };

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      // Create image URLs for the post
      const imageUrls = imagePreviews.map(preview => preview);
      
      // Since we're using dummy data, create a new post in the store
      const newPost = {
        id: Date.now().toString(),
        title: data.title,
        content: data.caption,
        username: "User", // Dummy username
        userRole: "Developer", // Dummy role
        avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
        timestamp: "Just now",
        images: imageUrls,
        likes: 0,
        comments: 0,
        link_figma: data.figmaUrl || undefined,
        link_github: data.githubUrl || undefined,
        category: {
          slug: selectedCategory,
          title: availableCategories.find(c => c.id === selectedCategory)?.title || "Uncategorized"
        }
      };

      // Add the new post to the store
      postsStore.addPost(newPost);

      // Navigate back to feeds page after submission
      router.push("/");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="w-full">
      <ImageCropperModal
        open={showCropper}
        imageSrc={tempImageSrc || ""}
        aspectRatio={16 / 9}
        onClose={() => setShowCropper(false)}
        onCropDone={handleCropComplete}
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <TitleSection form={form} />
            <CaptionSection form={form} />
            <GithubUrlSection form={form} />
            <FigmaUrlSection form={form} />
            
            <ImagesSection 
              imagePreviews={imagePreviews}
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
              setImagePreviews={setImagePreviews}
              setTempImageSrc={setTempImageSrc}
              setShowCropper={setShowCropper}
            />
            
            <CategorySection 
              form={form}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              availableCategories={availableCategories}
            />
          </div>

          <div className="flex w-full pt-4">
            <Button 
              type="submit" 
              className="w-full bg-primary text-white px-6 py-2.5 rounded-md hover:bg-primary-foreground text-sm font-medium transition-all duration-200 active:scale-90"
            >
              Post
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}