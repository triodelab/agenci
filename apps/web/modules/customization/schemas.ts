import { z } from "zod";

export const widgetAppearanceSchema = z.object({
  position: z.enum(["center", "bottom-right", "bottom-left", "custom"]),
  customX: z.number(),
  customY: z.number(),
  width: z.number().min(280).max(560),
  height: z.number().min(360).max(800),
  borderRadius: z.number().min(0).max(32),
  headerColor: z.string(),
  headerTextColor: z.string(),
  bubbleUserColor: z.string(),
  bubbleUserTextColor: z.string(),
  bubbleAssistantColor: z.string(),
  bubbleAssistantTextColor: z.string(),
  backgroundColor: z.string(),
  inputBorderColor: z.string(),
  inputBackgroundColor: z.string(),
  inputTextColor: z.string(),
  inputPlaceholderColor: z.string(),
  bubbleButtonColor: z.string(),
  bubbleButtonIconColor: z.string(),
  bubbleButtonSize: z.number().min(40).max(80),
});

export const widgetSettingsSchema = z.object({
  agentId: z.string().optional(),
  widgetTitle: z
    .string()
    .min(1, "Tittel er påkrevd")
    .max(64, "Maks 64 tegn"),
  greetMessage: z.string().min(1, "Greeting message is required"),
  defaultSuggestions: z.object({
    suggestion1: z.string().optional(),
    suggestion2: z.string().optional(),
    suggestion3: z.string().optional(),
  }),
  vapiSettings: z.object({
    assistantId: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
  appearance: widgetAppearanceSchema,
});
