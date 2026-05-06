import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { MoveLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <PageContainer title="404 — Lost in Space" showBackButton={true}>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
          {/* Animated Illustration Placeholder / Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
            <Compass className="w-24 h-24 text-primary relative z-10 animate-bounce" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Oops! Page Not Found.
          </h1>
          
          <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
            The project or profile you are looking for has been moved, deleted, or never existed in the first place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/feeds">
              <Button className="w-full sm:w-auto gap-2 px-8 py-6 text-lg">
                <MoveLeft className="w-5 h-5" />
                Back to Feed
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" className="w-full sm:w-auto gap-2 px-8 py-6 text-lg border-white/10 hover:bg-white/5">
                Explore Projects
              </Button>
            </Link>
          </div>

          {/* Subtle branding */}
          <div className="mt-20 text-sm text-muted-foreground/50 font-comfortaa">
            TALAS — Portfolio for Creators
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
