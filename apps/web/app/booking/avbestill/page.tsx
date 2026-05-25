"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { CheckIcon, XIcon, LoaderIcon } from "lucide-react";

function CancelBookingContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const cancelByToken = useMutation(api.public.bookings.cancelByToken);

  const [state, setState] = useState<"loading" | "success" | "already" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    cancelByToken({ token })
      .then((result) => {
        setState(result.alreadyCancelled ? "already" : "success");
      })
      .catch(() => setState("error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {state === "loading" && (
          <>
            <LoaderIcon className="mx-auto mb-4 size-8 animate-spin text-gray-400" />
            <p className="text-gray-600">Avbestiller…</p>
          </>
        )}
        {state === "success" && (
          <>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100">
              <CheckIcon className="size-6 text-green-600" />
            </div>
            <h1 className="text-lg font-semibold">Bestilling avbestilt</h1>
            <p className="mt-2 text-sm text-gray-500">
              Bestillingen er avbestilt. Du kan lukke denne siden.
            </p>
          </>
        )}
        {state === "already" && (
          <>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gray-100">
              <CheckIcon className="size-6 text-gray-500" />
            </div>
            <h1 className="text-lg font-semibold">Allerede avbestilt</h1>
            <p className="mt-2 text-sm text-gray-500">
              Denne bestillingen er allerede avbestilt.
            </p>
          </>
        )}
        {state === "error" && (
          <>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
              <XIcon className="size-6 text-red-500" />
            </div>
            <h1 className="text-lg font-semibold">Ikke funnet</h1>
            <p className="mt-2 text-sm text-gray-500">
              Vi fant ikke bestillingen. Lenken kan være utløpt eller ugyldig.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function CancelBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <LoaderIcon className="mx-auto mb-4 size-8 animate-spin text-gray-400" />
            <p className="text-gray-600">Laster…</p>
          </div>
        </div>
      }
    >
      <CancelBookingContent />
    </Suspense>
  );
}
