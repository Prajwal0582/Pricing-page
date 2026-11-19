/** Where a list came from when Pricing / checkout opens with it. */
export type ListSource = "signalfuse-results" | "manual-search" | "saved-list";

/** Entering Pricing from a "Purchase list" flow (unused in the standalone review build). */
export interface ListPurchaseContext {
  pricingMode: "purchase-list";
  source: ListSource;
  query: string;
  scenarioId: string;
  listName: string;
  resultCount: number;
  estimatedPrice: number;
  /** Buy list is badged RECOMMENDED and selected; otherwise Pro stays MOST POPULAR and selected. */
  recommendBuyList?: boolean;
}
