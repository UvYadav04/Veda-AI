import { create } from "zustand";

interface JobProgress {
  jobId: string;
  status: "queued" | "generating" | "completed" | "failed";
  progress: number;
  error?: string;
}

interface UIStore {
  activeTab: "assignments" | "create" | "view";
  selectedAssignmentId: string | null;
  searchQuery: string;
  filterStatus: string;
  currentJob: JobProgress | null;

  setActiveTab: (tab: "assignments" | "create" | "view") => void;
  setSelectedAssignmentId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  setCurrentJob: (job: JobProgress | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: "assignments",
  selectedAssignmentId: null,
  searchQuery: "",
  filterStatus: "all",
  currentJob: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedAssignmentId: (id) => set({ selectedAssignmentId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setCurrentJob: (job) => set({ currentJob: job }),
}));
