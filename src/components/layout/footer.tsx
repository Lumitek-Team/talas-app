import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer>
      <div className="bg-[#1A1A1A] text-gray-400 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between">
          {/* Left side - Logo and description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left mb-8 md:mb-0">
            <div className="mb-4 md:mb-5">
              <Image src="/logo/talas-logo.png" alt="Talas Logo" width={40} height={50} />
            </div>
            <p className="text-white max-w-md">
              Talas is a social-driven platform for sharing<br className="hidden md:block" />
              <span className="md:hidden"> </span>and collaborating on software projects.
            </p>
          </div>
          
          {/* Right side - Navigation links */}
          <div className="flex justify-center md:justify-end"> 
            {/* Mobile: Single column, Desktop: Two columns */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-0">
              {/* First column of links */}
              <div className="flex flex-col gap-3 md:gap-4 md:mr-10 text-center md:text-left"> 
                <Link href="/" className="text-white hover:text-primary transition-colors duration-200">Home</Link>
                <Link href="/about" className="text-white hover:text-primary transition-colors duration-200">About</Link>
                <Link href="/login" className="text-white hover:text-primary transition-colors duration-200">Login</Link>
              </div>
              
              {/* Second column of links */}
              <div className="flex flex-col gap-3 md:gap-4 text-center md:text-left"> 
                <Link href="/privacy-policy" className="text-white hover:text-primary transition-colors duration-200">Privacy Policy</Link>
                <Link href="/terms" className="text-white hover:text-primary transition-colors duration-200">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright bar */}
      <div className="bg-card text-muted py-3 md:py-2 px-4 text-center"> 
        <p className="text-sm">© 2025 Talas. All rights reserved</p>
      </div>
    </footer>
  );
}