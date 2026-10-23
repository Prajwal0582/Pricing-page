export type BillingPeriod = "monthly" | "annual";
export type PlanId = "basic" | "pro" | "team" | "buy-list";
export type GoalId = "view" | "export" | "team" | "list";

export const GOAL_CHIPS: { id: GoalId; label: string; recommends: PlanId }[] = [
  { id: "view", label: "I only need to view data", recommends: "basic" },
  { id: "export", label: "I send emails to prospects and export data", recommends: "pro" },
  { id: "team", label: "I have a team that manages prospecting", recommends: "team" },
  { id: "list", label: "I need a one-time list", recommends: "buy-list" },
];

export interface PlanPricing {
  display: string;
  suffix: string;
  supportLines: string[];
  benefit: string;
  strikePrice?: string;
}

export interface FeatureItem {
  label: string;
  bold?: boolean;
  info?: boolean;
  /** Expandable parent row with nested children */
  expandable?: boolean;
  /** Start expanded (e.g. Buy list subscription features) */
  defaultExpanded?: boolean;
  children?: { label: string; info?: boolean }[];
}

export interface PlanDefinition {
  id: PlanId;
  category: string;
  name: string;
  description: string;
  popular?: boolean;
  cta: string;
  ctaPrimary?: boolean;
  monthly: PlanPricing;
  annual: PlanPricing;
  accessTitle: string;
  accessItems: string[];
  includedTitle: string;
  includedItems: FeatureItem[];
  notIncludedTitle?: string;
  notIncludedItems?: FeatureItem[];
  addons?: { label: string; info?: boolean }[];
}

export const PLANS: PlanDefinition[] = [
  {
    id: "basic",
    category: "LEAD EXPLORATION",
    name: "Basic",
    description: "Discover, research, and organize your ideal customers.",
    cta: "Choose Basic →",
    monthly: {
      display: "99",
      suffix: "/mo",
      supportLines: ["Per seat per month billed monthly", "Annual contract"],
      benefit: "Unlimited view only access",
    },
    annual: {
      display: "990",
      suffix: "/y",
      supportLines: ["$1,188/yr - Billed annually", "Only 10 months’ cost when paid upfront"],
      benefit: "Unlimited view only access",
      strikePrice: "1,188",
    },
    accessTitle: "View only access to:",
    accessItems: [
      "US Business & Consumer Data",
      "US New Business & New Movers",
      "Canadian Business & Consumer Data",
    ],
    includedTitle: "Included Features",
    includedItems: [
      { label: "Weekly data refresh" },
      { label: "Customer profile analysis" },
      { label: "Dedicated advisor & expert guidance" },
      { label: "Direct mail campaigns", info: true },
    ],
    notIncludedTitle: "Not Included",
    notIncludedItems: [
      { label: "Credits (requires additional purchase)" },
      { label: "Export leads (Credits required)" },
      { label: "Email unlocks (Credits required)" },
      { label: "Email Campaigns (Credits required)" },
      { label: "MCP (credits required)", info: true },
      { label: "CRM integration", info: true },
    ],
    addons: [
      { label: "Consumer cellphone", info: true },
      { label: "Buyer Intent" },
      { label: "Purchase Signals" },
    ],
  },
  {
    id: "pro",
    category: "PROSPECT & EXPORT",
    name: "Pro",
    description: "Connect with prospects, run campaigns, and accelerate your growth",
    popular: true,
    cta: "Choose Pro →",
    ctaPrimary: true,
    monthly: {
      display: "149",
      suffix: "/mo",
      supportLines: ["Per seat per month billed monthly", "Annual contract"],
      benefit: "500 credits/month",
    },
    annual: {
      display: "1,490",
      suffix: "/y",
      supportLines: ["$1,788/yr - Billed annually", "Only 10 months’ cost when paid upfront"],
      benefit: "6000 credits/yr (provided upfront)",
      strikePrice: "1,788",
    },
    accessTitle: "View + Export access to:",
    accessItems: [
      "US Business & Consumer Data",
      "US New Mover & New Businesses",
      "Canadian Business & Consumer Data",
    ],
    includedTitle: "Included Features",
    includedItems: [
      {
        label: "Everything in Basic",
        bold: true,
        expandable: true,
        children: [
          { label: "Weekly data refresh" },
          { label: "Customer profile analysis" },
          { label: "Dedicated advisor & expert guidance" },
          { label: "Direct mail campaigns", info: true },
        ],
      },
      { label: "Credits (500/month)" },
      { label: "Export leads (uses credits)" },
      { label: "Email unlocks (uses credits)" },
      { label: "Email Campaigns (uses credits)" },
      { label: "MCP integration", info: true },
      { label: "CRM integration", info: true },
      { label: "Direct mail campaigns", info: true },
    ],
    notIncludedTitle: "Not Included",
    notIncludedItems: [
      { label: "Admin control" },
      { label: "Lead assignment & team reporting" },
      { label: "Additional user license" },
    ],
    addons: [
      { label: "Consumer cellphone", info: true },
      { label: "Buyer Intent" },
      { label: "Purchase Signals" },
    ],
  },
  {
    id: "team",
    category: "SALES COLLABORATION",
    name: "Team",
    description: "Pro plus collaboration, reporting, and multi-user management.",
    cta: "Choose Team →",
    monthly: {
      display: "299",
      suffix: "/mo",
      supportLines: ["5 seats per month billed monthly", "Annual contract"],
      benefit: "500 shared credits/month",
    },
    annual: {
      display: "2,990",
      suffix: "/y",
      supportLines: ["$3,588/yr - Billed annually", "Only 10 months’ cost when paid upfront"],
      benefit: "6000 credits/yr (provided upfront)",
      strikePrice: "3,588",
    },
    accessTitle: "Unlimited access to:",
    accessItems: [
      "US Business & Consumer Data",
      "US New Mover & New Businesses",
      "Canadian Business & Consumer Data",
    ],
    includedTitle: "Included Features",
    includedItems: [
      {
        label: "Everything in Pro",
        bold: true,
        expandable: true,
        children: [
          { label: "Credits (500/month)" },
          { label: "Export leads (uses credits)" },
          { label: "Email unlocks (uses credits)" },
          { label: "Email Campaigns (uses credits)" },
          { label: "MCP integration", info: true },
          { label: "CRM integration", info: true },
          { label: "Direct mail campaigns", info: true },
        ],
      },
      { label: "5 user licenses included" },
      { label: "Assign leads to team members" },
      { label: "Track team activities" },
      { label: "Team performance reporting" },
      { label: "MCP integration", info: true },
      { label: "Admin oversight" },
      { label: "Centralized lead management" },
      { label: "Priority account support" },
      { label: "On-demand additional licenses" },
      { label: "Team collaboration" },
      { label: "Dedicated onboarding support" },
    ],
    addons: [
      { label: "Consumer cellphone", info: true },
      { label: "Buyer Intent" },
      { label: "Purchase Signals" },
    ],
  },
  {
    id: "buy-list",
    category: "ONE-TIME PURCHASE",
    name: "Buy list",
    description: "Perfect for one-time outreach campaigns. No subscription required.",
    cta: "Search for leads →",
    monthly: {
      display: "Custom price",
      suffix: "",
      supportLines: ["Price will be calculated based on selected records."],
      benefit: "12 month free list access on export",
    },
    annual: {
      display: "Custom price",
      suffix: "",
      supportLines: ["Price will be calculated based on selected records."],
      benefit: "12 month free list access on export",
    },
    accessTitle: "",
    accessItems: [],
    includedTitle: "Included Features",
    includedItems: [
      { label: "Export available immediately" },
      { label: "30 Days full access to list prospecting functionalities." },
      { label: "12 Months access to re-export" },
      { label: "No recurring subscription" },
      { label: "One-time payment" },
    ],
    notIncludedTitle: "Not Included",
    notIncludedItems: [
      {
        label: "Subscription features",
        expandable: true,
        defaultExpanded: true,
        children: [
          { label: "Weekly data refresh" },
          { label: "Email and direct mail campaign" },
          { label: "MCP (credits required)", info: true },
          { label: "CRM integration" },
          { label: "Buyer intent" },
          { label: "Consumer cellphone" },
          { label: "Team collaboration" },
        ],
      },
    ],
  },
];

