import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { showApiError } from "@/src/lib/errors/showApiError";

/**
 * Global error net (Layer B4 of the error-handling design).
 *
 * These cache-level handlers fire for EVERY query/mutation error — including
 * from code that does no error handling of its own, and code written in the
 * future. This is what makes the system safe against "the error we haven't
 * imagined yet": there is no way for an API failure to reach the user as a raw
 * message, because the worst case is still a friendly toast + reference ID.
 *
 * Opt out of the automatic toast per query/mutation with
 * `meta: { showErrorToast: false }` (use when a surface renders its own error
 * UI and a toast would double up).
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.showErrorToast === false) return;
      // Initial-load failures are rendered inline (ErrorState / a table's error
      // prop), so a toast there would double-report. Only surface a toast when
      // a *background* refetch of already-visible data fails — the stale data
      // stays on screen and the toast explains why it didn't update.
      if (query.state.data === undefined) return;
      showApiError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // Any mutation that doesn't surface its own error still gets a friendly
      // toast + reference ID. Mutations with bespoke error UI opt out via
      // meta.showErrorToast = false.
      if (mutation.options.meta?.showErrorToast === false) return;
      showApiError(error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
