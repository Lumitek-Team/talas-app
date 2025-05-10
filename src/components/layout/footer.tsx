import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-bg-primary text-text-secondary py-8 px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-4">
        <div>
          <p className="text-white font-semibold">Talas</p>
          <p className="mt-2">A social-driven platform for sharing and collaborating on software projects.</p>
          <p className="mt-4 text-sm">© 2025 Talas. All rights reserved.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/">Home</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/about">About</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/login">Login</Link>
        </div>
      </div>
    </footer>
  );
}
