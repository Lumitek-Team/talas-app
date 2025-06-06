"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useState, useEffect, Fragment } from "react";
import { PrivacyPolicyContent } from "@/components/setting/privacy-policy"
import { SupportContent } from "@/components/setting/support";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Archive,
  Shield,
  LifeBuoy,
  UserX,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 690);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const settingsData = [
    { label: "Archive", icon: Archive, noChevron: true, onClick: () => router.push("/settings/archive") },
    { label: "Privacy policy", icon: Shield, content: <PrivacyPolicyContent /> },
    { label: "Support", icon: LifeBuoy, content: <SupportContent /> },
    { label: "Delete account", icon: UserX, danger: true },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar activeItem="Settings" />

      <div className="flex flex-col flex-1">
        <PageContainer title="Settings" className="flex-1 flex flex-col min-h-screen">
          <div
            className={`flex-1 p-6 ${
              isMobile
                ? "bg-background"
                : "bg-card rounded-3xl border border-white/10"
            }`}
          >
            <div className="text-white text-sm">
              {settingsData.map(({ 
                label, 
                icon, 
                danger, 
                noChevron,
                content,
                onClick
              }, index) => (
                <Fragment key={label}>
                  <SettingItem 
                    label={label} 
                    icon={icon} 
                    danger={danger} 
                    noChevron={noChevron}
                    content={content}
                    onClick={onClick}
                  />
                  {index < settingsData.length - 1 && (
                    <div className="my-1 border-t border-white/10" />
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </PageContainer>

        <FloatingActionButton />
      </div>
    </div>
  );
}

type SettingItemProps = {
  label: string;
  icon: React.ElementType;
  danger?: boolean;
  noChevron?: boolean;
  content?: React.ReactNode;
  onClick?: () => void;
};

function SettingItem({ 
  label, 
  icon: Icon, 
  danger = false, 
  noChevron = false,
  content,
  onClick
}: SettingItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(); // <- Kalau ada onClick custom, jalankan itu
      return;
    }
    if (!danger && !noChevron && content) {
      setIsOpen(!isOpen);
    }
  }
  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        className={`flex items-center justify-between px-4 py-3 rounded-xl transition cursor-pointer ${
          danger ? "text-red-500 hover:bg-red-500/10" : "text-white hover:bg-white/5"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 ${danger ? "text-red-500" : "text-[#68DE68]"}`} />
          <span>{label}</span>
        </div>
        {!danger && !noChevron && content && (
          <ChevronDown
            className={`w-4 h-4 opacity-50 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {!danger && isOpen && content && (
        <div className="overflow-hidden transition-all duration-300">{content}</div>
      )}
    </div>
  );
}
