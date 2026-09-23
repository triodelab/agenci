export type ProductDemoScene =
  | "inbox"
  | "knowledge"
  | "handoff"
  | "booking"
  | "insights"
  | "tickets"
  | "conversation"
  | "brand"
  | "presence";
export const PRODUCT_DEMO_FPS = 30;
export const PRODUCT_DEMO_DURATION = 330;

export function getProductDemoDimensions(
  scene: ProductDemoScene,
  compact: boolean,
) {
  if (scene === "inbox")
    return compact ? { width: 520, height: 700 } : { width: 960, height: 580 };
  if (scene === "brand")
    // The stacked panels need room for the full reply and their outer glass rim.
    return compact ? { width: 400, height: 620 } : { width: 720, height: 400 };
  if (scene === "booking") return { width: 600, height: 360 };
  return { width: 400, height: 360 };
}
