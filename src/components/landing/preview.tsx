import Image from "next/image";

export function Preview() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-text-primary">
        A Glimpse into the Talas Experience
        </h2>
        <div className="flex justify-center">
          <Image
            src="/img/home-preview.svg"
            alt="App Preview"
            width={1200}
            height={675}
            className="rounded-lg shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}