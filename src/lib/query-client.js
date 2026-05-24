import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min — don't refetch fresh data
      gcTime: 30 * 60 * 1000,     // 30 min — keep in memory
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});