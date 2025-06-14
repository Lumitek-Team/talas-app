"use client";

import { useState } from "react";
import { CardHeaderArchive } from "./card-header-archive";
import { CardContentArchive } from "./content-archive";
import { ImageContainer } from "./image-container";
import { getPublicUrl } from "@/lib/utils";
import { trpc } from "@/app/_trpc/client";
import { CustomAlertDialog } from "../ui/custom-alert-dialog";

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

  const [openUnarchiveDialog, setOpenUnarchiveDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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
        onUnarchive={() => setOpenUnarchiveDialog(true)}
        onDelete={() => setOpenDeleteDialog(true)}
      />
      <CardContentArchive content={project.content} />
      <ImageContainer images={imageUrls} />

      {/* Dialog konfirmasi Unarchive */}
      <CustomAlertDialog
        isOpen={openUnarchiveDialog}
        onOpenChange={setOpenUnarchiveDialog}
        title="Unarchive Project"
        description="Are you sure you want to unarchive this project?"
        onConfirm={handleUnarchive}
        confirmText="Yes, unarchive"
        cancelText="Cancel"
        confirmButtonVariant="default"
      />

      {/* Dialog konfirmasi Delete */}
      <CustomAlertDialog
        isOpen={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Delete Project"
        description="This action cannot be undone. Are you sure you want to delete this project permanently?"
        onConfirm={handleDelete}
        confirmText="Yes, delete"
        cancelText="Cancel"
        confirmButtonVariant="destructive"
      />
    </div>
  );
}
