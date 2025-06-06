"use client";

type ImageContainerProps = {
  images: string[]; // asumsi setiap image adalah URL string
};

export function ImageContainer({ images }: ImageContainerProps) {
  return (
    <div
      className="w-full rounded-md overflow-x-auto"
      style={{
        scrollbarWidth: "none",         
        msOverflowStyle: "none",        
      }}
    >
      <div
        className="flex gap-2 pt-2 pb-2 w-max"
        style={{
          overflowX: "scroll",
        }}
      >
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Image ${idx + 1}`}
            className="w-60 h-40 object-cover rounded-sm flex-shrink-0"
          />
        ))}
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
