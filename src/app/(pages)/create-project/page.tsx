"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { ProjectForm } from "@/components/project/project-form";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function CreateProjectPage() {
  const [isMobile, setIsMobile] = useState(false);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 690);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Auth guard: Redirect guests to sign-in
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) {
    return (
        <>
            <Sidebar activeItem="Create" />
            <PageContainer title="Create Project" showBackButton={true}>
                <p>Loading user...</p>
            </PageContainer>
        </>
    );
  }

  return (
    <>
      <Sidebar activeItem="Create" />
      <PageContainer title="Create Project" showBackButton={true}>
        <div className={`overflow-hidden ${isMobile ? 'bg-background' : 'bg-card rounded-3xl border border-white/10'}`}>
          <div className="p-6 space-y-6">
            <ProjectForm />
          </div>
        </div>
      </PageContainer>
    </>
  );
}