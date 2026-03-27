"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

import { cn } from "@workspace/ui/lib/utils"

const Toaster = ({
  className,
  toastOptions,
  style,
  ...props
}: ToasterProps) => {
  const { resolvedTheme } = useTheme()
  const sonnerTheme: ToasterProps["theme"] =
    resolvedTheme === "dark" ? "dark" : "light"

  return (
    <div className="dashboard-app-shell">
      <Sonner
        {...props}
        className={cn("toaster group", className)}
        style={
          {
            "--normal-bg": "var(--card)",
            "--normal-text": "var(--card-foreground)",
            "--normal-border": "var(--border)",
            ...style,
          } as React.CSSProperties
        }
        theme={sonnerTheme}
        toastOptions={{
          ...toastOptions,
          classNames: {
            toast:
              "border-border bg-card text-card-foreground shadow-lg backdrop-blur-none",
            description: "text-muted-foreground",
            ...toastOptions?.classNames,
          },
        }}
      />
    </div>
  )
}

export { Toaster }