export type CellVal = true | false | string;

export interface CompareRow {
  label: string;
  info?: boolean;
  basic: CellVal;
  pro: CellVal;
  team: CellVal;
}

export const COMPARE_SECTIONS: { title: string; rows: CompareRow[] }[] = [
  {
    title: "Sales tools",
    rows: [
      { label: "User licenses", basic: "1", pro: "1", team: "includes 5" },
      { label: "Business & Consumer databases", basic: true, pro: true, team: true },
      { label: "Contact information", basic: true, pro: true, team: true },
      { label: "Weekly data refresh", basic: true, pro: true, team: true },
      { label: "Mobile app", basic: true, pro: true, team: true },
      { label: "Lead management", basic: true, pro: true, team: true },
      {
        label: "MCP Integration",
        info: true,
        basic: "unlock with credit purchase",
        pro: "uses credits",
        team: "uses credits",
      },
      {
        label: "CRM Integration",
        info: true,
        basic: "unlock with credit purchase",
        pro: "uses credits",
        team: "uses credits",
      },
      { label: "Territory management", basic: false, pro: false, team: true },
      {
        label: "Exports",
        basic: "unlock with credit purchase",
        pro: "uses credits",
        team: "uses credits",
      },
      { label: "Performance tracking", basic: false, pro: false, team: true },
    ],
  },
  {
    title: "Engagement tools",
    rows: [
      { label: "Customer profile analysis", basic: true, pro: true, team: true },
      {
        label: "Email addresses",
        basic: "unlock with credit purchase",
        pro: "uses credits",
        team: "uses credits",
      },
      {
        label: "Email marketing",
        info: true,
        basic: "unlock with credit purchase",
        pro: true,
        team: true,
      },
      { label: "Direct mail marketing", info: true, basic: true, pro: true, team: true },
    ],
  },
  {
    title: "Customer success",
    rows: [
      { label: "Training & support", basic: true, pro: true, team: true },
      { label: "Dedicated advisor", basic: true, pro: true, team: true },
    ],
  },
];

