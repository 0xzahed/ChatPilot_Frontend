"use client";

import { useWorkspace } from "@/providers/workspace-context";

export const ROLE_RANK: Record<string, number> = {
  viewer: 0,
  agent: 1,
  manager: 2,
  admin: 3,
  owner: 4,
};

/**
 * The current user's role in the active workspace, with a `can(min)` helper.
 * The backend enforces these rules; this only hides controls a role can't use.
 * While the role is unknown (loading), `can` is permissive so nothing flickers.
 */
export function useRole() {
  const { workspace } = useWorkspace();
  const role = workspace?.role ?? null;
  const can = (min: keyof typeof ROLE_RANK) =>
    role === null ? true : (ROLE_RANK[role] ?? 0) >= ROLE_RANK[min];
  return { role, can };
}
