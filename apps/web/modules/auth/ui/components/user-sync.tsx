"use client";

import { api } from "@workspace/backend/_generated/api";
import { useMutation } from "convex/react";
import { useEffect } from "react";

/**
 * Syncs the authenticated Clerk user into Convex `users` table on mount.
 * Acts as a fallback in case the Clerk webhook hasn't fired yet.
 */
export function UserSync() {
  const addUser = useMutation(api.users.add);

  useEffect(() => {
    void addUser();
  }, [addUser]);

  return null;
}
