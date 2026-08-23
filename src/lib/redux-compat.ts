"use client";

import { useCallback, useRef } from "react";
import { useToast } from "@/components/ui/toast";

/**
 * Wraps a Redux RTK Query mutation trigger into a React Query-compatible
 * mutation object so existing pages can switch with minimal code changes.
 *
 * Usage:
 *   const [reduxTrigger, { isLoading }] = useUpdateXMutation();
 *   const updateMutation = useReduxMutation(reduxTrigger, {
 *     successMsg: "Updated",
 *     errorMsg: "Failed",
 *     onSuccess: () => refetch(),
 *   });
 *   updateMutation.mutate({ id, data });
 *   updateMutation.isPending
 */
export function useReduxMutation<TArg, TResult>(
  trigger: (arg: TArg) => { unwrap: () => Promise<TResult> },
  opts: {
    successMsg?: string;
    errorMsg?: string;
    onSuccess?: (data: TResult) => void;
    onError?: (err: any) => void;
  } = {}
) {
  const { toast } = useToast();
  const pendingRef = useRef(false);
  // We track pending state via a simple ref + forceUpdate pattern
  // But since RTK Query already tracks isLoading, we rely on the caller
  // destructuring isLoading from the original hook.

  const mutate = useCallback(
    (arg: TArg) => {
      pendingRef.current = true;
      trigger(arg)
        .unwrap()
        .then((data) => {
          pendingRef.current = false;
          if (opts.successMsg) {
            toast({ type: "success", title: opts.successMsg });
          }
          opts.onSuccess?.(data);
        })
        .catch((err) => {
          pendingRef.current = false;
          if (opts.errorMsg) {
            toast({ type: "error", title: opts.errorMsg });
          }
          opts.onError?.(err);
        });
    },
    [trigger, opts, toast]
  );

  const mutateAsync = useCallback(
    async (arg: TArg): Promise<TResult> => {
      try {
        const data = await trigger(arg).unwrap();
        if (opts.successMsg) {
          toast({ type: "success", title: opts.successMsg });
        }
        opts.onSuccess?.(data);
        return data;
      } catch (err) {
        if (opts.errorMsg) {
          toast({ type: "error", title: opts.errorMsg });
        }
        opts.onError?.(err as any);
        throw err;
      }
    },
    [trigger, opts, toast]
  );

  return { mutate, mutateAsync, isPending: pendingRef.current };
}
