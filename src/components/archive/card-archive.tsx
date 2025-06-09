"use client";

import { CardHeaderArchive } from "./card-header-archive";
import { CardContentArchive } from "./content-archive";
import { ImageContainer } from "./image-container";
import { getPublicUrl } from "@/lib/utils";
import { trpc } from "@/app/_trpc/client";

export interface ProjectType {
  id: string;
  title: string;
  content: string;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
}

type CardArchiveProps = {
  project: ProjectType;
  userId: string;
  setIsProcessing: (val: boolean) => void;
};

export function CardArchive({
  project,
  userId,
  setIsProcessing,
}: CardArchiveProps) {
  const utils = trpc.useUtils();

  const unarchive = trpc.project.unarchive.useMutation({
    onSuccess: () => {
      utils.project.getArchived.invalidate();
    },
  });

  const deleteProject = trpc.project.delete.useMutation({
    onSuccess: () => {
      utils.project.getArchived.invalidate();
    },
  });

  const handleUnarchive = () => {
    setIsProcessing(true);
    unarchive.mutate(
      { id: project.id, id_user: userId },
      {
        onSettled: () => {
          setIsProcessing(false);
        },
      }
    );
  };

  const handleDelete = () => {
    setIsProcessing(true);
    deleteProject.mutate(
      { id: project.id, id_user: userId },
      {
        onSettled: () => {
          setIsProcessing(false);
        },
      }
    );
  };

  const imageUrls = [
    project.image1,
    project.image2,
    project.image3,
    project.image4,
    project.image5,
  ]
    .filter(Boolean)
    .map((img) => getPublicUrl(img!));

  return (
    <div className="pl-1 pr-1">
      <CardHeaderArchive
        title={project.title}
        onUnarchive={handleUnarchive}
        onDelete={handleDelete}
      />
      <CardContentArchive content={project.content} />
      <ImageContainer images={imageUrls} />
    </div>
  );
}
