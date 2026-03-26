import type { ComponentProps, HTMLAttributes } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";

export type AIMessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant";
};

export const AIMessage = ({ className, from, ...props }: AIMessageProps) => (
  <div
    className={cn(
      "group flex w-full items-end justify-end gap-2 py-2",
      from === "user" ? "is-user" : "is-assistant flex-row-reverse justify-end",
      "[&>div]:max-w-[80%]",
      className
    )}
    {...props}
  />
);

export type AIMessageContentProps = HTMLAttributes<HTMLDivElement>;

export const AIMessageContent = ({
  children,
  className,
  ...props
}: AIMessageContentProps) => (
  <div
    className={cn(
      "break-words",
      "flex flex-col gap-2 rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed",
      /* Visitor / bot side — lys boble (Chatbase-lignende) */
      "border-zinc-200/90 bg-zinc-100/95 text-zinc-900",
      "dark:border-zinc-700/80 dark:bg-zinc-800/85 dark:text-zinc-100",
      /* Operator side — mørk boble (ikke brand-blå) */
      "group-[.is-user]:border-transparent group-[.is-user]:bg-zinc-900 group-[.is-user]:text-white",
      "dark:group-[.is-user]:bg-zinc-100 dark:group-[.is-user]:text-zinc-950",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type AIMessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const AIMessageAvatar = ({
  src,
  name,
  className,
  ...props
}: AIMessageAvatarProps) => (
  <Avatar className={cn("size-8", className)} {...props}>
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || "ME"}</AvatarFallback>
  </Avatar>
);
