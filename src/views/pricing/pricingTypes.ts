import type { BillingPeriod, PlanId } from "../../data/pricingPlans";
import type { ListPurchaseContext } from "../../types";

export interface PricingLayoutProps {
  billing: BillingPeriod;
  selectedPlan: PlanId;
  /** Single plan that may show a badge — never both MOST POPULAR and RECOMMENDED. */
  badgePlanId: PlanId;
  activeBadgeLabel: "MOST POPULAR" | "RECOMMENDED";
  purchaseContext: ListPurchaseContext | null;
  isPurchaseMode: boolean;
  buyListPriceDisplay: string;
  buyListSupportLines: string[];
  buyListCta: string;
  onSelectCard: (planId: PlanId) => void;
  onCta: (planId: PlanId) => void;
  onSelectPlan: (planId: Exclude<PlanId, "buy-list">, billing: BillingPeriod) => void;
}

export const CARD_SHADOW =
  "0px 1px 3px rgba(71,84,103,0.04), 0px 5px 5px rgba(71,84,103,0.03), 0px 11px 7px rgba(71,84,103,0.02), 0px 19px 8px rgba(71,84,103,0.01)";

/** Genie Material Design effect style "sm". */
export const GENIE_SHADOW_SM =
  "0px 0px 0px rgba(71,84,103,0.04), 0px 0px 1px rgba(71,84,103,0.04), 0px 1px 1px rgba(71,84,103,0.03), 0px 3px 2px rgba(71,84,103,0.02), 0px 5px 2px rgba(71,84,103,0.01), 0px 8px 2px rgba(71,84,103,0)";
