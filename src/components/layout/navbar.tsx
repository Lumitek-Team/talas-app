import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <div className="w-full flex justify-center pt-4 px-4 fixed top-5 left-0 right-0 z-50">
      <nav className="bg-[#1A1A1A]/50 backdrop-blur-md rounded-[15px] w-full max-w-xl px-6 py-4 flex gap-8 justify-between items-center border border-gray-700/50">
        <Link href="/" className="flex items-center gap-x-2">
          <Image
            src="/logo/talas-logo.png"
            alt="Talas Logo"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span className="text-2xl font-semibold text-text-primary">
            talas
          </span>
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/about"
            className="text-white hover:text-primary transition-colors duration-200 text-lg"
          >
            About
          </Link>
          <Link
            href="/login"
            className="text-text-primary hover:text-primary transition-colors duration-200 text-lg"
          >
            Login
          </Link>
        </div>
      </nav>
    </div>
  );
}
