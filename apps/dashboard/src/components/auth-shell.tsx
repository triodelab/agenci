import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AuthShell(props: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="mb-8 text-center">
        <Link
          to="/"
          className="text-xl font-semibold tracking-tight text-neutral-900"
        >
          Agenci
        </Link>
      </div>
      <div className="w-full max-w-md space-y-5 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">
            {props.title}
          </h1>
          {props.subtitle ? (
            <p className="text-[14px] text-neutral-500">{props.subtitle}</p>
          ) : null}
        </div>
        {props.children}
      </div>
      {props.footer ? (
        <div className="mt-5 text-center text-[13px] text-neutral-500">
          {props.footer}
        </div>
      ) : null}
    </div>
  );
}
