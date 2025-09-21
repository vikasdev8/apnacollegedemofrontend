import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  : 'http://localhost:8000';

export interface Topic {
  _id: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Problem {
  _id: string;
  title: string;
  description: string;
  topicId: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  youtubeLink?: string;
  leetcodeLink?: string;
  codeforcesLink?: string;
  articleLink?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  _id: string;
  userId: string;
  problemId: string;
  isCompleted: boolean;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopicWithProgress extends Topic {
  problems: ProblemWithProgress[];
  totalProblems: number;
  completedProblems: number;
  completionPercentage: number;
}

export interface ProblemWithProgress extends Problem {
  progress: {
    isCompleted: boolean;
    notes?: string;
    completedAt?: string;
  };
}

// Chapter with nested topics (backend /sheet returns chapters -> topics -> problems)
export interface ChapterWithTopics {
  _id: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  icon?: string;
  topics: TopicWithProgress[];
  totalProblems: number;
  completedProblems: number;
  completionPercentage: number;
}

export interface UserStats {
  totalProblems: number;
  completedProblems: number;
  remainingProblems: number;
  completionPercentage: number;
  difficultyStats: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
}

export const dsaApi = createApi({
  reducerPath: 'dsaApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1/dsa`,
    credentials: 'include',
  }),
  tagTypes: ['Topic', 'Problem', 'Progress', 'DSASheet', 'Stats'],
  endpoints: (builder) => ({
    // Topic endpoints
    getTopics: builder.query<Topic[], void>({
      query: () => '/topics',
      providesTags: ['Topic'],
    }),
    createTopic: builder.mutation<Topic, { name: string; description: string; order?: number }>({
      query: (body) => ({
        url: '/topics',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Topic', 'DSASheet'],
    }),

    // Problem endpoints
    getProblems: builder.query<Problem[], void>({
      query: () => '/problems',
      providesTags: ['Problem'],
    }),
    createProblem: builder.mutation<Problem, { title: string; description: string; topicId: string; difficulty: 'Easy' | 'Medium' | 'Hard'; youtubeLink?: string; leetcodeLink?: string; codeforcesLink?: string; articleLink?: string; order?: number }>({
      query: (body) => ({
        url: '/problems',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Problem', 'DSASheet', 'Stats'],
    }),

    getProblemsByTopic: builder.query<Problem[], string>({
      query: (topicId) => `/topics/${topicId}/problems`,
      providesTags: ['Problem'],
    }),

    // Progress endpoints
    updateProgress: builder.mutation<UserProgress, { problemId: string; isCompleted: boolean; notes?: string }>({
      query: ({ problemId, ...body }) => ({
        url: `/progress/${problemId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Progress', 'DSASheet', 'Stats'],
    }),

    getUserProgress: builder.query<UserProgress[], void>({
      query: () => '/progress',
      providesTags: ['Progress'],
    }),

    // Main DSA Sheet endpoint (now returns chapters with nested topics)
    getDsaSheet: builder.query<ChapterWithTopics[], void>({
      query: () => '/sheet',
      providesTags: ['DSASheet'],
    }),

    // User statistics
    getUserStats: builder.query<UserStats, void>({
      query: () => '/stats',
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useGetTopicsQuery,
  useCreateTopicMutation,
  useGetProblemsQuery,
  useCreateProblemMutation,
  useGetProblemsByTopicQuery,
  useUpdateProgressMutation,
  useGetUserProgressQuery,
  useGetDsaSheetQuery,
  useGetUserStatsQuery,
} = dsaApi;