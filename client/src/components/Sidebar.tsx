"use client";

import React from "react";
import { useUIStore } from "../store/useStore";
import { useGetAssignmentsQuery } from "../store/apiSlice";
import {
  Home,
  Users,
  FileText,
  Wand2,
  Library,
  Settings,
  Sparkles,
} from "lucide-react";

export default function Sidebar() {
  const { activeTab, setActiveTab, setSelectedAssignmentId } = useUIStore();
  const { data: assignments } = useGetAssignmentsQuery({});

  const handleCreateClick = () => {
    setSelectedAssignmentId(null);
    setActiveTab("create");
  };

  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "groups", label: "My Groups", icon: Users },
    {
      id: "assignments",
      label: "Assignments",
      icon: FileText,
      showBadge: true,
    },
    { id: "toolkit", label: "AI Teacher's Toolkit", icon: Wand2 },
    { id: "library", label: "My Library", icon: Library },
  ];

  return (
    <aside className="hidden w-[340px] flex-col justify-between rounded-md bg-white px-5 py-5 shadow-[0_30px_80px_rgba(0,0,0,0.25)] lg:flex">
      <div className="flex flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-[radial-gradient(circle_at_30%_20%,#ffcf8b_0%,#ff7a18_35%,#7a1d1d_80%)] text-white shadow-[0_16px_35px_rgba(0,0,0,0.25)]">
            <span className="text-[28px] font-black tracking-[-0.6px]">V</span>
          </div>
          <span className="text-[32px] font-bold tracking-[-0.6px] text-[#111]">
            Veda<span className="text-[#111]">AI</span>
          </span>
        </div>

        {/* Create Assignment Button */}
        <button
          className="group relative flex w-full items-center justify-center gap-3 rounded-full bg-black px-5 py-2 text-[18px] font-semibold text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
          onClick={handleCreateClick}
        >
          <span className="pointer-events-none absolute inset-0 rounded-full ring-4 ring-[#ff4f18]/80" />
          <span className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_6px_rgba(255,79,24,0.18)]" />
          <Sparkles size={18} />
          {activeTab === "create"
            ? "AI Teacher's Toolkit"
            : "Create Assignment"}
        </button>

        {/* Navigation Items */}
        <nav className="mt-4 flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Highlight 'assignments' tab when we are on 'assignments' tab or 'view' (since it represents viewing an assignment)
            const isTabActive =
              (item.id === "assignments" &&
                (activeTab === "assignments" || activeTab === "view")) ||
              (item.id === "toolkit" && activeTab === "create");

            return (
              <button
                key={item.id}
                className={[
                  "flex items-center gap-2 rounded-[14px] px-4 py-2 text-[16px] font-medium text-[#7a7a7a] transition",
                  isTabActive
                    ? "bg-[#efefef] text-[#2b2b2b]"
                    : "hover:bg-[#f4f4f4] hover:text-[#2b2b2b]",
                ].join(" ")}
                onClick={() => {
                  if (item.id === "assignments" || item.id === "toolkit") {
                    setActiveTab(
                      item.id === "toolkit" ? "create" : "assignments",
                    );
                    setSelectedAssignmentId(null);
                  }
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.showBadge && assignments && assignments.length > 0 && (
                  <span className="ml-auto rounded-full bg-[var(--primary-accent)] px-2 py-0.5 text-[11px] font-semibold text-white">
                    {assignments.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        {/* Settings Button */}
        <button className="flex items-center gap-4 rounded-[14px] px-4 py-3.5 text-[18px] font-medium text-[#7a7a7a] hover:bg-[#f4f4f4] hover:text-[#2b2b2b]">
          <Settings size={20} />
          <span>Settings</span>
        </button>

        {/* School Profile Badge */}
        <div className="flex items-center gap-4 rounded-[18px] bg-[#efefef] px-5 py-2">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-[#ffd7c9] flex items-center justify-center font-black text-[#2b2b2b]">
            <img src="dps.png" alt="BP" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[16px] font-semibold text-[#2b2b2b]">
              Delhi Public School
            </span>
            <span className="text-[14px] text-[#6b6b6b]">
              Bokaro Steel City
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
