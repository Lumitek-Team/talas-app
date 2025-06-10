"use client";

import { CardHeaderProjectProfile } from "./card-header-project-profile";
import { ContentProjectProfile } from "./content-project-profile";
import { ImageContainerProjectProfile } from "./image-container-project-profile";
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

type CardProjectProfileProps = {
  project: ProjectType;
  userId: string;
};

export function CardProjectProfile({
  project,
  userId,
}: CardProjectProfileProps) {
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
    unarchive.mutate({ id: project.id, id_user: userId });
  };

  const handleDelete = () => {
    deleteProject.mutate({ id: project.id, id_user: userId });
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
      <CardHeaderProjectProfile
        title={project.title}
        onUnarchive={handleUnarchive}
        onDelete={handleDelete}
      />
      <ContentProjectProfile content={project.content} />
      <ImageContainerProjectProfile images={imageUrls} />
    </div>
  );
}
