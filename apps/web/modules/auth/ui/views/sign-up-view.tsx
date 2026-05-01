"use client";

import { SignUp } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";

const lightAppearance = {
  baseTheme: shadcn,
  variables: {
    colorBackground: "#ffffff",
    colorForeground: "#18181b",
    colorMuted: "#f4f4f5",
    colorMutedForeground: "#71717a",
    colorPrimary: "#0a0a0a",
    colorPrimaryForeground: "#fafafa",
    colorNeutral: "#e4e4e7",
    colorBorder: "#e4e4e7",
    colorInput: "#fafafa",
    colorInputForeground: "#18181b",
    borderRadius: "0.625rem",
  },
} as const;

export const SignUpView = () => {
  return (
    <SignUp routing="hash" appearance={lightAppearance} />
  );
};
