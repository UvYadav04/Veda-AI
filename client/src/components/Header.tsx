"use client";

import React from "react";
import { useUIStore } from "../store/useStore";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Menu,
  LayoutGrid,
  Sparkles,
  HamburgerIcon,
  MenuSquareIcon,
  MenuIcon,
} from "lucide-react";

export default function Header() {
  const { activeTab, setActiveTab, setSelectedAssignmentId } = useUIStore();

  const handleBackClick = () => {
    if (activeTab === "create" || activeTab === "view") {
      setActiveTab("assignments");
      setSelectedAssignmentId(null);
    }
  };

  // Get dynamic title based on tab
  const getHeaderTitle = () => {
    if (activeTab === "create") return "Create New";
    return "Assignment";
  };

  return (
    <header className="w-full h-fit md:p-0 p-3 ">
      {/* Desktop header */}
      <div className="hidden bg-white w-full items-center justify-between rounded-sm  px-5 py-1  md:flex">
        <div className="flex items-center gap-4">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#111] shadow-[0_12px_35px_rgba(0,0,0,0.10)]"
            onClick={handleBackClick}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-3">
            {activeTab === "create" ? (
              <Sparkles size={18} className="text-[#bdbdbd]" />
            ) : (
              <LayoutGrid size={18} className="text-[#bdbdbd]" />
            )}
            <h1 className="text-[18px] font-semibold text-[#bdbdbd]">
              {getHeaderTitle()}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative flex size-10 items-center justify-center rounded-full bg-[#F6F6F6] text-[#111] shadow-[0_12px_35px_rgba(0,0,0,0.10)]">
            <Bell size={22} />
            <span className="absolute right-[2px] top-[2px] h-[10px] w-[10px] rounded-full bg-[var(--primary-accent)]" />
          </button>

          <div
            className="flex items-center gap-3 rounded-md px-3 py-2 "
            style={{
              background: "linear-gradient(to right, white, transparent 100%)",
            }}
          >
            <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-[#ffd7c9]">
              <img src="/bp.jpg" alt="JD" />
            </div>
            <span className="text-[18px] font-semibold text-[#2b2b2b] bg-transparent">
              John Doe
            </span>
            <ChevronDown size={18} className="text-[#2b2b2b]" />
          </div>
        </div>
      </div>

      {/* Mobile top pill bar */}
      <div className="flex w-full items-center justify-between rounded-[16px] bg-white px-[14px] py-[6px] shadow-[0_14px_45px_rgba(0,0,0,0.12)] md:hidden">
        <div className="flex items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px]  font-black  text-white">
            <img src="logo.png" alt="" />
          </div>
          <span className="text-[22px] font-bold tracking-[-0.3px] text-[#111]">
            VedaAI
          </span>
        </div>

        <div className="flex items-center gap-2 justify-evenly">
          <button className="relative flex size-10 items-center justify-center rounded-full bg-[#F6F6F6] text-[#111] shadow-[0_12px_35px_rgba(0,0,0,0.10)]">
            <Bell size={22} />
            <span className="absolute right-[2px] top-[2px] h-[10px] w-[10px] rounded-full bg-[var(--primary-accent)]" />
          </button>
          <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-[#111] text-[12px] font-black text-white">
            <img src="/dummy.jpg" alt="JD" />
          </div>
          <button
            className="flex size-11  items-center justify-center rounded-full bg-transparent text-[#111]"
            aria-label="Menu"
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
