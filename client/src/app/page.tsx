"use client";

import React, { useEffect } from "react";
import { useUIStore } from "../store/useStore";
import { useWebSocket } from "../hooks/useWebSocket";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Dashboard from "../components/Dashboard";
import AssignmentForm from "../components/AssignmentForm";
import PaperView from "../components/PaperView";
import ProgressOverlay from "../components/ProgressOverlay";
import MobileNav from "../components/MobileNav";
import { Plus } from "lucide-react";

export default function Home() {
  const { activeTab } = useUIStore();

  // Establish WS connection and listeners on mount

  useWebSocket();

  const renderActiveTab = () => {
    switch (activeTab) {
      case "assignments":
        return <Dashboard />;
      case "create":
        return <AssignmentForm />;
      case "view":
        return <PaperView />;
      default:
        return <Dashboard />;
    }
  };

  const { setActiveTab, setSelectedAssignmentId } = useUIStore();

  const handleCreateClick = () => {
    setSelectedAssignmentId(null);
    setActiveTab("create");
  };

  return (
    <div className="min-h-screen p-0 bg-[#EEEEEE] ">
      {/* Desktop canvas padding + soft vignette */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-0 py-0 md:px-6 md:py-6">
        <div className="pointer-events-none absolute inset-0 hidden md:block">
          {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.10)_65%,rgba(0,0,0,0.18)_100%)]" /> */}
        </div>

        <div className="relative z-10 flex w-full gap-6 ">
          {/* Left Sidebar Menu */}
          <Sidebar />

          {/* Main Panel */}
          <main className="relative flex flex-1 flex-col md:h-[calc(100vh-48px)] md:overflow-hidden rounded-md  bg-transparent">
            {/* Top Header */}
            <Header />

            {/* Dynamic Scrollable Content */}
            <div className="flex-1 overflow-y-auto  pb-24 md:pb-6 md:py-6 md:pb-10 flex flex-col gap-6">
              {renderActiveTab()}
            </div>

            {/* Real-time Generation Progress Modal Overlay */}
            <ProgressOverlay />
            {activeTab !== "create" && (
              <div
                className="absolute bottom-0 right-0 z-100 py-2 w-full hidden md:flex items-center justify-center"
                style={{
                  pointerEvents: "none",
                  // Use a vertical gradient that blurs strongest at bottom and fades to transparent upward
                  background:
                    "linear-gradient(to top, rgba(238,238,238,0.92) 0%, rgba(238,238,238,0.60) 30%, rgba(238,238,238,0.0) 60%)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  // Add a top shadow
                }}
              >
                <div
                  className="bg-white/50  rounded-full shadow-[0_22px_65px_rgba(0,0,0,0.18)] px-0 py-0 w-auto"
                  style={{
                    pointerEvents: "auto",
                    boxShadow: "0px -0.5px 0px 0.5px rgba(40,40,40, 1)",
                  }}
                >
                  <button
                    className="flex items-center gap-3 rounded-full bg-[#111] px-9 py-2 text-[18px] font-semibold text-white hover:-translate-y-0.5 transition-transform"
                    onClick={handleCreateClick}
                  >
                    <Plus size={22} /> Create Assignment
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Mobile bottom navigation + FAB */}
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
