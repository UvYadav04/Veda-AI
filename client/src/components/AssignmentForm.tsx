"use client";

import React, { useState } from "react";
import { useUIStore } from "../store/useStore";
import { useCreateAssignmentMutation } from "../store/apiSlice";
import { useWebSocket } from "../hooks/useWebSocket";
import { getApiErrorMessage } from "../lib/errors";
import {
  Upload,
  Calendar,
  Mic,
  ArrowLeft,
  ArrowRight,
  X,
  Plus,
  MoveLeft,
  CircleArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

interface QuestionTypeInput {
  name: string;
  count: number;
  marks: number;
}

export default function AssignmentForm() {
  const { setActiveTab, setCurrentJob } = useUIStore();
  const [createAssignment, { isLoading: isSubmitting }] =
    useCreateAssignmentMutation();
  const { joinJobRoom } = useWebSocket();

  const inferTitleFromFileName = (fileName: string) =>
    fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[_-]+/g, " ")
      .trim();

  // Form Fields State
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeInput[]>([
    { name: "Multiple Choice Questions", count: 4, marks: 1 },
    { name: "Short Questions", count: 3, marks: 2 },
    { name: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
    { name: "Numerical Problems", count: 5, marks: 5 },
  ]);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Available options for question types
  const typeOptions = [
    "Multiple Choice Questions",
    "Short Questions",
    "Long Questions",
    "Numerical Problems",
    "Diagram/Graph-Based Questions",
    "True / False Questions",
    "Fill in the Blanks",
  ];

  // Calculate Totals
  const totalQuestions = questionTypes.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const totalMarks = questionTypes.reduce(
    (sum, item) => sum + item.count * item.marks,
    0,
  );

  // Counters handlers
  const updateCount = (index: number, delta: number) => {
    const updated = [...questionTypes];
    const newVal = updated[index].count + delta;
    if (newVal >= 1) {
      updated[index].count = newVal;
      setQuestionTypes(updated);
    }
  };

  const updateMarks = (index: number, delta: number) => {
    const updated = [...questionTypes];
    const newVal = updated[index].marks + delta;
    if (newVal >= 1) {
      updated[index].marks = newVal;
      setQuestionTypes(updated);
    }
  };

  const updateTypeName = (index: number, name: string) => {
    const updated = [...questionTypes];
    updated[index].name = name;
    setQuestionTypes(updated);
  };

  const addQuestionType = () => {
    setQuestionTypes([
      ...questionTypes,
      { name: "Short Questions", count: 2, marks: 2 },
    ]);
  };

  const removeQuestionType = (index: number) => {
    if (questionTypes.length > 1) {
      const updated = questionTypes.filter((_, i) => i !== index);
      setQuestionTypes(updated);
    } else {
      toast.error("At least one question type configuration is required.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);

      // Keep the UI matching the provided frames (no visible title input), but ensure
      // the API-required title is populated.
      if (!title.trim()) {
        const inferred = inferTitleFromFileName(file.name);
        setTitle(inferred || "New Assignment");
      }

      toast.success(`Attached file: ${file.name}`);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveTitle =
      title.trim() ||
      (uploadedFile ? inferTitleFromFileName(uploadedFile.name) : "");

    // Validations
    if (!effectiveTitle) {
      toast.error(
        "Please enter an assignment title (or attach a file to infer one).",
      );
      return;
    }
    if (!dueDate) {
      toast.error("Please select a due date.");
      return;
    }

    const selectedDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error("Due date cannot be in the past.");
      return;
    }

    // Submit details to Express Backend
    try {
      const payload = {
        title: effectiveTitle,
        dueDate,
        instructions,
        questionTypes,
      };

      toast.loading("Initiating AI generation...", { id: "create-job" });
      const response = await createAssignment(payload).unwrap();

      // Update UI Store with current job to trigger the WebSocket room monitoring
      setCurrentJob({
        jobId: response._id,
        status: "queued",
        progress: 0,
      });

      // Join WS room
      joinJobRoom(response._id);
      toast.success("Assignment queued for generation!", { id: "create-job" });
      setActiveTab("assignments")
    } catch (err: unknown) {
      toast.error("Failed to create assignment: " + getApiErrorMessage(err), {
        id: "create-job",
      });
    }
  };

  return (
    <form
      className="flex w-full flex-col gap-6 animate-fade-in special md:px-0 px-4"
      onSubmit={handleSubmit}
    >
      {/* Title row */}
      <div className=" gap-4 relative md:h-fit h-10  flex md:place-content-start place-content-center place-items-center ">
        <div className="md:hidden absolute top-0 left-0 size-10 bg-white/60 flex rounded-full place-content-center place-items-center">
          <ArrowLeft />
        </div>
        <div className=" hidden md:flex backdrop-blur-md bg-emerald-300/40 size-8  items-center justify-center rounded-full">
          <div className="size-4 rounded-full bg-emerald-500" />
        </div>{" "}
        <div className="flex flex-col flex-1">
          <h2 className="text-[16px] md:text-start text-center  font-bold tracking-[-0.6px] text-[#2b2b2b] md:text-[34px]">
            Create Assignment
          </h2>
          <span className=" hidden md:flex text-[14px] text-[#9a9a9a] md:text-[18px]">
            Set up a new assignment for your students
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-auto w-full max-w-[900px] gap-4 flex">
        <div className="h-[6px] flex-1 rounded-full bg-[#2b2b2b]" />
        <div className="h-[6px] flex-1 rounded-full bg-[#d9d9d9]" />
      </div>

      {/* Main card */}
      <div className="mx-auto w-full max-w-[900px] rounded-[32px] bg-white/50 px-5 py-7 sm:px-8 sm:py-10 md:px-12 md:py-12">
        <div className="flex flex-col gap-0">
          <h3 className="text-[20px] font-extrabold text-[#2b2b2b] md:text-[28px]">
            Assignment Details
          </h3>
          <span className="text-[14px] text-[#9a9a9a] md:text-[18px]">
            Basic information about your assignment
          </span>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <label className="text-[18px] font-bold text-[#2b2b2b] md:text-[20px]">
            Assignment Title
          </label>
          <input
            type="text"
            className="h-[52px] w-full rounded-full border border-[#d9d9d9] bg-white px-5 pr-14 text-[16px] font-semibold text-[#2b2b2b] focus:outline-none md:h-[58px] md:px-6 md:text-[18px]"
            value={title}
            placeholder="Enter assignment title"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-col gap-6 md:mt-10 md:gap-8">
          {/* Upload */}
          <div className="flex flex-col gap-2">
            <div
              className="relative flex cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#cfcfcf] bg-white px-6 py-6 text-center md:px-8 md:py-6"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <Upload className="h-8 w-8 text-[#2b2b2b]" />
              <div className="mt-5 text-[16px] font-semibold text-[#2b2b2b] md:mt-6 md:text-[20px]">
                {uploadedFile
                  ? uploadedFile.name
                  : "Choose a file or drag & drop it here"}
              </div>
              <div className="mt-2 text-[14px] text-[#bdbdbd] md:text-[16px]">
                JPEG, PNG, upto 10MB
              </div>
              <button
                type="button"
                className="mt-7 rounded-full bg-[#f2f2f2] px-8 py-3 text-[16px] font-medium text-[#2b2b2b] md:mt-8 md:px-10 md:text-[18px]"
              >
                Browse Files
              </button>
              <input
                type="file"
                id="file-input"
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
              />
            </div>
            <div className="text-center font-medium  text-[16px] text-[#9a9a9a] md:text-[16px]">
              Upload images of your preferred document/image
            </div>
          </div>

          {/* Due date */}
          <div className="flex flex-col gap-3">
            <label className="text-[18px] font-bold text-[#2b2b2b] md:text-[20px]">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                className="h-[52px] w-full rounded-full border border-[#d9d9d9] bg-white px-5 pr-14 text-[16px] font-semibold text-[#a9a9a9]/50 focus:outline-none md:h-[58px] md:px-6 md:text-[18px] placeholder:uppercase"
                value={dueDate}
                placeholder="DD-MM-YYYY"
                onChange={(e) => setDueDate(e.target.value)}
                style={{ textTransform: "uppercase" }}
              />

              {/* <div className="absolute right-5 top-1/2 -translate-y-1/2 rounded-[12px] border border-[#d9d9d9] p-2 text-[#2b2b2b]">
                <Calendar size={20} />
              </div> */}
            </div>
          </div>

          {/* Question types */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between md:hidden">
              <div className="text-[16px] font-bold text-[#2b2b2b] ">
                Question Types
              </div>
              <div className="text-[14px] font-semibold text-[#7a7a7a]">
                {totalQuestions} Qs • {totalMarks} Marks
              </div>
            </div>

            <div className=" items-center gap-6 md:flex  hidden justify-between items-center">
              <div className="text-[20px] font-bold text-[#2b2b2b] flex-1 text-start ">
                Question Type
              </div>
              <div className=" flex flex-1 justify-evenly ">
                <div className="text-center flex-1  text-[16px] font-medium text-[#2b2b2b]">
                  No. of Questions
                </div>
                <div className="text-center flex-1 text-[16px] font-medium text-[#2b2b2b]">
                  Marks
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {questionTypes.map((item, idx) => (
                <div
                  key={idx}
                  className="flex md:flex-row flex-col gap-3 md:p-0 p-3 md:items-center items-center md:gap-4 md:bg-transparent bg-white rounded-[24px]"
                >
                  <div className="relative md:static flex-1  w-full flex flex-row justify-between ">
                    <select
                      className="h-[44px] md:w-full text-start w-fit  rounded-full bg-white px-0 pr-12 text-[16px] font-medium text-[#2b2b2b] outline-none  md:px-8 md:pr-8 md:text-[16px]"
                      value={item.name}
                      onChange={(e) => updateTypeName(idx, e.target.value)}
                    >
                      {typeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full  text-[#2b2b2b]"
                      onClick={() => removeQuestionType(idx)}
                      aria-label="Remove row"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* <button
                    type="button"
                    className="hidden h-[62px] w-[48px] items-center justify-center rounded-full bg-transparent text-[#2b2b2b] md:flex"
                    onClick={() => removeQuestionType(idx)}
                    aria-label="Remove row"
                  >
                    <X size={22} />
                  </button> */}

                  <div className="w-full flex-1 h-full flex justify-evenly item-center md:bg-transparent bg-[#f0f0f0] rounded-[24px] md:py-0 py-2">

                    <div className="flex flex-col  items-center justify-center gap-3  md:rounded-full  md:px-4">
                      <div className="text-[14px] font-medium text-[#7a7a7a] md:hidden">
                        Questions
                      </div>
                      <div className="flex flex-1 items-center  justify-center rounded-full bg-white px-3 py-2 md:max-h- max-h-[44px] md:flex-none md:p-0">
                        <button
                          type="button"
                          className="h-9 w-9 rounded-full opacity-50  text-[18px] font-medium md:h-10 md:w-10 md:text-[22px]"
                          onClick={() => updateCount(idx, -1)}
                        >
                          -
                        </button>
                        <span className="min-w-10 text-center text-[16px] font-medium md:text-[20px]">
                          {item.count}
                        </span>
                        <button
                          type="button"
                          className="h-9 w-9 rounded-full opacity-50 text-[18px] font-medium md:h-10 md:w-10 md:text-[22px]"
                          onClick={() => updateCount(idx, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col  items-center justify-center gap-3 md:h-[62px] md:rounded-full bg md:px-4">
                      <div className="text-[14px] font-medium text-[#7a7a7a] md:hidden">
                        Marks
                      </div>
                      <div className="flex flex-1 items-center  justify-between rounded-full  px-3 py-2 md:max-h- max-h-[44px]  md:flex-none  md:p-0 bg-white">
                        <button
                          type="button"
                          className="h-9 w-9 rounded-full text-[18px] opacity-50 font-semibold md:h-10 md:w-10 md:text-[22px]"
                          onClick={() => updateMarks(idx, -1)}
                        >
                          -
                        </button>
                        <span className="min-w-10 text-center text-[16px] font-medium md:text-[20px]">
                          {item.marks}
                        </span>
                        <button
                          type="button"
                          className="h-9 w-9 rounded-full opacity-50  text-[18px] font-semibold md:h-10 md:w-10 md:text-[22px]"
                          onClick={() => updateMarks(idx, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>


                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-2 flex items-center gap-4 text-[14px] font-bold text-[#2b2b2b]"
              onClick={addQuestionType}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full size-[36px] bg-[#111] text-white">
                <Plus className="size-[20px]" />
              </span>
              Add Question Type
            </button>

            <div className="mt-4 n items-end justify-end gap-0  text-[16px] font-medium text-[#2b2b2b] flex flex-col">
              <div>Total Questions : {totalQuestions}</div>
              <div>Total Marks : {totalMarks}</div>
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-6 flex flex-col gap-3 ">
            <label className="text-[16px] font-bold text-[#2b2b2b] md:text-[16px]">
              Additional Information (For better output)
            </label>
            <div className="relative">
              <textarea
                className="min-h-[140px] w-full resize-none rounded-[22px] border-2 border-dashed border-[#cfcfcf] bg-[#f8f8f8] px-6 py-5 pr-16 text-[16px] text-[#2b2b2b] outline-none md:px-8 md:py-6 md:text-[18px]"
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
              <button
                type="button"
                className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#efefef] text-[#2b2b2b]"
                onClick={() =>
                  toast("Voice typing is a mock feature for this assignment!")
                }
              >
                <Mic size={18} />
              </button>
            </div>
          </div>

          {/* Hidden: Title field not present in the Figma frame but required by API */}
        </div>
      </div>

      {/* Footer nav */}
      <div className="mt-0 md:mt-3 flex w-full max-w-[990px]  mx-auto items-center md:justify-between justify-center gap-5 px-0 sm:px-8 md:px-12 ">
        <button
          type="button"
          className="flex items-center gap-3 rounded-full bg-white px-[24px] py-[12px] text-[16px] font-medium text-[#2b2b2b]  disabled:opacity-60  "
          onClick={() => setActiveTab("assignments")}
          disabled={isSubmitting}
        >
          <ArrowLeft size={22} />
          Previous
        </button>
        <button
          type="submit"
          className="flex items-center gap-3 rounded-full bg-[#111] px-[24px] py-[12px] text-[16px] font-medium text-white  disabled:opacity-60 "
          disabled={isSubmitting}
        >
          Next
          <ArrowRight size={22} />
        </button>
      </div>
    </form>
  );
}
