"use client";

import { useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import { useUIStore } from "../store/useStore";
import { apiSlice } from "../store/apiSlice";
import { isRecord } from "../lib/errors";

let socket: Socket | null = null;

type JobStatus = "queued" | "generating" | "completed" | "failed";

type JobProgressPayload = {
  jobId: string;
  status: JobStatus;
  progress: number;
  data?: unknown;
};

export const useWebSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Prevent duplicate connections
    if (socket) return;

    socket = io(
      (process.env.NEXT_PUBLIC_BACKEND_API_URL
        ? process.env.NEXT_PUBLIC_BACKEND_API_URL.replace(/\/api\/?$/, "")
        : "http://localhost:5000"),
      {
        transports: ["websocket"],
      });

    socket.on("connect", () => {
      console.log("Connected to WebSocket server:", socket?.id);
    });

    socket.on("job:progress", (data: JobProgressPayload) => {
      console.log("WS progress update received:", data);

      const {
        currentJob,
        setCurrentJob,
        setSelectedAssignmentId,
        setActiveTab,
      } = useUIStore.getState();

      // Ignore unrelated jobs
      if (!currentJob || currentJob.jobId !== data.jobId) {
        return;
      }

      // Update current job state
      setCurrentJob({
        jobId: data.jobId,
        status: data.status,
        progress: data.progress,
      });

      // Optional progress toast
      toast.loading(`Generating... ${data.progress}%`, {
        id: data.jobId,
      });

      // Job completed
      if (data.status === "completed") {
        toast.success("Question paper generated successfully!", {
          id: data.jobId,
        });

        // Refresh assignment list
        dispatch(
          apiSlice.util.invalidateTags([{ type: "Assignment", id: "LIST" }]),
        );

        // Navigate to generated assignment
        if (isRecord(data.data) && typeof data.data["_id"] === "string") {
          const assignmentId = data.data["_id"];

          dispatch(
            apiSlice.util.invalidateTags([
              { type: "Assignment", id: assignmentId },
            ]),
          );

          setSelectedAssignmentId(assignmentId);
          setActiveTab("view");
        }

        setCurrentJob(null);
      }

      // Job failed
      else if (data.status === "failed") {
        const errMsg =
          isRecord(data.data) && typeof data.data["error"] === "string"
            ? data.data["error"]
            : "LLM generation failed";

        toast.error(`Generation failed: ${errMsg}`, {
          id: data.jobId,
          duration: 5000,
        });

        dispatch(
          apiSlice.util.invalidateTags([{ type: "Assignment", id: "LIST" }]),
        );

        setCurrentJob(null);
      }
    });

    socket.on("assignments:update", () => {
      dispatch(
        apiSlice.util.invalidateTags([{ type: "Assignment", id: "LIST" }]),
      );
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected from WebSocket server:", reason);
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [dispatch]);

  const joinJobRoom = (jobId: string) => {
    if (!socket) {
      console.warn("Socket not initialized");
      return;
    }

    socket.emit("join:job", jobId);

    console.log(`Joined WS room: ${jobId}`);
  };

  return {
    joinJobRoom,
    socket,
  };
};
