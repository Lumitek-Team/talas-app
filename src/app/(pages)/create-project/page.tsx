// app/create-project/page.tsx (or your equivalent path)
"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { ProjectForm } from "@/components/project/project-form"; // Ensure path is correct
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs"; // Optional: for page-level auth guard
import { useRouter } from "next/navigation"; // Optional: for redirect

export default function CreateProjectPage() {
  const [isMobile, setIsMobile] = useState(false);
  const { user, isLoaded } = useUser(); // Optional: for auth guard
  const router = useRouter(); // Optional: for redirect

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

  // Optional: Redirect if user is not loaded or not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in"); // Or your sign-in page
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) {
    // You can show a loading spinner or a simple message here
    // Or rely on Sidebar/PageContainer to have their own loading states if any
    return (
        <>
            <Sidebar activeItem="Create" /> {/* Assuming "Create" is an activeItem */}
            <PageContainer title="Create Project" showBackButton={true}>
                <p>Loading user...</p>
            </PageContainer>
        </>
    );
  }

  return (
    <>
      <Sidebar activeItem="Create" /> {/* Ensure this matches your Sidebar's expectation */}
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