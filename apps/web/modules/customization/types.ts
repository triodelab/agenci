import { z } from "zod";
import { widgetSettingsSchema } from "./schemas";

export type FormSchema = z.infer<typeof widgetSettingsSchema>;

export type WidgetCustomizationSection =
  | "agent"
  | "messages"
  | "suggestions"
  | "appearance"
  | "voice";
