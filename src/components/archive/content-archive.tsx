"use client";

type CardContentArchiveProps = {
  content: string;
};

export function CardContentArchive({ content }: CardContentArchiveProps) {
  return (
    <div className="text-sm space-y-2 mb-3">
      <p>{content}</p>
    </div>
  );
}
