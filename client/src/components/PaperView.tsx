"use client";

import React, { useState } from "react";
import { useUIStore } from "../store/useStore";
import {
  useGetAssignmentByIdQuery,
  useRegenerateAssignmentMutation,
} from "../store/apiSlice";
import { useWebSocket } from "../hooks/useWebSocket";
import { getApiErrorMessage } from "../lib/errors";
import { Download, RefreshCw, Eye, EyeOff, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function PaperView() {
  const { selectedAssignmentId, setCurrentJob } = useUIStore();
  const { joinJobRoom } = useWebSocket();

  const [showAnswerKey, setShowAnswerKey] = useState(false);

  // Fetch assignment by ID
  const {
    data: assignment,
    isLoading,
    isError,
    refetch,
  } = useGetAssignmentByIdQuery(selectedAssignmentId || "", {
    skip: !selectedAssignmentId,
  });

  const [regenerateAssignment, { isLoading: isRegenerating }] =
    useRegenerateAssignmentMutation();

  // Joint room if regeneration starts
  const handleRegenerate = async () => {
    if (!selectedAssignmentId) return;

    try {
      toast.loading("Initiating paper regeneration...", { id: "regen-job" });
      const response =
        await regenerateAssignment(selectedAssignmentId).unwrap();

      setCurrentJob({
        jobId: response._id,
        status: "queued",
        progress: 0,
      });

      joinJobRoom(response._id);
      toast.success("Queued for regeneration!", { id: "regen-job" });
    } catch (err: unknown) {
      toast.error("Regeneration failed: " + getApiErrorMessage(err), {
        id: "regen-job",
      });
    }
  };

  const handleDownloadPDF = () => {
    if (assignment && assignment.pdfPath) {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000";

      const pdfUrl = new URL(assignment.pdfPath, backendUrl).toString();
      window.open(pdfUrl, "_blank");
      toast.success("PDF download started.");
    } else {
      toast.error("PDF file is not ready yet.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-6 animate-fade-in">
        <div
          className="animate-pulse rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-paper)]"
          style={{ height: "500px" }}
        />
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="flex w-full flex-col gap-6 animate-fade-in">
        <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-white px-6 py-10 text-center shadow-[var(--shadow-paper)]">
          <AlertTriangle size={48} style={{ color: "#eab308" }} />
          <h3 className="text-[24px] font-extrabold tracking-[-0.5px] text-[var(--primary)]">
            Assignment Error
          </h3>
          <p className="text-[14px] text-[var(--text-muted)]">
            Failed to load the requested question paper details.
          </p>
          <button
            className="mt-2 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-extrabold text-[#0f172a] shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:bg-[#e2e8f0]"
            onClick={() => refetch()}
          >
            <RefreshCw size={14} /> Retry Load
          </button>
        </div>
      </div>
    );
  }

  const { paper } = assignment;

  return (
    <div className="w-full h-fit md:px-0 px-2">
      {/* Response Accent Box */}
      <div className="px-3 md:bg-[#5e5e5e] bg-white  py-3 rounded-md w-full h-full flex flex-col gap-4 animate-fade-in">
        <div className="flex flex-col gap-5 rounded-[22px] bg-[#2b2b2b] p-8 text-white shadow-[0_22px_65px_rgba(0,0,0,0.18)] md:rounded-[28px]">
          {/* Mobile-style download bubble button */}
          {assignment.pdfPath && (
            <button
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white md:hidden"
              type="button"
              onClick={handleDownloadPDF}
              aria-label="Download PDF"
            >
              <Download size={18} />
            </button>
          )}

          <p className="text-[14px] font-bold leading-[1.35] md:text-[20px]">
            Certainly, Lakshya! Here are customized Question Paper for your CBSE
            Grade 8 {paper?.subject} classes on the NCERT chapters:
          </p>

          {assignment.pdfPath && (
            <button
              className="flex md:w-fit place-content-center place-items-center items-center gap-3 rounded-full bg-white md:px-[24px] md:h-[44px]  w-10 h-10 text-[16px] font-medium text-[#2b2b2b] "
              onClick={handleDownloadPDF}
            >
              <Download size={22} />
              <span className="md:block hidden">Download as PDF</span>
            </button>
          )}

          {/* Hidden advanced actions (kept for functionality) */}
          <div className="flex gap-3 items-center mt-2">
            {/* Toggle Answer Key Visibility */}
            <button
              type="button"
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className={[
                "flex items-center gap-1 rounded-full transition px-3 py-2 text-xs font-semibold",
                showAnswerKey
                  ? "bg-[#f1f5f9] text-[#2b2b2b]"
                  : "bg-[#27272a]/50 text-white hover:bg-[#404040]/70",
              ].join(" ")}
              aria-pressed={showAnswerKey}
              aria-label={showAnswerKey ? "Hide Answer Key" : "Show Answer Key"}
              title={showAnswerKey ? "Hide Answer Key" : "Show Answer Key"}
            >
              {showAnswerKey ? (
                <>
                  <EyeOff size={15} className="inline-block mr-1" />
                  Hide Answer Key
                </>
              ) : (
                <>
                  <Eye size={15} className="inline-block mr-1" />
                  Show Answer Key
                </>
              )}
            </button>

            {/* Regenerate Paper Button */}
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className={[
                "flex items-center gap-1 rounded-full transition px-3 py-2 text-xs font-semibold",
                isRegenerating
                  ? "bg-[#e2e8f0]/70 text-[#a1a1aa] cursor-not-allowed"
                  : "bg-white/90 text-[#2b2b2b] hover:bg-[#f3f4f6]",
              ].join(" ")}
              aria-busy={isRegenerating}
              title="Regenerate question paper"
            >
              <RefreshCw
                size={15}
                className={isRegenerating ? "animate-spin" : ""}
              />
              {isRegenerating ? "Regenerating..." : "Regenerate"}
            </button>
          </div>
        </div>

        {/* Printable Exam Sheet */}
        {paper && (
          <div className="flex flex-col gap-6 rounded-[28px] bg-white px-10 py-12 shadow-[0_22px_65px_rgba(0,0,0,0.18)]">
            {/* Centered School Header */}
            <div className="flex flex-col items-center text-center text-[var(--primary)]">
              <h2 className="md:text-[32px] text-[20px] font-extrabold tracking-[-0.5px]">
                {paper.schoolName}
              </h2>
              <h3 className="mt-1 text-[14px] md:text-[22px] font-semibold">
                Subject: {paper.subject}
              </h3>
              <h4 className="mt-0.5 text-[14px] md:text-[22px] font-semibold">
                Class: {paper.classLevel}
              </h4>
            </div>

            {/* Metadata Grid */}
            <div className="mt-2 flex justify-between text-[14px] md:text-[18px] font-extrabold text-[var(--primary)]">
              <span>Time Allowed: {paper.timeAllowedMinutes} minutes</span>
              <span>Maximum Marks: {paper.maxMarks}</span>
            </div>

            <div className="border-t border-[var(--border-color)] pt-4 text-[14px] md:text-[18px] font-bold">
              All questions are compulsory unless stated otherwise.
            </div>

            {/* Student details form fills */}
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex flex-1 items-end text-[14px] md:text-[18px] font-extrabold text-[var(--primary)] max-w-[260px]">
                <span>Name:</span>
                <div className="mb-0.5 ml-1.5 flex-1 border-b-[1.5px] border-[var(--primary)]" />
              </div>
              <div className="flex flex-1 items-end text-[14px] md:text-[18px] font-extrabold text-[var(--primary)] max-w-[260px]">
                <span>Roll Number:</span>
                <div className="mb-0.5 ml-1.5 flex-1 border-b-[1.5px] border-[var(--primary)]" />
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                <div className="flex flex-1 items-end text-[14px] md:text-[18px] font-extrabold text-[var(--primary)]  max-w-[260px]">
                  <span>Class: {paper.classLevel} Section:</span>
                  <div className="mb-0.5 ml-1.5 flex-1 border-b-[1.5px] border-[var(--primary)]" />
                </div>
              </div>
            </div>

            {/* Question Sections list */}
            <div className="flex flex-col gap-8">
              {paper.sections.map((section, sIdx) => (
                <div key={sIdx} className="flex flex-col gap-4">
                  {/* Center align section name */}
                  <h3 className="text-center text-[16px] text-[24px]font-bold tracking-[0.5px] text-[var(--primary)]">
                    {section.sectionName}
                  </h3>

                  {/* Left align type and instructions */}
                  <span className="text-[14px] md:text-[18px]font-semibold text-[var(--primary)]">
                    {section.questionType}
                  </span>
                  <span className="-mt-3 text-[10px] md:text-[14px] italic font-semibold">
                    {section.instructions}
                  </span>

                  {/* Numbered Questions */}
                  <div className="flex flex-col gap-4">
                    {section.questions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="flex items-start gap-2 text-[16px] leading-[1.6] text-[var(--text-main)]"
                      >
                        <span className="min-w-5 font-medium">{qIdx + 1}.</span>
                        <div className="flex-1">
                          {/* Difficulty badge tag */}
                          <span
                            className={[
                              "mr-2 inline-block rounded-[4px] px-2 py-[1px] align-middle text-[11px] font-extrabold",
                              q.difficulty?.toLowerCase() === "easy"
                                ? "bg-[var(--badge-easy-bg)] text-[var(--badge-easy-text)]"
                                : q.difficulty?.toLowerCase() === "moderate"
                                  ? "bg-[var(--badge-mod-bg)] text-[var(--badge-mod-text)]"
                                  : "bg-[var(--badge-hard-bg)] text-[var(--badge-hard-text)]",
                            ].join(" ")}
                          >
                            {q.difficulty}
                          </span>
                          <span>{q.text}</span>
                          {/* Marks suffix */}
                          <span className="ml-1.5 whitespace-nowrap font-extrabold text-[var(--primary)]">
                            [{q.marks} Mark{q.marks > 1 ? "s" : ""}]
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="my-5 border-b border-[var(--border-color)] pb-6 text-center text-[13px] font-extrabold text-[var(--text-muted)]">
              End of Question Paper
            </div>

            {/* Toggleable Answer Key Section */}
            {showAnswerKey && (
              <div className="mt-2 flex flex-col gap-5">
                <h3 className="text-[16px] font-bold text-[var(--primary)]">
                  Answer Key:
                </h3>
                <div className="flex flex-col gap-4">
                  {paper.sections.map((sec) =>
                    sec.questions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="flex gap-3 text-[16px] leading-[1.6]"
                      >
                        <span className="font-extrabold text-[var(--primary)]">
                          {qIdx + 1}:
                        </span>
                        <p className="flex-1 text-[var(--text-muted)]">
                          {q.answer}
                        </p>
                      </div>
                    )),
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
