"use client";

import { api } from "@workspace/backend/_generated/api";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";

export function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const addUser = useMutation(api.users.add);

  useEffect(() => {
    if (!isAuthenticated) return;
    void addUser().catch(() => {});
  }, [isAuthenticated, addUser]);

  return null;
}
