"use client";

import { useAtomValue } from "jotai";
import { AlertTriangleIcon } from "lucide-react";
import { useWidgetDisplayTitle } from "@/lib/widget-display-title";
import { errorMessageAtom } from "@/modules/widget/atoms/widget-atoms";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";

export const WidgetErrorScreen = () => {
  const errorMessage = useAtomValue(errorMessageAtom);
  const widgetTitle = useWidgetDisplayTitle();

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 pb-6 pt-1 font-semibold">
          <p className="text-center text-[15px] font-semibold tracking-tight">
            {widgetTitle}
          </p>
          <p className="text-3xl">
            Hei! 👋
          </p>
          <p className="text-lg">
            La oss komme i gang
          </p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <AlertTriangleIcon />
        <p className="text-sm">
          {errorMessage || "Ugyldig konfigurasjon"}
        </p>
      </div>
    </>
  );
};
