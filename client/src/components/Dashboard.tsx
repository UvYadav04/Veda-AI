"use client";

import React, { useState } from "react";
import { useUIStore } from "../store/useStore";
import {
  useGetAssignmentsQuery,
  useDeleteAssignmentMutation,
  Assignment,
} from "../store/apiSlice";
import { getApiErrorMessage } from "../lib/errors";
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Trash2,
  Eye,
  Plus,
  AlertCircle,
  RefreshCw,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import NoAssignmentComponent from "./NoAssignment";
import { BricolageGrotesque_700Bold } from "@expo-google-fonts/bricolage-grotesque/700Bold";

export default function Dashboard() {
  const {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    setActiveTab,
    setSelectedAssignmentId,
  } = useUIStore();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const {
    data: assignments,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetAssignmentsQuery({});

  const [deleteAssignment] = useDeleteAssignmentMutation();
  const { currentJob } = useUIStore()


  const handleCreateClick = () => {
    setSelectedAssignmentId(null);
    setActiveTab("create");
  };

  const handleCardClick = (assignment: Assignment) => {
    if (assignment.status === "completed") {
      setSelectedAssignmentId(assignment._id);
      setActiveTab("view");
    } else if (assignment.status === "failed") {
      toast.error(
        `This assignment generation failed: ${assignment.errorMessage || "Unknown error"}`,
      );
    } else {
      toast.loading(
        `Assignment generation is in progress (${assignment.progress}%)...`,
        {
          duration: 2000,
        },
      );
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(null);
    try {
      await deleteAssignment(id).unwrap();
      toast.success("Assignment deleted successfully!");
    } catch (err: unknown) {
      toast.error("Failed to delete assignment: " + getApiErrorMessage(err));
    }
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "-");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in md:px-0 px-3">
      {/* Mobile title row */}
      <div className="flex items-center justify-between py-1 md:hidden">
        <button
          className="flex h-[46px] w-[46px]  items-center justify-center rounded-full bg-white/45 text-[#111] shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
          type="button"
          onClick={() => toast("Back is a placeholder in this demo UI.")}
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-[22px] font-black tracking-[-0.2px] text-[#3a3a3a] ">
          Assignments
        </h2>
        <div className="h-[46px] w-[46px]" />
      </div>

      {assignments && assignments.length > 0 && (
        <>
          {/* Desktop title + subtitle */}
          <div className="hidden gap-4 md:flex place-content-start place-items-center">
            <div className="backdrop-blur-md bg-emerald-300/40 size-8 flex items-center justify-center rounded-full">
              <div className="size-4 rounded-full bg-emerald-500 shadow-[0_10px_30px_rgba(0,0,0,0.10)]" />
            </div>

            <div className="flex flex-col gap-0">
              <h2 className="text-[28px] font-semibold tracking-[-0.6px] text-[#2b2b2b]">
                Assignments
              </h2>
              <span className="text-[14px] text-[#9a9a9a]">
                Manage and create assignments for your classes.
              </span>
            </div>
          </div>

          {/* Desktop filter/search bar */}
          <div className="hidden w-full items-center justify-between gap-6 rounded-[22px] bg-white px-3 py-2   md:flex">
            <div className="flex items-center gap-3 text-[14px] font-semibold text-[#bdbdbd]">
              <Filter size={18} />
              <div className="relative">
                <select
                  className="appearance-none bg-white text-[15px] font-semibold text-[#5a5a5a]  pr-10 py-2 rounded-full   transition-all outline-none "
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label="Filter By"
                >
                  <option value="all">Filter By</option>
                  <option value="completed">Completed</option>
                  <option value="generating">Generating</option>
                  <option value="queued">Queued</option>
                  <option value="failed">Failed</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#bdbdbd]">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M7 10l5 5 5-5"
                      stroke="#bdbdbd"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div className="relative w-[560px]">
              <Search
                className="absolute left-6 top-1/2 -translate-y-1/2 text-[#bdbdbd]"
                size={22}
              />
              <input
                type="text"
                className="h-[44px] w-full rounded-full border border-[#d9d9d9] bg-white pl-14 pr-6 text-[18px] font-semibold text-[#2b2b2b] placeholder:text-[#bdbdbd] "
                placeholder="Search Assignment"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile toolbar (visual match for screenshot) */}
          <div className="flex items-center justify-between gap-3.5 rounded-[20px] bg-white px-3.5 py-3.5  md:hidden">
            <div className="flex min-w-[120px] items-center gap-2.5 font-extrabold text-[#7a7a7a]">
              <Filter size={18} />
              <select
                className="appearance-none border-0 bg-transparent pr-1 text-[15px] font-extrabold text-[#8a8a8a]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter"
              >
                <option value="all">Filter</option>
                <option value="completed">Completed</option>
                <option value="generating">Generating</option>
                <option value="queued">Queued</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="relative flex h-11 flex-1 items-center rounded-full border-2  pl-10">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9a9a]"
              />
              <input
                type="text"
                className="w-full border-0 bg-transparent text-[15px] font-extrabold text-[#111] outline-none placeholder:text-[#9a9a9a]"
                placeholder="Search Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {/* Main List Display */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-[28px] bg-[#e2e8f0] p-8"
              style={{ height: "180px" }}
            />
          ))}
        </div>
      ) : isError ? (
        <div className="mx-auto my-10 flex max-w-[600px] flex-col items-center justify-center gap-5 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--bg-card)] px-5 py-[60px] text-center md:my-10">
          <AlertCircle size={40} style={{ color: "#ef4444" }} />
          <h3 className="text-[18px] font-bold text-[var(--text-main)]">
            Failed to load assignments
          </h3>
          <p className="max-w-[420px] text-[14px] leading-[1.6] text-[var(--text-muted)]">
            Please check if MongoDB and Redis are running, then retry.
          </p>
          <button
            className="flex items-center justify-center gap-2 rounded-full bg-white text-black px-6 py-3 text-[14px] font-semibold  hover:translate-y-[-1px]"
            onClick={() => refetch()}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : !assignments || assignments.length === 0 ? (
        // Empty State
        <>
          {/* Mobile empty state (matches mobile designs) */}
          <div className="mx-auto my-2 flex max-w-[480px] flex-col items-center justify-center gap-5 px-1.5 py-6 text-center md:hidden">
            <div className="relative flex h-[240px] w-[240px] items-center justify-center rounded-full  shadow-[0_22px_60px_rgba(0,0,0,0.12)]">
              <NoAssignmentComponent />
            </div>
            <h3 className="text-[20px] font-medium tracking-[-0.6px] text-[#2b2b2b]">
              No assignments yet
            </h3>
            <p
              style={{ fontFamily: "var(--font-main)" }}
              className="max-w-[720px] text-[16px] leading-[1.5] text-black/40"
            >
              Create your first assignment to start collecting and grading
              student submissions. You can set up rubrics, define marking
              criteria, and let AI assist with grading.
            </p>
            <button
              className="flex w-[min(420px,100%)] items-center justify-center gap-2 rounded-full bg-[#111] px-2 py-[12px] text-[18px] font-semibold text-white shadow-[0_18px_55px_rgba(0,0,0,0.18)] hover:translate-y-[-1px]"
              onClick={handleCreateClick}
            >
              <Plus size={16} /> Create Your First Assignment
            </button>
          </div>

          {/* Desktop empty state (matches web designs) */}
          <div className="mx-auto hidden w-full max-w-full  flex-col items-center justify-center gap-6 pt-10 text-center md:flex">
            <div className="relative flex h-[240px] w-[240px] items-center justify-center rounded-full  shadow-[0_22px_60px_rgba(0,0,0,0.12)]">
              <NoAssignmentComponent />
            </div>
            <h3 className="text-[20px] font-medium tracking-[-0.6px] text-[#2b2b2b]">
              No assignments yet
            </h3>
            <p
              style={{ fontFamily: "var(--font-main)" }}
              className="max-w-[720px] text-[16px] leading-[1.5] text-black/40"
            >
              Create your first assignment to start collecting and grading
              student submissions. You can set up rubrics, define marking
              criteria, and let AI assist with grading.
            </p>
            <button
              className="flex w-[min(420px,100%)] items-center justify-center gap-2 rounded-full bg-[#111] px-2 py-[12px] text-[18px] font-semibold text-white shadow-[0_18px_55px_rgba(0,0,0,0.18)] hover:translate-y-[-1px]"
              onClick={handleCreateClick}
            >
              <Plus size={16} /> Create Your First Assignment
            </button>
          </div>
        </>
      ) : (
        // Filled Grid State
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {assignments.map((assignment) => {
              if (
                assignment.title
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) &&
                (filterStatus === "all" || assignment.status === filterStatus)
              )
                return (
                  <div
                    key={assignment._id}
                    className="cursor-pointer rounded-[24px] bg-white p-4 transition hover:-translate-y-0.5"
                    onClick={() => handleCardClick(assignment)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="flex-1 text-[24px] font-extrabold leading-[1.15] text-[#2b2b2b] ">
                        {assignment.title}
                      </h4>

                      {/* Options Menu Toggle */}
                      <div className="relative">
                        <button
                          className="rounded-[var(--radius-sm)] p-1 text-[#111] hover:bg-[var(--active-sidebar-bg)] hover:opacity-100 md:text-[var(--text-light)]"
                          onClick={(e) => toggleMenu(e, assignment._id)}
                        >
                          <MoreVertical size={16} className="cursor-pointer" />
                        </button>

                        {activeMenuId === assignment._id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-[220px] overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[var(--shadow-md)]">
                            <button
                              className="flex w-full items-center px-3 py-2.5 text-left text-[18px] text-[var(--text-main)] hover:bg-[var(--active-sidebar-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                              onClick={() => {
                                if (assignment.status === 'completed') {
                                  setSelectedAssignmentId(assignment._id);
                                  setActiveTab('view');
                                }
                              }}
                              disabled={assignment.status !== 'completed'}
                            >
                              <Eye size={18} style={{ marginRight: '8px' }} />
                              View Assignment
                            </button>

                            <button
                              className="flex w-full items-center px-3 py-2.5 text-left text-[18px] text-[#ef4444] hover:bg-[var(--active-sidebar-bg)]"
                              onClick={(e) => handleDelete(e, assignment._id)}
                            >
                              <Trash2 size={18} style={{ marginRight: '8px' }} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="mt-8 flex flex-col gap-2"
                      style={{ fontFamily: "Bricolage Grotesque" }}
                    >
                      <div className="flex justify-between text-[16px]  text-[#2b2b2b]">
                        <span>
                          <span className="font-bold">Assigned on : </span>
                          <span className="font-medium text-[#8a8a8a]">
                            {formatDate(assignment.createdAt)}
                          </span>
                        </span>
                        <span>
                          <span className="font-bold">Due : </span>
                          <span className="font-medium text-[#8a8a8a]">
                            {formatDate(assignment.dueDate)}
                          </span>
                        </span>
                      </div>

                      {(assignment.status === "generating" ||
                        assignment.status === "queued") && (
                          <>
                            <div style={{ marginTop: "8px" }}>
                              <div className="flex justify-between text-[12px] text-[var(--text-muted)]">
                                <span>Status</span>
                                <span>
                                  {assignment.status === "queued"
                                    ? "Queued..."
                                    : "Generating..."}
                                </span>
                              </div>
                            </div>
                            {(() => {
                              if (currentJob?.jobId === assignment._id)
                                return (
                                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--border-color)]">
                                    <div
                                      className={[
                                        "h-full bg-[var(--primary-accent)] transition-[width]",
                                        currentJob.status === "generating"
                                          ? "animate-pulse"
                                          : "",
                                      ].join(" ")}
                                      style={{ width: `${currentJob.progress}%` }}
                                    />
                                  </div>
                                );
                              return null
                            })()}
                          </>
                        )}


                    </div>

                    {/* Footer intentionally hidden to match design */}
                  </div>
                );
            })}
          </div>

          {/* Floating bottom creation button */}
        </>
      )}
    </div>
  );
}
