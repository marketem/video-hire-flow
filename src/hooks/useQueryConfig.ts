import { DefaultOptions } from "@tanstack/react-query"

// Global configuration for React Query
export const queryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    retry: 1, // Only retry failed requests once
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  },
  mutations: {
    retry: 1, // Only retry failed mutations once
  },
}