export const ADDON_ROWS = [
  {
    title: "Buyer Intent",
    description: "Intent signals based on businesses actively seeking your solutions.",
    detail: "Add to your plan for an additional $50/month for each user.",
  },
  {
    title: "Purchase Signals",
    description: "Intent signals based on households with purchases observed in transaction data.",
    detail: "Add to your plan for an additional $50/month for each user.",
  },
  {
    title: "Consumer cellphones",
    description: "",
    detail: "Talk to a rep to get more details.",
  },
];

export function planPriceLabel(planId: Exclude<PlanId, "buy-list">, billing: BillingPeriod): string {
  const plan = PLANS.find((p) => p.id === planId)!;
  const pricing = billing === "monthly" ? plan.monthly : plan.annual;
  return `$${pricing.display}${pricing.suffix}`;
}

/** Tooltip copy for feature / compare info icons (from design screenshots). */
export const FEATURE_TOOLTIPS: Record<string, string> = {
  "Direct mail campaigns":
    "Additional charge for postage, billed separately from credits, paid at time of send",
  "Direct mail marketing":
    "Additional charge for postage, billed separately from credits, paid at time of send",
  "CRM integration": "CRM integration allows you to export data directly to your CRM",
  "CRM Integration": "CRM integration allows you to export data directly to your CRM",
  "MCP (credits required)":
    "Access Salesgenie in Claude or ChatGPT through MCP. Setup is available; prospecting actions use credits.",
  "MCP integration":
    "Bring Salesgenie into Claude or ChatGPT with MCP so you can research and act on leads in your AI tools.",
  "MCP Integration":
    "Bring Salesgenie into Claude or ChatGPT with MCP so you can research and act on leads in your AI tools.",
  "Consumer cellphone":
    "Access mobile phone numbers associated with U.S consumers and households, where available and permitted",
  "Consumer cellphones":
    "Access mobile phone numbers associated with U.S consumers and households, where available and permitted",
  "Email marketing": "Requires email addresses unlocked using credits",
  "includes 5": "Contact us for multi-user discounts",
  "Includes 5": "Contact us for multi-user discounts",
  "unlock with credit purchase": "Each business or consumer record costs 1 credit",
  "uses credits:Exports": "Exporting each business or consumer record uses one credit",
  "uses credits:CRM Integration": "Exporting each business or consumer record uses one credit",
  "uses credits:MCP Integration": "Prospecting actions taken through MCP use credits",
  "uses credits:Email addresses": "Each email address uses one credit",
  "uses credits": "Exporting each business or consumer record uses one credit",
};

export function resolveTooltip(labelOrValue: string, rowLabel?: string): string | undefined {
  if (rowLabel && labelOrValue === "uses credits") {
    return FEATURE_TOOLTIPS[`uses credits:${rowLabel}`] ?? FEATURE_TOOLTIPS["uses credits"];
  }
  return FEATURE_TOOLTIPS[labelOrValue];
}

/** Subscription-only plans (excludes one-time Buy List). */
export const SUBSCRIPTION_PLANS = PLANS.filter((p) => p.id !== "buy-list");

export const BUY_LIST_PLAN = PLANS.find((p) => p.id === "buy-list")!;

/**
 * Compact commercial differentiators derived from existing plan data.
 * Used by Direction 2 / 3 presentation only — does not change commercial offering.
 */
export interface PackageSummary {
  access: string;
  /** Matches plan benefit / allowance copy for the billing period. */
  creditsLabel: (billing: BillingPeriod) => string;
  users: string;
  /** Short differentiators pulled from existing included features. */
  keyDifferentiators: string[];
}

export const PACKAGE_SUMMARIES: Record<Exclude<PlanId, "buy-list">, PackageSummary> = {
  basic: {
    access: "View only",
    creditsLabel: () => "No included credits",
    users: "1 user",
    keyDifferentiators: [
      "Weekly data refresh",
      "Customer profile analysis",
      "Dedicated advisor & expert guidance",
    ],
  },
  pro: {
    access: "View + Export",
    creditsLabel: (billing) =>
      billing === "monthly" ? "500 credits/month" : "6000 credits/yr (provided upfront)",
    users: "1 user",
    keyDifferentiators: [
      "Export leads (uses credits)",
      "Email unlocks (uses credits)",
      "Email Campaigns (uses credits)",
      "CRM integration",
    ],
  },
  team: {
    access: "View + Export",
    creditsLabel: (billing) =>
      billing === "monthly" ? "500 shared credits/month" : "6000 credits/yr (provided upfront)",
    users: "5 users included",
    keyDifferentiators: [
      "5 user licenses included",
      "Assign leads to team members",
      "Team performance reporting",
      "Admin oversight",
    ],
  },
};

/** Allowance row copy — same as existing plan benefit strings. */
export function planAllowance(planId: Exclude<PlanId, "buy-list">, billing: BillingPeriod): string {
  const plan = PLANS.find((p) => p.id === planId)!;
  return billing === "monthly" ? plan.monthly.benefit : plan.annual.benefit;
}
