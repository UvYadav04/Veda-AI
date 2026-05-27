import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface QuestionConfig {
  name: string;
  count: number;
  marks: number;
}

export interface Question {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  answer: string;
}

export interface Section {
  sectionName: string;
  questionType: string;
  instructions: string;
  questions: Question[];
}

export interface Paper {
  schoolName: string;
  subject: string;
  classLevel: string;
  timeAllowedMinutes: number;
  maxMarks: number;
  sections: Section[];
}

export interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
  instructions?: string;
  questionTypes: QuestionConfig[];
  status: 'queued' | 'generating' | 'completed' | 'failed';
  progress: number;
  errorMessage?: string;
  pdfPath?: string;
  totalQuestions: number;
  totalMarks: number;
  paper?: Paper;
  createdAt: string;
  updatedAt: string;
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api' }),
  tagTypes: ['Assignment'],
  endpoints: (builder) => ({
    getAssignments: builder.query<Assignment[], { search?: string; status?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
        return `/assignments?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ _id }) => ({ type: 'Assignment' as const, id: _id })),
            { type: 'Assignment', id: 'LIST' },
          ]
          : [{ type: 'Assignment', id: 'LIST' }],
    }),
    getAssignmentById: builder.query<Assignment, string>({
      query: (id) => `/assignments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Assignment', id }],
    }),
    createAssignment: builder.mutation<Assignment, Omit<Partial<Assignment>, '_id' | 'status' | 'progress'>>({
      query: (body) => ({
        url: '/assignments',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Assignment', id: 'LIST' }],
    }),
    deleteAssignment: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/assignments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Assignment', id: 'LIST' }],
    }),
    regenerateAssignment: builder.mutation<Assignment, string>({
      query: (id) => ({
        url: `/assignments/${id}/regenerate`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Assignment', id },
        { type: 'Assignment', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAssignmentsQuery,
  useGetAssignmentByIdQuery,
  useCreateAssignmentMutation,
  useDeleteAssignmentMutation,
  useRegenerateAssignmentMutation,
} = apiSlice;
