import type { BillingPeriod } from "../../data/pricingPlans";
import { PLANS } from "../../data/pricingPlans";

/** Prototype pricing options shown side by side for review (Current = shipped layout). */
export type PricingOption = "current" | "b" | "b3";

export const PRICING_OPTIONS: { id: PricingOption; label: string; description: string }[] = [
  { id: "current", label: "Current", description: "Shipped layout, unchanged." },
  { id: "b", label: "B · Value-led", description: "Credit chip under the price, 'you pay / you get' box on Pro, seats alert on Team." },
  { id: "b3", label: "B3 · Value focused", description: "No goal picker, compact price with strike-through, credit summary under the price." },
];

/** Option B's value-led cards (chip, you pay / you get, seats alert). */
export const isValueLed = (o: PricingOption) => o === "b";

/** Local exploration — how B3 shows Individual / Team / One-time groups and selection. */
export type GroupStyle = "panels" | "tracks" | "tabs" | "spotlight" | "inline" | "glow" | "switch" | "tray" | "tabsBorder" | "tabsGlow";

export const GROUP_STYLES: { id: GroupStyle; label: string }[] = [
  { id: "panels", label: "Panels" },
  { id: "tracks", label: "Color tracks" },
  { id: "tabs", label: "Focus tabs" },
  { id: "spotlight", label: "Spotlight" },
  { id: "inline", label: "In-card tags" },
  { id: "glow", label: "Glow" },
  { id: "switch", label: "Audience switch" },
  { id: "tray", label: "Tray" },
  { id: "tabsBorder", label: "Focus tabs · Border" },
  { id: "tabsGlow", label: "Focus tabs · Glow" },
];

/** Options that group cards into Individual / Team / One-time panels. */
export const groupsPlans = (o: PricingOption) => o === "b3";

/** Options without the "Tell us your goal" picker (no auto-recommended plan). */
export const hidesGoalPicker = (o: PricingOption) => o === "b3";

/** Ad hoc (pay-as-you-go) credit rate available to Basic users. */
export const PAYG_CREDIT_RATE = 0.15;

function planPrice(id: "basic" | "pro", billing: BillingPeriod) {
  const plan = PLANS.find((p) => p.id === id)!;
  return Number((billing === "monthly" ? plan.monthly : plan.annual).display.replace(/,/g, ""));
}

/** Basic vs Pro credit math, derived from plan prices so it follows billing period. */
export function creditValue(billing: BillingPeriod) {
  const included = billing === "annual" ? 6000 : 500;
  const basicPrice = planPrice("basic", billing);
  const proPrice = planPrice("pro", billing);
  return {
    included,
    /** Annual billing adds 1,000 bonus credits on top of the included credits. */
    bonus: billing === "annual" ? 1000 : 0,
    basicPrice,
    proPrice,
    difference: proPrice - basicPrice,
    includedValue: included * PAYG_CREDIT_RATE,
  };
}

export const fmtNumber = (n: number) => n.toLocaleString("en-US");
export const fmtMoney = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
export const fmtRate = (n: number) => `$${n.toFixed(2)}`;
