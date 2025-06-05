"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PostComposer } from "@/components/home/organisms/post-composer";
import { PostCard } from "@/components/home/organisms/post-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { PageContainer } from "@/components/ui/page-container";
import { useState, useEffect } from "react";
import { usePostsStore, Post } from "@/lib/store/posts-store";
import { EllipsisVertical } from "lucide-react";

export default function Archive() {
    const [isMobile, setIsMobile] = useState(false);

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

    return (
        <>
            <Sidebar activeItem="Archive" />
            <PageContainer title="Archive">
                <div className={`overflow-hidden ${isMobile ? 'bg-background' : 'bg-card rounded-3xl border border-white/10'}`}>
                    {isMobile && (
                        <h1>swd</h1>
                    )}
                </div>
            </PageContainer>

            <FloatingActionButton />
        </>
    );
}