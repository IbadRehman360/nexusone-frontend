import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSignInLogs } from "@/src/services/entra-id/signInLogsApi";
import { queryKeys } from "@/src/lib/query/queryKeys";
import type { SignInLogFilters, SignInLogRow } from "@/src/types/signInLogs";

export function useSignInLogs(filters: SignInLogFilters) {
  const filtersKey = JSON.stringify(filters);

  const query = useInfiniteQuery({
    queryKey: queryKeys.signInLogs.list(filtersKey),
    queryFn: ({ pageParam }: { pageParam?: string }) => fetchSignInLogs(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 120_000,
    retry: false,
  });

  const rows: SignInLogRow[] = query.data?.pages.flatMap((page) => page.rows) ?? [];

  return {
    rows,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    hasMore: !!query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
    refetch: () => void query.refetch(),
  };
}
