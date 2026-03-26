import { z } from "zod";
import { widgetSettingsSchema } from "./schemas";

export type FormSchema = z.infer<typeof widgetSettingsSchema>;

export type WidgetCustomizationSection =
  | "messages"
  | "suggestions"
  | "appearance"
  | "voice";
