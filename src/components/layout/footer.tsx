import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer>
      <div className="bg-[#1A1A1A] text-gray-400 py-14 px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between">
          {/* Left side - Logo and description */}
          <div className="flex flex-col">
            <div className="mb-5">
              <Image src="/logo/talas-logo.png" alt="Talas Logo" width={40} height={50} />
            </div>
            <p className="text-white max-w-md">
              Talas is a social-driven platform for sharing<br />
              and collaborating on software projects.
            </p>
          </div>

          {/* Right side - Navigation links */}
          <div className="flex justify-end mt-6 md:mt-0">
            {/* First column of links */}
            <div className="flex flex-col space-y-6 mr-10">
              <Link href="/" className="text-white duration-200 hover:text-green-500">Home</Link>
              <Link href="/about" className="text-white duration-200 hover:text-green-500">About</Link>
              <Link href="/login" className="text-white duration-200 hover:text-green-500">Login</Link>
            </div>

            {/* Second column of links */}
            <div className="flex flex-col space-y-6">
              <Link href="/privacy-policy" className="text-white duration-200 hover:text-green-500">Privacy Policy</Link>
              <Link href="/terms" className="text-white duration-200 hover:text-green-500">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="bg-green-500 text-white py-2 px-4 text-center">
        <p className="text-sm">© 2025 Talas. All rights reserved</p>
      </div>
    </footer>
  );
}
