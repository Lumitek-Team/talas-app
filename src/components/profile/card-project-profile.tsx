"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CardHeaderProjectProfile } from "./card-header-project-profile";
import { ContentProjectProfile } from "./content-project-profile";
import { ImageContainerProjectProfile } from "./image-container-project-profile";
import { getImageUrl } from "@/lib/supabase/storage";
import { getPublicUrl } from "@/lib/utils";
import { trpc } from "@/app/_trpc/client";

export interface ProjectType {
  id: string;
  created_at: string;
  title: string;
  content: string;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
}

type CardProjectProfileProps = {
  project: ProjectType;
  userId: string;
  isPinned?: boolean;
  onMutateSuccess?: () => void;
  isMyProfile?: boolean;
  titleProjectProfile?: string;
};

export function CardProjectProfile({
  project,
  userId,
  isPinned,
  onMutateSuccess,
  isMyProfile,
  titleProjectProfile,
}: CardProjectProfileProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const loadImageUrls = async () => {
      const images = [
        project.image1,
        project.image2,
        project.image3,
        project.image4,
        project.image5,
      ].filter((img): img is string => !!img && img.trim() !== "");

      const urls = await Promise.all(
        images.map((img) => getPublicUrl(img))
      );

      setImageUrls(urls);
    };

    loadImageUrls();
  }, [project]);

  const archive = trpc.project.archive.useMutation({
    onSuccess: () => {
      utils.project.getArchived.invalidate();
      utils.user.getAllProjects.invalidate();
      onMutateSuccess?.();
    },
  });

  const deleteProject = trpc.project.delete.useMutation({
    onSuccess: () => {
      utils.project.getArchived.invalidate();
      utils.user.getAllProjects.invalidate();
      onMutateSuccess?.();
    },
  });

  const pin = trpc.pin.pin.useMutation({
    onSuccess: () => {
      utils.user.getAllProjects.invalidate();
      onMutateSuccess?.();
    },
  });

  const unpin = trpc.pin.unpin.useMutation({
    onSuccess: () => {
      utils.user.getAllProjects.invalidate();
      onMutateSuccess?.();
    },
  });

  const handleArchive = () => {
    archive.mutate({ id: project.id, id_user: userId });
  };

  const handleDelete = () => {
    deleteProject.mutate({ id: project.id, id_user: userId });
  };

  const handlePin = () => {
    pin.mutate({ id_project: project.id, id_user: userId });
  };

  const handleUnpin = () => {
    unpin.mutate({ id_project: project.id, id_user: userId });
  };

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const handleEdit = () => {
    const slug = slugify(project.title);
    router.push(`/project/${slug}`);
  };

  return (
    <div className="mt-5 border-b border-white/10 ">
      <CardHeaderProjectProfile
        title={project.title}
        createAt={project.created_at}
        onEdit={handleEdit}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onPin={handlePin}
        onUnpin={handleUnpin}
        isArchiving={archive.status === "pending"}
        isPinned={isPinned}
        isMyProfile={isMyProfile}
      />
      <ContentProjectProfile content={project.content} />
      <ImageContainerProjectProfile images={imageUrls} />
    </div>
  );
}
