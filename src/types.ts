/** Entering Pricing from a "Purchase list" flow (unused in the standalone review build). */
export interface ListPurchaseContext {
  pricingMode: "purchase-list";
  source: "signalfuse-results";
  query: string;
  scenarioId: string;
  listName: string;
  resultCount: number;
  estimatedPrice: number;
}
