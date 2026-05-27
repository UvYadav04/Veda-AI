"use client";

import React from "react";
import { useUIStore } from "../store/useStore";
import { LayoutGrid, FileText, Library, Sparkles, Plus } from "lucide-react";
import toast from "react-hot-toast";

type NavKey = "home" | "assignments" | "library" | "toolkit";

export default function MobileNav() {
  const { activeTab, setActiveTab, setSelectedAssignmentId } = useUIStore();

  const isAssignmentsActive =
    activeTab === "assignments" || activeTab === "view";
  const isToolkitActive = activeTab === "create";

  const items: Array<{
    key: NavKey;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    active: boolean;
    onClick: () => void;
  }> = [
      {
        key: "home",
        label: "Home",
        icon: LayoutGrid,
        active: false,
        onClick: () => toast("Home is a placeholder in this demo UI."),
      },
      {
        key: "assignments",
        label: "Assignments",
        icon: FileText,
        active: isAssignmentsActive,
        onClick: () => {
          setSelectedAssignmentId(null);
          setActiveTab("assignments");
        },
      },
      {
        key: "library",
        label: "Library",
        icon: Library,
        active: false,
        onClick: () => toast("Library is a placeholder in this demo UI."),
      },
      {
        key: "toolkit",
        label: "AI Toolkit",
        icon: Sparkles,
        active: isToolkitActive,
        onClick: () => {
          setSelectedAssignmentId(null);
          setActiveTab("create");
        },
      },
    ];

  return (
    <>
      {/* Floating + button */}
      <button
        type="button"
        className="fixed right-[22px] bottom-[90px] z-[1150] flex size-[48px] items-center justify-center rounded-full bg-white shadow-[0_18px_50px_rgba(0,0,0,0.22)] active:translate-y-px md:hidden"
        onClick={() => {
          setSelectedAssignmentId(null);
          setActiveTab("create");
        }}
        aria-label="Create assignment"
      >
        <Plus size={20} className="text-[var(--primary-accent)]" />
      </button>

      <nav
        className="fixed bottom-2 left-1/2 z-[1100] flex h-[72px] w-[95%] -translate-x-1/2 items-center justify-between rounded-[24px] bg-[rgba(18,18,18,0.92)] px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl md:hidden"
        aria-label="Mobile navigation"
      >
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className={[
                "flex min-w-0  cursor-pointer flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-all duration-200",
                item.active
                  ? "bg-white/10 text-white"
                  : "text-white/45 hover:text-white/75",
              ].join(" ")}
            >
              <Icon
                size={18}
                className={[
                  "transition-transform duration-200",
                  item.active ? "scale-105" : "",
                ].join(" ")}
              />

              <span className="truncate text-[12px] font-semibold">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
