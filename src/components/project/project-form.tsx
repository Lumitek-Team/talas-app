// components/project/project-form.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormMessage } from "@/components/ui/form";
import ImageCropperModal from "@/components/imageCropper";
import { TitleSection } from "./form-sections/title-section";
import { CaptionSection } from "./form-sections/caption-section";
import { GithubUrlSection } from "./form-sections/github-url-section";
import { FigmaUrlSection } from "./form-sections/figma-url-section";
import { ImagesSection } from "./form-sections/images-section";
import { CategorySection } from "./form-sections/category-section";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";
import { uploadImage, getPublicUrl } from "@/lib/utils";
import { ProjectOneType } from "@/lib/type";

const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  caption: z.string().min(1, "Caption (content) is required"),
  githubUrl: z.string().url("Please enter a valid URL if provided, or leave empty to clear.").optional().or(z.literal("")),
  figmaUrl: z.string().url("Please enter a valid URL if provided, or leave empty to clear.").optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  mode?: "create" | "edit";
  project?: ProjectOneType | null; 
}

export function ProjectForm({ mode = "create", project }: ProjectFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { user, isLoaded: isUserLoaded } = useUser();

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const { data: fetchedCategories, isLoading: isLoadingCategories } = trpc.category.getAll.useQuery(undefined, {
    enabled: isUserLoaded && (mode === "create" || (mode === "edit" && !!project)),
  });

  const availableCategories = useMemo(() => {
    return fetchedCategories?.map(cat => ({ id: cat.id, title: cat.title })) || [];
  }, [fetchedCategories]);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "", caption: "", githubUrl: "", figmaUrl: "", category: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && project) {
      form.reset({
        title: project.title || "",
        caption: project.content || "",
        githubUrl: project.link_github || "",
        figmaUrl: project.link_figma || "",
        category: project.category?.id || "",
      });
      const existingImageUrls = [
        project.image1, project.image2, project.image3, project.image4, project.image5,
      ].map(url => url ? getPublicUrl(url) : "").filter(Boolean) as string[];
      setImagePreviews(existingImageUrls);
      setImageFiles([]); 
    } else if (mode === "create") {
      form.reset({ title: "", caption: "", githubUrl: "", figmaUrl: "", category: "" });
      setImagePreviews([]);
      setImageFiles([]);
    }
  }, [mode, project, form]);

  const projectCreateMutation = trpc.project.create.useMutation({
    onSuccess: (data) => {
      setIsSubmittingForm(false);
      utils.project.getAll.invalidate();
      router.push(`/project/${data.slug}`);
    },
    onError: (error) => {
      setIsSubmittingForm(false);
      form.setError("root", { message: error.message || "Failed to create project." });
    },
  });

  const projectUpdateMutation = trpc.project.edit.useMutation({
    onSuccess: (data) => {
      setIsSubmittingForm(false);
      if (project) { 
        utils.project.getOne.invalidate({ id: project.id, id_user: user?.id }); 
        utils.project.getOne.invalidate({ id: project.slug, id_user: user?.id }); 
      }
      utils.project.getAll.invalidate();
      router.replace(`/project/${data.slug}`);
    },
    onError: (error) => {
      setIsSubmittingForm(false);
      form.setError("root", { message: error.message || "Failed to update project." });
    },
  });

  // handleCropComplete for CREATE mode (appends to list)
  // This is called by ImageCropperModal
  const handleCropComplete = (croppedFile: File) => {
    if (mode === "create") { // Ensure this logic only runs in create mode
        if (imageFiles.length < 5) { // Max 5 images
            setImageFiles(prevFiles => [...prevFiles, croppedFile]);
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreviews(prevPreviews => [...prevPreviews, reader.result as string]);
            };
            reader.readAsDataURL(croppedFile);
        }
    }
    setShowCropper(false); // Always close cropper
    setTempImageSrc(null); // Always clear temp image
  };
  
  const onSubmit = async (data: ProjectFormValues) => {
    if (!user?.id) {
      form.setError("root", { message: "User not authenticated." });
      return;
    }
    setIsSubmittingForm(true);
    form.clearErrors("root");

    const commonDataPayload = {
      id_category: data.category,
      title: data.title,
      content: data.caption,
      link_figma: data.figmaUrl || null,
      link_github: data.githubUrl || null,
    };

    if (mode === "create") {
      try {
        const uploadedImagePaths: (string | undefined)[] = await Promise.all(
            imageFiles.map(file => file ? uploadImage(file, "project") : Promise.resolve(undefined))
        );
        
        const finalImagePaths = new Array(5).fill(undefined);
        uploadedImagePaths.forEach((path, index) => {
            if (index < 5) finalImagePaths[index] = path;
        });

        await projectCreateMutation.mutateAsync({
          ...commonDataPayload,
          id_user: user.id,
          image1: finalImagePaths[0],
          image2: finalImagePaths[1],
          image3: finalImagePaths[2],
          image4: finalImagePaths[3],
          image5: finalImagePaths[4],
          is_archived: false, 
        });
      } catch (error) {
        setIsSubmittingForm(false);
        form.setError("root", { message: (error as Error).message || "Image upload or project creation failed." });
      }
    } else if (mode === "edit" && project && project.id) { 
      await projectUpdateMutation.mutateAsync({
        ...commonDataPayload,
        id: project.id, 
        id_user: user.id,
      });
    }
  };

  return (
    <div className="w-full">
      {/* ImageCropperModal is controlled by ProjectForm's state, 
          but only triggered by ImagesSection in create mode */}
      <ImageCropperModal
        open={showCropper}
        imageSrc={tempImageSrc || ""}
        aspectRatio={16 / 9}
        onClose={() => {
          setShowCropper(false);
          setTempImageSrc(null);
        }}
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
              imageFiles={imageFiles} // Pass for length checks in ImagesSection (create mode)
              maxFiles={5}
              // Pass all setters directly. ImagesSection will use them if not isEditMode.
              setImageFiles={setImageFiles}
              setImagePreviews={setImagePreviews}
              setTempImageSrc={setTempImageSrc}
              setShowCropper={setShowCropper}
              isEditMode={mode === "edit"}
            />
            {mode === "edit" && <p className="text-sm text-muted-foreground text-center">Image editing is not available for existing projects.</p>}
            
            <CategorySection 
              form={form}
              availableCategories={availableCategories}
              isLoading={isLoadingCategories}
            />
          </div>
          {form.formState.errors.root && (
            <FormMessage>{form.formState.errors.root.message}</FormMessage>
          )}
          <div className="flex w-full pt-4">
            <Button 
              type="submit" 
              disabled={isSubmittingForm || !isUserLoaded || isLoadingCategories}
              className="w-full bg-primary text-white px-6 py-2.5 rounded-md hover:bg-primary-foreground text-sm font-medium transition-all duration-200 active:scale-90"
            >
              {isSubmittingForm ? (mode === "create" ? "Posting..." : "Updating...") : (mode === "create" ? "Post" : "Update Project")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ProjectForm;