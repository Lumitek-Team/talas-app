"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { SearchInput } from "@/components/search/search-input";
import { FilterButton } from "@/components/search/filter-button";
import { CategorySelect } from "@/components/search/category-select";
import { FloatingActionButton } from "@/components/ui/floating-action-button"; // Import FAB
import { PlusIcon } from "@heroicons/react/24/solid"; // Icon for FAB

type FilterType = "Project" | "Profile" | "Category";

export default function SearchPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("Project");
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 690);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handleCreateProjectClick = () => {
    router.push("/project/create"); // Adjust this route if your create project page is different
  };

  return (
    <>
      <Sidebar activeItem="Search" />
      <PageContainer title="Search">
        <div
          className={`overflow-hidden ${
            isMobile ? "bg-background" : "bg-card rounded-3xl border border-neutral-700/50"
          }`}
        >
          <div className="p-4 border-b border-neutral-700/50">
            <div className="flex flex-col gap-y-5">
              <SearchInput />
              <div className="flex flex-col gap-y-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
                  <FilterButton
                    label="Project"
                    isActive={activeFilter === "Project"}
                    onClick={() => handleFilterClick("Project")}
                  />
                  <FilterButton
                    label="Profile"
                    isActive={activeFilter === "Profile"}
                    onClick={() => handleFilterClick("Profile")}
                  />
                  <FilterButton
                    label="Category"
                    isActive={activeFilter === "Category"}
                    onClick={() => handleFilterClick("Category")}
                  />
                </div>
                {activeFilter === "Project" && (
                  <div className="w-full sm:w-auto sm:min-w-[200px] md:min-w-[220px]">
                    <CategorySelect />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 min-h-[200px]">
            <p className="text-neutral-400">
              Displaying results for: <span className="font-semibold text-neutral-200">{activeFilter}</span>
            </p>
            {activeFilter === "Project" && (
                <p className="text-neutral-500 text-sm mt-1">
                  Relevant projects will appear here. If a category is selected, results will be filtered accordingly.
                </p>
            )}
            {activeFilter === "Profile" && (
                <p className="text-neutral-500 text-sm mt-1">
                  User profiles matching your search will appear here.
                </p>
            )}
            {activeFilter === "Category" && (
                <p className="text-neutral-500 text-sm mt-1">
                  Categories matching your search will appear here.
                </p>
            )}
          </div>
        </div>
      </PageContainer>
      {/* Add Floating Action Button here */}
      <FloatingActionButton 
        onClick={handleCreateProjectClick}
      />
    </>
  );
}
