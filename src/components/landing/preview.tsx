import Image from "next/image";

export function Preview() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-26 md:mb-32 text-text-primary">
          A Glimpse into the Talas Experience
        </h2>
        <div className="flex justify-center">
          <div className="relative group">
            <div
              className="absolute -inset-2 -z-10 rounded-[35px] bg-secondary opacity-40 blur-3xl 
              transition-all duration-500 ease-in-out 
              group-hover:opacity-90 group-hover:blur-4xl group-hover:-inset-8"
            />
            <Image
              src="/img/home-preview.svg"
              alt="App Preview"
              width={1000}
              height={563}
              className="relative rounded-[34px] shadow-2xl w-full max-w-5xl border border-accent-green/20 
              transition-transform duration-500 ease-in-out 
              group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
