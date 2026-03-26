import { useAtomValue } from "jotai";
import { widgetSettingsAtom } from "@/modules/widget/atoms/widget-atoms";

export const DEFAULT_WIDGET_TITLE = "Agenci";

export function useWidgetDisplayTitle(): string {
  const s = useAtomValue(widgetSettingsAtom);
  const t = s?.widgetTitle?.trim();
  return t || DEFAULT_WIDGET_TITLE;
}
