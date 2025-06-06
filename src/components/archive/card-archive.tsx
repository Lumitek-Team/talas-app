"use client";

import { CardHeaderArchive } from "./card-header-archive";
import { CardContentArchive } from "./content-archive";
import { ImageContainer } from "./image-container";
import { getPublicUrl } from "@/lib/utils";

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
};

export function CardArchive({ project }: CardArchiveProps) {
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
    <>
        <div className="pl-1 pr-1">
            <CardHeaderArchive title={project.title} />
            <CardContentArchive content={project.content} />
            <ImageContainer images={imageUrls} />
        </div>
    </>
    

  );
}
