"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CardHeaderProjectProfile } from "./card-header-project-profile";
import { ContentProjectProfile } from "./content-project-profile";
import { ImageContainerProjectProfile } from "./image-container-project-profile";
import { getPublicUrl } from "@/lib/utils";
import { trpc } from "@/app/_trpc/client";
import { CustomAlertDialog } from "@/components/ui/custom-alert-dialog";
import { ProjectOneType } from "@/lib/type";

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
  project: ProjectOneType;
  userId: string;
  isPinned?: boolean;
  isDeleted?: boolean;
  onMutateSuccess?: () => void;
  isMyProfile?: boolean;
  titleProjectProfile?: string;
};

export function CardProjectProfile({
  project,
  userId,
  isPinned = false,
  isDeleted = false,
  onMutateSuccess,
  isMyProfile,
}: CardProjectProfileProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [pinned, setPinned] = useState<boolean>(isPinned);
  const [deleted, setDeleted] = useState<boolean>(isDeleted);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setArchiveDialogOpen] = useState(false);

  useEffect(() => {
    const loadImageUrls = async () => {
      const images = [
        project.image1,
        project.image2,
        project.image3,
        project.image4,
        project.image5,
      ].filter((img): img is string => !!img && img.trim() !== "");

      const urls = await Promise.all(images.map((img) => getPublicUrl(img)));
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
      setDeleted(true);
      utils.project.getArchived.invalidate();
      utils.user.getAllProjects.invalidate();
      onMutateSuccess?.();
    },
    onError: (error) => {
      console.error("Delete Error", error);
    },
  });

  const pin = trpc.pin.pin.useMutation({
    onSuccess: () => {
      setPinned(true);
      utils.user.getAllProjects.invalidate();
      onMutateSuccess?.();
    },
    onError: (err) => {
      console.error("Pin Error", err);
    },
  });

  const unpin = trpc.pin.unpin.useMutation({
    onSuccess: () => {
      setPinned(false);
      utils.user.getAllProjects.invalidate();
      onMutateSuccess?.();
    },
    onError: (err) => {
      console.error("Unpin Error", err);
    },
  });

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

  const isOwner = project.project_user.some(
    (pu) => pu.ownership === "OWNER" && pu.user.id === userId
  );

  return (
    <div className="border-t border-white/10 p-5">
      <CardHeaderProjectProfile
        isOwner={isOwner}
        title={project.title}
        createAt={project.created_at}
        onEdit={handleEdit}
        onArchive={() => setArchiveDialogOpen(true)}
        onDelete={() => setDeleteDialogOpen(true)}
        onPin={handlePin}
        onUnpin={handleUnpin}
        isArchiving={archive.status === "pending"}
        isPin={pin.status === "pending"}
        isUnPin={unpin.status === "pending"}
        isDeleted={deleteProject.status === "pending"}
        isPinned={pinned}
        isMyProfile={isMyProfile}
      />

      <ContentProjectProfile content={project.content} />
      <ImageContainerProjectProfile images={imageUrls} />

      {/* Custom Alert Dialog for Delete */}
      <CustomAlertDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={() => deleteProject.mutate({ id: project.id, id_user: userId })}
        confirmText="Delete"
        confirmButtonVariant="destructive"
      />

      {/* Custom Alert Dialog for Archive */}
      <CustomAlertDialog
        isOpen={isArchiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        title="Archive Project"
        description="Are you sure you want to archive this project? You can restore it later from the archive section."
        onConfirm={() => archive.mutate({ id: project.id, id_user: userId })}
        confirmText="Archive"
        confirmButtonVariant="default"
      />
    </div>
  );
}
