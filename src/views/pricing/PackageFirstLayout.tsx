import { Fragment, useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCartShopping,
  faCoins,
  faPhone,
  faTag,
  faUser,
  faUserPlus,
  faUsers,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck, faEye } from "@fortawesome/free-regular-svg-icons";
import { faCircleCheck as faCircleCheckSolid } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { FeatureItem, GoalId, PlanId } from "../../data/pricingPlans";
import {
  BUY_LIST_PLAN,
  GOAL_CHIPS,
  PACKAGE_SUMMARIES,
  PLANS,
  SUBSCRIPTION_PLANS,
  resolveTooltip,
} from "../../data/pricingPlans";
import type { PricingLayoutProps } from "./pricingTypes";
import { CARD_SHADOW, GENIE_SHADOW_SM } from "./pricingTypes";
import SubscriptionComparison from "./SubscriptionComparison";
import type { PricingOption } from "./creditValue";
import type { GroupStyle } from "./creditValue";
import { PAYG_CREDIT_RATE, creditValue, groupsPlans, hidesGoalPicker, isValueLed, fmtMoney, fmtNumber, fmtRate } from "./creditValue";

export interface PackageFirstLayoutProps extends PricingLayoutProps {
  goal: GoalId | null;
  onSelectGoal: (id: GoalId) => void;
  onBack: () => void;
  onBillingChange: (billing: PricingLayoutProps["billing"]) => void;
  /** Prototype option being reviewed — "current" renders the shipped layout. */
  option: PricingOption;
  /** B3 local exploration — how plan groups and selection are shown. */
  groupStyle?: GroupStyle;
  onTalkToSales: () => void;
  /** "Can't decide? Let's talk" bar — a general call request, not the seats ask. */
  onRequestCall?: () => void;
  /** Sales request already sent (inline confirmation mode) — links/buttons show "Request sent". */
  salesRequested?: boolean;
}

/** Shared light gray header surface — same shade on every package card. */
const HEADER_SURFACE: Record<PlanId, string> = {
  basic: "bg-[#F9FAFB]",
  pro: "bg-[#F9FAFB]",
  team: "bg-[#F9FAFB]",
  "buy-list": "bg-[#F9FAFB]",
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="size-3.5 shrink-0" aria-hidden>
      <circle cx="7" cy="7" r="7" fill="#0BA38C" />
      <path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="size-3.5 shrink-0" aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke="#C55418" strokeWidth="1.3" />
      <path d="M4.75 4.75l4.5 4.5M9.25 4.75l-4.5 4.5" stroke="#C55418" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** Available with credits — a filled brand-blue coin (not a cross: the feature isn't blocked). */
function CreditIcon() {
  return (
    <span
      title="Available with credits"
      className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-[#008DC3] text-white"
    >
      <FontAwesomeIcon icon={faCoins} className="text-[7px]" aria-hidden />
    </span>
  );
}

/** Asterisk on features that use credits — explained once in the note under the list. */
function CreditMark() {
  return (
    <span className="ml-0.5 font-semibold text-[#008DC3]" aria-label="uses credits">
      *
    </span>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="size-3.5 shrink-0 text-[#0BA38C]" aria-hidden>
      <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 14 14"
      className={`size-3.5 shrink-0 text-[#475467] transition-transform ${expanded ? "rotate-180" : ""}`}
      fill="none"
      aria-hidden
    >
      <path d="M3.5 5.5L7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="size-3.5 shrink-0 text-[#98A2B3]" aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 6.5v3M7 4.5h.01" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function InfoTip({ text }: { text: string }) {
  return (
    <span className="relative inline-flex shrink-0 group/tip">
      <button
        type="button"
        className="inline-flex rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008DC3]/40"
        aria-label="More information"
        onClick={(e) => e.stopPropagation()}
      >
        <InfoIcon />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-[60] w-max max-w-[220px] -translate-x-1/2 rounded-md bg-[#1D2939] px-3 py-2 text-center text-xs font-normal leading-[18px] text-white hidden shadow-lg group-hover/tip:block group-focus-within/tip:block"
      >
        {text}
      </span>
    </span>
  );
}

function AddonChip() {
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded px-2 text-xs font-medium leading-[18px] text-[#F6F8FC] bg-[#764FD9]">
      Add-on
    </span>
  );
}

/** Same expandable checklist rows as Option 1 / Direction 4. */
function FeatureRows({
  planId,
  section,
  items,
  Icon,
  expanded,
  onToggle,
}: {
  planId: PlanId;
  section: "inc" | "exc";
  items: FeatureItem[];
  Icon: typeof CheckIcon;
  expanded: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  return (
    <>
      {items.map((item) => {
        const key = `${planId}:${section}:${item.label}`;
        const isOpen = Boolean(expanded[key]);
        const isExpandable = Boolean(item.expandable && item.children?.length);
        const tip = item.info ? resolveTooltip(item.label) : undefined;
        const RowIcon = item.credit ? CreditIcon : Icon;
        return (
          <div key={item.label} className="flex flex-col gap-2">
            {isExpandable ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(key);
                }}
                className="flex w-full items-start gap-2 text-left cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="pt-0.5"><RowIcon /></div>
                <span className={`text-sm leading-5 text-[#475467] flex-1 ${item.bold ? "font-semibold" : "font-normal"}`}>
                  {item.label}
                  {item.usesCredits && <CreditMark />}
                </span>
                {tip ? <InfoTip text={tip} /> : item.info ? <InfoIcon /> : null}
                <ChevronIcon expanded={isOpen} />
              </button>
            ) : (
              <div className="flex items-start gap-2">
                <div className="pt-0.5"><RowIcon /></div>
                <span className={`text-sm leading-5 text-[#475467] flex-1 ${item.bold ? "font-semibold" : "font-normal"}`}>
                  {item.label}
                  {item.usesCredits && <CreditMark />}
                </span>
                {tip ? <InfoTip text={tip} /> : item.info ? <InfoIcon /> : null}
              </div>
            )}
            {isExpandable && isOpen && item.children?.map((child) => (
              <div key={child.label} className="flex items-start gap-2 pl-6">
                <div className="pt-0.5"><Icon /></div>
                <span className="text-sm font-normal leading-5 text-[#475467] flex-1">
                  {child.label}
                  {child.usesCredits && <CreditMark />}
                </span>
                {child.info && resolveTooltip(child.label) ? (
                  <InfoTip text={resolveTooltip(child.label)!} />
                ) : null}
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}

/** One-line explanation for the asterisked features (B3). */
function CreditsFootnote({ plan }: { plan: (typeof PLANS)[number] }) {
  const rows = [...plan.includedItems, ...(plan.notIncludedItems ?? [])];
  const marked = rows.some((r) => r.usesCredits || r.children?.some((c) => c.usesCredits));
  if (!marked) return null;
  const basic = plan.id === "basic";
  return (
    <p className="mt-1 text-xs leading-[18px] text-[#667085]">
      <span className="font-semibold text-[#008DC3]">*</span>{" "}
      {basic
        ? "Available on Basic: you'll need credits to use these (buy as you go at $0.15 each)."
        : "Uses your plan's credits. Need more? Add credits anytime at $0.15 each."}
    </p>
  );
}

function PlanFeatureChecklist({
  plan,
  expanded,
  onToggle,
  compact = false,
}: {
  plan: (typeof PLANS)[number];
  expanded: Record<string, boolean>;
  onToggle: (key: string) => void;
  /** Option B3 — tighter section and row spacing (type stays Body 14/20). */
  compact?: boolean;
}) {
  const sectionGap = compact ? "gap-2" : "gap-3";
  // B3 review copy: Team's access header and Buy list without the MCP row (one-time lists can use MCP via freemium).
  const accessTitle = compact && plan.id === "team" ? "View + Export access to:" : plan.accessTitle;
  const notIncludedItems =
    compact && plan.id === "buy-list"
      ? plan.notIncludedItems?.map((item) =>
          item.children ? { ...item, children: item.children.filter((c) => c.label !== "MCP (uses credits)") } : item,
        )
      : plan.notIncludedItems;
  return (
    <div className={`flex h-full min-h-0 flex-col ${compact ? "gap-5" : "gap-6"}`}>
      {plan.accessItems.length > 0 && (
        <div className={`flex flex-col ${sectionGap}`}>
          <p className="text-sm font-semibold leading-5 text-[#667085]">{accessTitle}</p>
          {plan.accessItems.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <div className="pt-0.5"><CheckIcon /></div>
              <span className="text-sm font-normal leading-5 text-[#475467]">{item}</span>
            </div>
          ))}
        </div>
      )}
      <div className={`flex flex-col ${sectionGap}`}>
        <p className="text-sm font-semibold leading-5 text-[#667085]">{compact ? "Features" : plan.includedTitle}</p>
        <FeatureRows
          planId={plan.id}
          section="inc"
          items={plan.includedItems}
          Icon={CheckIcon}
          expanded={expanded}
          onToggle={onToggle}
        />
        {/* B3: excluded items continue the same list (no separate "Not included" header). */}
        {compact && notIncludedItems && notIncludedItems.length > 0 && (
          <FeatureRows
            planId={plan.id}
            section="exc"
            items={notIncludedItems}
            Icon={XIcon}
            expanded={expanded}
            onToggle={onToggle}
          />
        )}
        {compact && <CreditsFootnote plan={plan} />}
      </div>
      {!compact && plan.notIncludedItems && plan.notIncludedItems.length > 0 && (
        <div className={`flex flex-col ${sectionGap}`}>
          <p className="text-sm font-semibold leading-5 text-[#667085]">{plan.notIncludedTitle}</p>
          <FeatureRows
            planId={plan.id}
            section="exc"
            items={plan.notIncludedItems}
            Icon={XIcon}
            expanded={expanded}
            onToggle={onToggle}
          />
        </div>
      )}
      {plan.addons && (
        <div className={`mt-auto flex flex-col ${sectionGap} pt-2 border-t border-[#EAECF0]`}>
          <p className="text-sm font-semibold leading-5 text-[#667085]">Additional paid features</p>
          {plan.addons.map((addon) => (
            <div key={addon.label} className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <PlusIcon />
                <span className="text-sm font-normal leading-5 text-[#475467]">{addon.label}</span>
                {addon.info && resolveTooltip(addon.label) ? (
                  <InfoTip text={resolveTooltip(addon.label)!} />
                ) : null}
              </div>
              <AddonChip />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanBadge({ label }: { label: "MOST POPULAR" | "RECOMMENDED" }) {
  return (
    <span className="pointer-events-none absolute left-6 top-0 z-[2] -translate-y-1/2 inline-flex h-6 items-center rounded px-2 text-xs font-medium leading-[18px] uppercase tracking-wide bg-[#00729F] text-white whitespace-nowrap">
      {label}
    </span>
  );
}

function GoalIcon({ id, selected }: { id: GoalId; selected: boolean }) {
  const stroke = selected ? "#008DC3" : "#667085";
  if (id === "view") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className="size-3.5 shrink-0" aria-hidden>
        <path d="M1.5 8s2.5-4 6.5-4 6.5 4 6.5 4-2.5 4-6.5 4-6.5-4-6.5-4z" stroke={stroke} strokeWidth="1.3" />
        <circle cx="8" cy="8" r="1.8" stroke={stroke} strokeWidth="1.3" />
      </svg>
    );
  }
  if (id === "export") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className="size-3.5 shrink-0" aria-hidden>
        <rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke={stroke} strokeWidth="1.3" />
        <path d="M2.5 4.5L8 8.5l5.5-4" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (id === "team") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className="size-3.5 shrink-0" aria-hidden>
        <circle cx="6" cy="5.5" r="2.2" stroke={stroke} strokeWidth="1.3" />
        <path d="M2 13c0-2 1.8-3.4 4-3.4s4 1.4 4 3.4" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="11.5" cy="6" r="1.7" stroke={stroke} strokeWidth="1.3" />
        <path d="M14 13c0-1.4-1.1-2.5-2.7-2.7" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-3.5 shrink-0" aria-hidden>
      <circle cx="8" cy="8" r="5.5" stroke={stroke} strokeWidth="1.3" />
      <path d="M8 5v6M6.2 6.2h2.4a1.4 1.4 0 010 2.8H6.8a1.4 1.4 0 000 2.8H10" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

const FACT_ICONS = { Access: faEye, Credits: faCoins, Users: faUsers, Purchase: faCartShopping, Price: faTag };

function FactIcon({ label }: { label: string }) {
  const icon = FACT_ICONS[label as keyof typeof FACT_ICONS] ?? faCircleCheck;
  return (
    <span className="flex h-3.5 w-[18px] shrink-0 items-center justify-center text-[#008DC3]" aria-hidden>
      <FontAwesomeIcon icon={icon} className="text-[14px]" />
    </span>
  );
}

/** Plan facts — height fits content (one- and two-line values keep the same 10px padding). */
function PlanFacts({
  items,
}: {
  items: { label: string; value: ReactNode; emphasize?: boolean }[];
}) {
  return (
    <div className="box-border flex flex-col gap-2 rounded-lg bg-[#F0F9FF] border border-[#D6EAF5] px-3 py-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 items-center gap-1.5">
          <FactIcon label={item.label} />
          <p className="min-w-0 flex-1 text-xs leading-[18px] break-words">
            <span className="font-semibold uppercase text-[#667085]">{item.label}:</span>{" "}
            <span className={item.emphasize ? "font-semibold text-[#1D2939]" : "font-medium text-[#344054]"}>
              {item.value}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

/** Inline "Talk to sales" trigger inside a plan card — never selects the card. */
function TalkToSalesLink({ label, onClick, sent = false }: { label: string; onClick: () => void; sent?: boolean }) {
  if (sent) {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-[#067647]">
        <FontAwesomeIcon icon={faCircleCheckSolid} className="text-[12px]" aria-hidden />
        Request sent, we&apos;ll reach out soon
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 font-semibold text-[#008DC3] hover:text-[#00729F] hover:underline"
    >
      {label}
    </button>
  );
}

/** Option B — credit value chip under the price (same weight as the Save 17% chip). */
function CreditChip({ children }: { children: ReactNode }) {
  return (
    <span className="mt-2 inline-flex min-h-7 w-fit items-center gap-1.5 rounded bg-[#F2F9F7] px-2 py-1 text-sm font-medium leading-5 text-[#026B5C]">
      <FontAwesomeIcon icon={faCoins} className="text-[12px]" aria-hidden />
      <span>{children}</span>
    </span>
  );
}

/** Option B (Pro) — "pay $500 more, get $900 of credits" equation. */
function CreditEquation({ billing }: { billing: PricingLayoutProps["billing"] }) {
  const v = creditValue(billing);
  const per = billing === "annual" ? "" : "/mo";
  return (
    <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#CDE9E0] bg-[#F2F9F7] px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase leading-[18px] text-[#667085]">You pay</p>
        <p className="text-xl font-semibold leading-[30px] text-[#1D2939]">
          +{fmtMoney(v.difference)}
          <span className="text-sm font-medium">{per}</span>
        </p>
        <p className="text-xs leading-[18px] text-[#475467]">more than Basic</p>
      </div>
      <span className="shrink-0 text-[#026B5C]" aria-hidden>
        <FontAwesomeIcon icon={faArrowRight} className="text-[14px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase leading-[18px] text-[#667085]">You get</p>
        <p className="text-xl font-semibold leading-[30px] text-[#026B5C]">
          {fmtMoney(v.includedValue)}
          <span className="text-sm font-medium">{per}</span>
        </p>
        <p className="text-xs leading-[18px] text-[#475467]">in credits ({fmtNumber(v.included)})</p>
      </div>
    </div>
  );
}

/** Option B (Basic) — what the same credits cost pay-as-you-go. */
function PaygCreditNote({ billing }: { billing: PricingLayoutProps["billing"] }) {
  const v = creditValue(billing);
  const per = billing === "annual" ? "" : "/mo";
  return (
    <div className="mt-4 rounded-lg border border-[#EAECF0] bg-[#F9FAFB] px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-5 text-[#344054]">
          Need {fmtNumber(v.included)} credits{billing === "annual" ? "" : " a month"}?
        </p>
        <p className="shrink-0 text-sm font-semibold leading-5 text-[#1D2939]">
          +{fmtMoney(v.includedValue)}
          {per}
        </p>
      </div>
      <p className="mt-0.5 text-xs leading-[18px] text-[#475467]">
        Pay as you go at {fmtRate(PAYG_CREDIT_RATE)}/credit. Pro includes them for {fmtMoney(v.difference)}
        {per} more.
      </p>
    </div>
  );
}

/** Option B (Team) — inline alert routing extra seats to sales. */
function SeatsInlineAlert({ onTalkToSales }: { onTalkToSales: () => void }) {
  return (
    <div role="note" className="mt-4 flex items-start gap-2.5 rounded-lg border border-[#B9E6FE] bg-[#F0F9FF] px-3 py-2.5">
      <span className="shrink-0 pt-0.5 text-[#008DC3]" aria-hidden>
        <FontAwesomeIcon icon={faUserPlus} className="text-[14px]" />
      </span>
      <div className="min-w-0 text-xs leading-[18px]">
        <p className="text-sm font-semibold leading-5 text-[#1D2939]">Need more than 5 seats?</p>
        <p className="text-[#475467]">We&apos;ll set up custom seats for your team.</p>
        <p className="mt-1">
          <TalkToSalesLink label="Talk to sales →" onClick={onTalkToSales} />
        </p>
      </div>
    </div>
  );
}

/**
 * Option B3 — plan groups. At xl the grid gains a label row and spacer tracks
 * (cols 3 and 5) so each group can sit on its own panel; rows stay subgrid-aligned.
 */
const GROUPED_GRID_COLS =
  "xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_12px_minmax(0,1fr)_12px_minmax(0,1fr)]";

const GROUPED_CARD_PLACEMENT: Record<PlanId, string> = {
  basic: "xl:[grid-column:1] xl:[grid-row:2/span_4]",
  pro: "xl:[grid-column:2] xl:[grid-row:2/span_4]",
  team: "xl:[grid-column:4] xl:[grid-row:2/span_4]",
  "buy-list": "xl:[grid-column:6] xl:[grid-row:2/span_4]",
};

const PLAN_GROUPS = [
  {
    id: "individual",
    short: "Individual",
    headerTint: "bg-[#F5FAFF]",
    label: "Individual plans · 1 user",
    title: "Individual plans",
    sub: "1 user",
    icon: faUser,
    first: "basic",
    plans: ["basic", "pro"],
    defaultPlan: "pro",
    column: "xl:[grid-column:1/span_2]",
    panel: "bg-[#E4E7EC] border-[#D0D5DD]",
    text: "text-[#475467]",
    glow: "rgba(0,141,195,0.42)",
    wash: "bg-gradient-to-b from-[#E0F2FE] to-[#F9FAFB]",
    accent: { tintHex: "#F0F9FF", solid: "#008DC3", tint: "bg-[#F0F9FF] border-[#B9E6FE]", chip: "bg-[#F0F9FF] text-[#00729F]", chipOn: "bg-[#008DC3] text-white", ring: "ring-[#008DC3]" },
  },
  {
    id: "team",
    short: "Team",
    headerTint: "bg-[#F8F7FF]",
    label: "Team plan · 5 users or more",
    title: "Team plan",
    sub: "5 users or more",
    icon: faUsers,
    first: "team",
    plans: ["team"],
    defaultPlan: "team",
    column: "xl:[grid-column:4/span_1]",
    panel: "bg-[#E4E7EC] border-[#D0D5DD]",
    text: "text-[#475467]",
    glow: "rgba(118,79,217,0.38)",
    wash: "bg-gradient-to-b from-[#F2EFFF] to-[#F9FAFB]",
    accent: { tintHex: "#F8F7FF", solid: "#764FD9", tint: "bg-[#F8F7FF] border-[#E3DFFE]", chip: "bg-[#F2EFFF] text-[#6846C3]", chipOn: "bg-[#764FD9] text-white", ring: "ring-[#764FD9]" },
  },
  {
    id: "one-time",
    short: "One-time",
    headerTint: "bg-[#F6F8FC]",
    label: "One-time purchase",
    title: "One-time purchase",
    sub: "No subscription",
    icon: faCartShopping,
    first: "buy-list",
    plans: ["buy-list"],
    defaultPlan: "buy-list",
    column: "xl:[grid-column:6/span_1]",
    panel: "bg-[#E4E7EC] border-[#D0D5DD]",
    text: "text-[#475467]",
    glow: "rgba(101,114,180,0.35)",
    wash: "bg-gradient-to-b from-[#EEF0F9] to-[#F9FAFB]",
    accent: { tintHex: "#F6F8FC", solid: "#6572B4", tint: "bg-[#F6F8FC] border-[#DEE2F1]", chip: "bg-[#EEF0F9] text-[#4E5BA6]", chipOn: "bg-[#6572B4] text-white", ring: "ring-[#6572B4]" },
  },
] as const;

type PlanGroup = (typeof PLAN_GROUPS)[number];

const groupOf = (planId: PlanId) => PLAN_GROUPS.find((g) => (g.plans as readonly PlanId[]).includes(planId))!;

/** Decorative panel behind a group of cards (desktop only — stacked layouts use the label alone). */
function GroupPanel({ group, groupStyle, active }: { group: PlanGroup; groupStyle: GroupStyle; active: boolean }) {
  if (groupStyle === "tabs") return null;
  const look =
    groupStyle === "tabsBorder" || groupStyle === "sections"
      ? // Quiet grouping: the selected plan card carries the emphasis, not the section.
        active
        ? "border border-[#D6EAF5] bg-[#F7FBFE]"
        : "border border-[#EAECF0] bg-[#FAFAFB]"
      : groupStyle === "tracks"
      ? `border ${group.accent.tint} ${active ? `ring-2 ${group.accent.ring} shadow-[0_16px_32px_-16px_rgba(16,24,40,0.35)]` : "opacity-70"}`
      : groupStyle === "spotlight"
        ? active
          ? "spotlight-ring"
          : "border border-[#EAECF0] bg-[#F9FAFB] opacity-80"
        : `border ${group.panel}`;
  return (
    <div
      aria-hidden
      className={`hidden xl:block -m-3 rounded-2xl transition-[background-color,border-color,box-shadow,opacity] duration-300 ${look} ${group.column} xl:[grid-row:1/span_5]`}
    />
  );
}

function GroupLabel({ group, groupStyle, active }: { group: PlanGroup; groupStyle: GroupStyle; active: boolean }) {
  if (groupStyle === "tabs" || groupStyle === "tabsBorder") return null;
  if (groupStyle === "tracks") {
    return (
      <p className={`relative col-span-full flex items-center ${group.column} xl:[grid-row:1]`}>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold leading-5 transition-colors duration-300 ${
            active ? group.accent.chipOn : group.accent.chip
          }`}
        >
          <FontAwesomeIcon icon={group.icon} className="text-[14px]" aria-hidden />
          {group.title}
          <span className="font-medium opacity-80">· {group.sub}</span>
        </span>
      </p>
    );
  }
  const tone = (groupStyle === "spotlight" || groupStyle === "sections") && active ? "text-[#008DC3]" : group.text;
  return (
    <p
      className={`relative col-span-full flex items-center gap-2 text-sm font-semibold leading-5 transition-colors duration-300 ${tone} ${group.column} xl:[grid-row:1]`}
    >
      <FontAwesomeIcon icon={group.icon} className="text-[14px]" aria-hidden />
      {group.label}
      {groupStyle === "spotlight" && active && (
        <span className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-[#F0F9FF] px-2 text-xs font-medium leading-5 text-[#00729F] animate-fade-in">
          <span className="size-1.5 rounded-full bg-[#008DC3] animate-pulse" />
          Selected
        </span>
      )}
    </p>
  );
}

/** In-card tags — the group marker lives inside each card (no sections around cards). */
function GroupTag({ group }: { group: PlanGroup }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 text-xs font-semibold leading-5 ${group.accent.chip}`}>
      <FontAwesomeIcon icon={group.icon} className="text-[12px]" aria-hidden />
      {group.short}
    </span>
  );
}

/** Tier icon tile (Sweden / Bravio style) — tinted per group, or neutral for the tray look. */
function IconTile({ group, neutral }: { group: PlanGroup; neutral?: boolean }) {
  return (
    <span
      aria-hidden
      className={`mb-2 flex size-9 items-center justify-center rounded-lg ${neutral ? "border border-[#EAECF0] bg-white text-[#344054]" : ""}`}
      style={neutral ? undefined : { backgroundColor: group.accent.tintHex, color: group.accent.solid }}
    >
      <FontAwesomeIcon icon={group.icon} className="text-[16px]" />
    </span>
  );
}

/** Audience switch — companion card beside Team / Buy list so the row never feels empty. */
function CompanionCard({
  kind,
  onTalkToSales,
  onSeeIndividual,
}: {
  kind: "team" | "one-time";
  onTalkToSales: () => void;
  onSeeIndividual: () => void;
}) {
  const team = kind === "team";
  const points = team
    ? ["Custom seat counts", "Volume pricing for larger teams", "Dedicated onboarding"]
    : ["Unlimited lead viewing", "Credits for exports and email unlocks", "Weekly data refresh"];
  return (
    <div
      data-keep-selection
      className="animate-plan-rise flex flex-col gap-4 self-start rounded-xl border border-dashed border-[#D0D5DD] bg-[#F9FAFB] p-6 xl:row-span-4"
      style={{ animationDelay: "90ms" }}
    >
      <span
        aria-hidden
        className="flex size-9 items-center justify-center rounded-lg bg-white text-[#008DC3]"
        style={{ boxShadow: GENIE_SHADOW_SM }}
      >
        <FontAwesomeIcon icon={team ? faUserPlus : faWandMagicSparkles} className="text-[16px]" />
      </span>
      <div>
        <p className="text-xl font-semibold leading-[30px] text-[#1D2939]">
          {team ? "Need more than 5 seats?" : "Prefer ongoing access?"}
        </p>
        <p className="mt-1 text-sm leading-5 text-[#475467]">
          {team
            ? "Teams of 6+ get custom seat counts and volume pricing."
            : "Subscriptions include unlimited viewing, and Pro adds 6,000 credits upfront."}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {points.map((point) => (
          <li key={point} className="flex items-center gap-2 text-sm leading-5 text-[#475467]">
            <CheckIcon />
            {point}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={team ? onTalkToSales : onSeeIndividual}
        className="h-10 w-full rounded-lg border border-[#008DC3] bg-white text-sm font-medium text-[#008DC3] hover:bg-[#F0F9FF]"
      >
        {team ? "Talk to sales" : "See individual plans →"}
      </button>
    </div>
  );
}

/** Sales line shown under "Request a call" (same number as the comparison footer). */
const SALES_PHONE = "877.708.3844";

/** Tray (Bravio style) — "Can't decide? Let's talk" bar inside the tray. */
function TalkBar({ onTalkToSales, sent = false }: { onTalkToSales: () => void; sent?: boolean }) {
  return (
    <div
      data-keep-selection
      className="col-span-full flex flex-col gap-4 rounded-2xl bg-[#00729F] px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-xl font-semibold leading-[30px]">Can&apos;t decide? Let&apos;s talk.</p>
        <p className="text-sm leading-5 text-[#E0F2FE]">
          Tell us what you&apos;re prospecting for and we&apos;ll recommend a plan, or set up custom seats for your team.
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-center">
        <button
          type="button"
          onClick={onTalkToSales}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#00729F] hover:bg-[#F0F9FF]"
        >
          <FontAwesomeIcon icon={sent ? faCircleCheckSolid : faPhone} className="text-[14px]" aria-hidden />
          {sent ? "Request sent" : "Request a call"}
        </button>
        <a href={`tel:${SALES_PHONE.replace(/\./g, "")}`} className="text-xs leading-[18px] text-[#E0F2FE] hover:text-white hover:underline">
          or call us at <span className="font-semibold text-white">{SALES_PHONE}</span>
        </a>
      </div>
    </div>
  );
}

/** Focus tabs — segmented control with a sliding pill; picking a group selects its default plan. */
function GroupTabs({ activeId, onSelect }: { activeId: string; onSelect: (planId: PlanId) => void }) {
  const index = Math.max(0, PLAN_GROUPS.findIndex((g) => g.id === activeId));
  return (
    <div data-keep-selection className="flex justify-center pt-6">
      <div role="tablist" aria-label="Plan type" className="relative grid w-full max-w-[760px] grid-cols-3 rounded-xl bg-[#F2F4F7] p-1">
        <span
          aria-hidden
          className="absolute bottom-1 left-1 top-1 rounded-lg bg-white transition-transform duration-300 ease-out"
          style={{ width: "calc((100% - 8px) / 3)", transform: `translateX(${index * 100}%)`, boxShadow: GENIE_SHADOW_SM }}
        />
        {PLAN_GROUPS.map((g) => {
          const on = g.id === activeId;
          return (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onSelect(g.defaultPlan)}
              className="relative z-[1] flex flex-col items-center rounded-lg px-3 py-2 text-center"
            >
              <span
                className={`flex items-center gap-2 text-sm font-semibold leading-5 transition-colors duration-300 ${
                  on ? "text-[#1D2939]" : "text-[#667085]"
                }`}
              >
                <FontAwesomeIcon
                  icon={g.icon}
                  className="text-[14px] transition-colors duration-300"
                  style={{ color: on ? g.accent.solid : undefined }}
                  aria-hidden
                />
                {g.title}
              </span>
              <span className="text-xs leading-[18px] text-[#667085]">{g.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Option B3 — diagonal "Save 17%" corner ribbon (annual billing). */
function SaveRibbon() {
  return (
    <div aria-hidden className="pointer-events-none absolute right-0 top-0 z-[2] size-24 overflow-hidden rounded-tr-xl">
      <span className="absolute right-[-40px] top-[22px] w-[160px] rotate-45 bg-[#0D7867] py-1 text-center text-xs font-semibold uppercase leading-[18px] tracking-wide text-white shadow-sm">
        Save 17%
      </span>
    </div>
  );
}

/** Option B3 — headline + indented pointers (credits/value summary under the price). */
function CreditSummary({
  icon,
  title,
  points,
}: {
  icon: IconDefinition;
  title: string;
  points: ReactNode[];
}) {
  return (
    <div className="mt-4 rounded-lg border border-[#EAECF0] bg-[#F9FAFB] px-3 py-3">
      <p className="flex items-center gap-2 text-sm font-semibold leading-5 text-[#1D2939]">
        <span className="flex size-5 shrink-0 items-center justify-center text-[#008DC3]" aria-hidden>
          <FontAwesomeIcon icon={icon} className="text-[14px]" />
        </span>
        {title}
      </p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-xs leading-[18px] text-[#475467]">
            <span className="flex h-[18px] w-5 shrink-0 items-center justify-center" aria-hidden>
              <span className="size-1.5 rounded-full bg-[#008DC3]" />
            </span>
            <span className="min-w-0">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Option B3 — "$990/yr ~~$1,188~~", one-sentence billing note, credit summary. */
function PlanPriceV3({
  planId,
  pricing,
  billing,
  onTalkToSales,
  salesRequested = false,
}: {
  planId: Exclude<PlanId, "buy-list">;
  pricing: { display: string; strikePrice?: string };
  billing: PricingLayoutProps["billing"];
  onTalkToSales: () => void;
  salesRequested?: boolean;
}) {
  const v = creditValue(billing);
  const annual = billing === "annual";
  const per = annual ? "/yr" : "/mo";
  const billingNote = annual
    ? "Billed annually, at only 10 months’ cost when paid upfront."
    : planId === "team"
      ? "5 seats, billed monthly on an annual contract."
      : "Per seat, billed monthly on an annual contract.";
  const credits = `${fmtNumber(v.included + v.bonus)} credits${annual ? "/yr" : "/mo"}`;

  const summary =
    planId === "basic"
      ? {
          icon: faCoins,
          title: "No credits included",
          points: [
            `Buy credits as you go, at ${fmtRate(PAYG_CREDIT_RATE)} each`,
            "Credits power exports, email unlocks, campaigns, MCP and CRM integrations.",
          ],
        }
      : {
          icon: faUsers,
            // Credits are tied to seats today (100/user/month), so say "across 5 users", not "shared".
            title: `${credits} across 5 users`,
            points: [
              "Credits power exports, email unlocks, campaigns, MCP and CRM integrations.",
              <>
                Need more seats?{" "}
                <TalkToSalesLink label="Talk to sales →" onClick={onTalkToSales} sent={salesRequested} />
              </>,
            ],
          };

  return (
    <div className="flex flex-col">
      <p className="text-xs font-medium leading-[18px] text-[#667085]">Starting at</p>
      <div className="flex flex-wrap items-end gap-x-2 font-semibold text-[#1D2939]">
        <p className="inline-flex items-start tracking-[-0.72px]">
          <span className="text-xl leading-[30px] mt-1">$</span>
          <span className="text-[36px] leading-[44px]">{pricing.display}</span>
          <span className="text-base leading-6 mt-3.5">{per}</span>
        </p>
        {annual && pricing.strikePrice && (
          <span className="mb-1.5 text-lg font-medium leading-7 text-[#98A2B3] line-through">
            ${pricing.strikePrice}
          </span>
        )}
      </div>
      {annual && pricing.strikePrice ? (
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs leading-[18px]">
          <FontAwesomeIcon icon={faCircleCheckSolid} className="text-[14px] text-[#0BA38C]" aria-hidden />
          <span className="font-semibold text-[#0D7867]">
            Save {fmtMoney(Number(pricing.strikePrice.replace(/,/g, "")) - Number(pricing.display.replace(/,/g, "")))}/year
          </span>
          <span className="text-[#98A2B3]" aria-hidden>·</span>
          <span className="text-[#475467]">Pay for 10 months, get 12</span>
        </p>
      ) : (
        <p className="mt-1 text-xs leading-[18px] text-[#475467]">{billingNote}</p>
      )}
      {planId === "pro" ? <ProCreditSummary billing={billing} /> : <CreditSummary {...summary} />}
    </div>
  );
}

/** Option B3 (Pro) — credits headline (incl. annual bonus) with a Save chip, and what credits power. */
function ProCreditSummary({ billing }: { billing: PricingLayoutProps["billing"] }) {
  const v = creditValue(billing);
  const annual = billing === "annual";
  const total = v.included + v.bonus;
  const saving = total * PAYG_CREDIT_RATE - v.difference;
  return (
    <div className="mt-4 flex flex-col gap-2 rounded-lg border border-[#EAECF0] bg-[#F9FAFB] px-3 py-3">
      <div className="flex items-start gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#008DC3]" aria-hidden>
          <FontAwesomeIcon icon={faCoins} className="text-[14px]" />
        </span>
        <p className="min-w-0 flex-1 text-sm font-semibold leading-5 text-[#1D2939]">
          {fmtNumber(total)} credits{annual ? "/yr" : "/mo"}
          {annual && v.bonus > 0 && (
            <span className="block text-xs font-medium leading-[18px] text-[#667085]">
              (incl. {fmtNumber(v.bonus)} annual bonus)
            </span>
          )}
        </p>
        <span className="shrink-0 rounded-md bg-[#0D7867] px-1.5 text-xs font-semibold leading-5 text-white">
          {annual ? `Save extra ${fmtMoney(saving)}` : `Save ${fmtMoney(saving)}/mo`}
        </span>
      </div>
      <div className="flex items-start gap-2 text-xs leading-[18px] text-[#475467]">
        <span className="flex h-[18px] w-5 shrink-0 items-center justify-center" aria-hidden>
          <span className="size-1.5 rounded-full bg-[#008DC3]" />
        </span>
        <p className="min-w-0">Credits power exports, email unlocks, campaigns, MCP and CRM integrations.</p>
      </div>
    </div>
  );
}

/**
 * Direction 2 — Package First:
 * Header panel (context + billing + annual offer) → Best Fit → four package cards.
 */
export function PackageFirstLayout(props: PackageFirstLayoutProps) {
  const {
    billing,
    goal,
    selectedPlan,
    badgePlanId,
    activeBadgeLabel,
    buyListPriceDisplay,
    buyListSupportLines,
    buyListCta,
    onSelectGoal,
    onSelectCard,
    onCta,
    onSelectPlan,
    onBack,
    onBillingChange,
    option,
    onTalkToSales,
    onRequestCall = onTalkToSales,
    salesRequested = false,
    groupStyle = "panels",
  } = props;

  const value = creditValue(billing);
  const grouped = groupsPlans(option);
  const compact = option === "b3";
  const activeGroup = groupOf(selectedPlan);
  /** Exploration styles add lift/fade motion on selection; "panels" keeps the shipped look. */
  const animated = grouped && groupStyle !== "panels";
  /** Group sections (label row, panels, spacer tracks); "inline" keeps a plain 4-up row. */
  const sectioned = grouped && ["panels", "tracks", "tabs", "spotlight", "tabsBorder", "sections"].includes(groupStyle);
  const inCardTags = grouped && groupStyle === "inline";
  const glowMode = grouped && (groupStyle === "glow" || groupStyle === "tabsGlow");
  /** Focus tabs · Border / Glow — selected card pops up and grows with a springy ease. */
  const popMode = grouped && (groupStyle === "tabsBorder" || groupStyle === "tabsGlow");
  const borderSelected = (planId: PlanId, isSelected: boolean) =>
    (groupStyle === "tabsBorder" || groupStyle === "sections") && isSelected
      ? { borderColor: groupOf(planId).accent.solid }
      : {};
  const switchMode = grouped && groupStyle === "switch";
  const trayMode = grouped && groupStyle === "tray";
  const iconTiles = glowMode || switchMode || trayMode;
  /** Audience switch shows only the active group's plans. */
  const shows = (planId: PlanId) => !switchMode || groupOf(planId).id === activeGroup.id;
  const riseDelay = (planId: PlanId) =>
    switchMode ? { animationDelay: `${groupOf(planId).plans.indexOf(planId as never) * 90}ms` } : {};
  const headerSurface = (planId: PlanId, isSelected: boolean) =>
    glowMode && isSelected
      ? groupOf(planId).wash
      : inCardTags
        ? groupOf(planId).headerTint
        : HEADER_SURFACE[planId];
  const categoryRow = (planId: PlanId, category: string) => (
    <>
      {iconTiles && <IconTile group={groupOf(planId)} neutral={trayMode} />}
      {/* Group label sits on its own line, clear of the Save 17% ribbon. */}
      {inCardTags && (
        <div className="mb-1">
          <GroupTag group={groupOf(planId)} />
        </div>
      )}
      <p className={`text-xs font-medium uppercase leading-[18px] text-[#667085] ${compact && billing === "annual" && planId !== "buy-list" ? "pr-16" : ""}`}>
        {category}
      </p>
    </>
  );
  function cardMotion(planId: PlanId, isSelected: boolean) {
    if (!animated) return { className: "transition-[border-color]", shadow: CARD_SHADOW };
    if (groupStyle === "tabsBorder" || groupStyle === "sections") {
      // Same size as its neighbours — selection shows as a group-colour border and soft shadow.
      const g = groupOf(planId);
      return {
        className: "transition-[border-color,box-shadow] duration-300 ease-out",
        shadow: isSelected ? `0 0 0 1px ${g.accent.solid}, 0 14px 30px -16px ${g.glow}` : CARD_SHADOW,
      };
    }
    const inActive = groupOf(planId).id === activeGroup.id;
    const fade = groupStyle === "tabs" && !inActive ? " opacity-50 saturate-50 scale-[0.98]" : "";
    return {
      className: popMode
        ? // Grow from the top edge so the card never rises into the tabs; content scales with it.
          `origin-top transition-[border-color,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform${
            isSelected ? " z-10 -translate-y-1.5 scale-[1.04]" : " z-0"
          }`
        : `transition-[border-color,transform,box-shadow,opacity,filter] duration-300 ease-out${
            isSelected ? " -translate-y-1" : ""
          }${fade}`,
      shadow: isSelected
        ? glowMode
          ? `0 28px 60px -18px ${groupOf(planId).glow}, 0 0 0 1px ${groupOf(planId).glow}`
          : "0 16px 32px -12px rgba(16,24,40,0.22)"
        : CARD_SHADOW,
    };
  }
  const selectedBar = (planId: PlanId) =>
    animated && ["tracks", "inline", "glow", "tabsBorder", "tabsGlow", "sections"].includes(groupStyle) ? groupOf(planId).accent.solid : "#008DC3";

  const buyPlan = BUY_LIST_PLAN;
  const buySelected = selectedPlan === "buy-list";
  const buyBadge = badgePlanId === "buy-list";

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const plan of PLANS) {
      for (const item of plan.includedItems) {
        if (item.expandable) init[`${plan.id}:inc:${item.label}`] = Boolean(item.defaultExpanded);
      }
      for (const item of plan.notIncludedItems ?? []) {
        if (item.expandable) init[`${plan.id}:exc:${item.label}`] = Boolean(item.defaultExpanded);
      }
    }
    return init;
  });

  function toggleExpand(key: string) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      {/* Responsive inset: tight on phone, full desktop padding */}
      <div className={`w-full px-4 sm:px-6 lg:px-10 ${compact ? "xl:px-10 2xl:px-20" : "xl:px-16 2xl:px-28"} ${compact ? "pt-4" : "pt-4 sm:pt-6"} pb-16 sm:pb-20`}>
        {/* One panel: context + billing + annual offer (no floating billing row) */}
        <div data-pricing-header className={compact ? "mx-auto w-full max-w-[1120px]" : "w-full"}>
          <div
            className={`relative w-full bg-white border border-l-8 border-l-[#79C1E9] rounded-lg overflow-visible ${
              compact ? "border-[#79C1E9]" : "border-[#D0D5DD]"
            }`}
            style={compact ? { boxShadow: GENIE_SHADOW_SM } : undefined}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8 px-4 py-4 sm:px-6 md:px-8">
              <div className="flex items-center gap-3 min-w-0 lg:max-w-[55%]">
                {!compact && (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center text-[#475467] hover:text-[#1D2939] transition-colors shrink-0"
                  aria-label="Back"
                >
                  <svg viewBox="0 0 16 16" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path d="M10 3.5L5.5 8 10 12.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                )}
                <div className="min-w-0">
                  <h1 className={`font-semibold text-[#1D2939] ${compact ? "text-xl leading-[30px]" : "text-xl sm:text-2xl leading-7 sm:leading-8"}`}>
                    Choose the <span className="text-[#008DC3]">right plan</span> for your business
                  </h1>
                  <p className="mt-1 text-sm font-normal leading-5 text-[#667085]">
                    Get the features and credits that match your goals.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:max-w-[48%] w-full lg:w-auto shrink-0 pb-3 sm:pb-0 lg:pb-3">
                <div className="relative flex h-10 items-stretch shrink-0 w-full sm:w-auto" role="group" aria-label="Billing period">
                  <button
                    type="button"
                    onClick={() => onBillingChange("monthly")}
                    className={`flex h-10 flex-1 sm:flex-none items-center justify-center whitespace-nowrap px-3 sm:px-4 text-sm leading-5 border border-[#D0D5DD] rounded-l-lg transition-colors ${
                      billing === "monthly"
                        ? "bg-[#008DC3] text-[#F9FAFB] font-medium border-[#008DC3] z-[1]"
                        : "bg-white text-[#475467] font-normal hover:bg-[#F9FAFB]"
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <div className="relative flex-1 sm:flex-none">
                    <button
                      type="button"
                      onClick={() => onBillingChange("annual")}
                      className={`flex h-10 w-full items-center justify-center whitespace-nowrap px-3 sm:px-4 text-sm leading-5 border border-l-0 border-[#D0D5DD] rounded-r-lg transition-colors ${
                        billing === "annual"
                          ? "bg-[#008DC3] text-[#F9FAFB] font-medium border-[#008DC3] z-[1]"
                          : "bg-white text-[#475467] font-normal hover:bg-[#F9FAFB]"
                      }`}
                    >
                      Annual Billing
                    </button>
                    {/* ~16.67% from 10 months paid / 12 months access → display Save 17% */}
                    <span className="pointer-events-none absolute left-1/2 top-[32px] z-10 -translate-x-1/2 inline-flex h-7 items-center justify-center rounded px-2 text-sm font-medium leading-5 bg-[#FFF6F2] text-[#C55418] whitespace-nowrap">
                      Save 17%
                    </span>
                  </div>
                </div>

                {/* Annual savings callout — positive green; reserved space (no flicker) */}
                <div
                  className={`flex w-full sm:max-w-[320px] items-start gap-2 rounded-lg border border-[#CDE9E0] bg-[#F2F9F7] p-4 transition-opacity duration-0 ${
                    billing === "annual" ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden={billing !== "annual"}
                >
                  <span className="shrink-0 pt-0.5 text-[#026B5C]" aria-hidden>
                    <FontAwesomeIcon icon={faCircleCheck} className="text-[14px]" />
                  </span>
                  <p className="text-xs font-medium leading-[18px] text-[#026B5C]">
                    Pay only for 10 months and get 12 months of access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Best Fit — close under header */}
        {!hidesGoalPicker(option) && (
        <div className="pt-5 pb-2">
          <p className="text-center text-sm font-medium leading-5 text-[#475467]">
            Tell us your goal, we&apos;ll recommend the{" "}
            <span className="font-semibold text-[#008DC3]">&lsquo;Best fit&rsquo;</span>
          </p>
          <div
            className="mt-2.5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-5"
            role="group"
            aria-label="Goal selection"
          >
            {GOAL_CHIPS.map((chip) => {
              const selected = goal === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  data-goal-chip
                  aria-pressed={selected}
                  onClick={() => onSelectGoal(chip.id)}
                  className={`flex h-10 items-center gap-2 px-3 rounded-lg border text-left text-sm leading-5 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008DC3] ${
                    selected
                      ? "bg-[#F0F9FF] border-[#008DC3] text-[#00729F] font-medium"
                      : "bg-white border-[#D0D5DD] text-[#475467] font-normal hover:bg-[#F9FAFB]"
                  }`}
                >
                  <GoalIcon id={chip.id} selected={selected} />
                  <span className="min-w-0 truncate">{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        )}

        {grouped && (groupStyle === "tabs" || switchMode || popMode) && (
          <GroupTabs activeId={activeGroup.id} onSelect={onSelectCard} />
        )}

        {/*
          Cards: 1-col phone → 2×2 tablet → 4-col desktop.
          Subgrid alignment only at xl so stacked rows stay compact on smaller screens.
        */}
        <div
          className={`${
            trayMode
              ? "mt-8 rounded-3xl border border-[#EAECF0] bg-[#F2F4F7] p-3 pt-6"
              : popMode && groupStyle === "tabsGlow"
                ? "pt-10 pb-12"
                : hidesGoalPicker(option)
                ? "pt-8"
                : "pt-3"
          } grid grid-cols-1 md:grid-cols-2 ${
            sectioned
              ? GROUPED_GRID_COLS
              : switchMode
                ? "w-full xl:mx-auto xl:max-w-[920px] xl:grid-cols-2"
                : "xl:grid-cols-4"
          } gap-4 xl:gap-5 items-stretch`}
          role="radiogroup"
          aria-label="Choose a plan"
        >
          {sectioned &&
            PLAN_GROUPS.map((group) => (
              <GroupPanel key={group.id} group={group} groupStyle={groupStyle} active={group.id === activeGroup.id} />
            ))}
          {SUBSCRIPTION_PLANS.map((plan) => {
            if (!shows(plan.id)) return null;
            const planId = plan.id as Exclude<PlanId, "buy-list">;
            const pricing = billing === "monthly" ? plan.monthly : plan.annual;
            const isSelected = selectedPlan === plan.id;
            const showBadge = plan.id === badgePlanId;
            const summary = PACKAGE_SUMMARIES[planId];
            const fullPlan = PLANS.find((p) => p.id === plan.id)!;

            const group = sectioned ? PLAN_GROUPS.find((g) => g.first === plan.id) : undefined;
            const motion = cardMotion(plan.id, isSelected);

            return (
              <Fragment key={plan.id}>
              {group && <GroupLabel group={group} groupStyle={groupStyle} active={group.id === activeGroup.id} />}
              <div
                data-plan-card
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onSelectCard(plan.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectCard(plan.id);
                  }
                }}
                className={`relative box-border h-full flex flex-col min-w-0 ${
                  sectioned ? GROUPED_CARD_PLACEMENT[plan.id] : "xl:row-span-4"
                } xl:grid xl:grid-cols-[minmax(0,1fr)] xl:grid-rows-subgrid xl:gap-y-0 rounded-xl bg-white border cursor-pointer overflow-visible ${motion.className}${
                  switchMode ? " animate-plan-rise" : ""
                } ${
                  isSelected
                    ? "border-[#B9D9EC]"
                    : "border-[#D0D5DD] hover:border-[#98A2B3]"
                }`}
                style={{ boxShadow: motion.shadow, ...riseDelay(plan.id), ...borderSelected(plan.id, isSelected) }}
              >
                {/* Row 1 — header (overlays live here so subgrid stays 5 children) */}
                <div className={`relative px-4 ${compact ? "pt-5 pb-3" : "pt-6 pb-4"} rounded-t-xl self-stretch transition-colors duration-300 ${headerSurface(plan.id, isSelected)}`}>
                  {isSelected && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute left-0 right-0 top-0 z-[1] h-2 rounded-t-[12px] transition-colors duration-300"
                      style={{ backgroundColor: selectedBar(plan.id) }}
                    />
                  )}
                  {showBadge && <PlanBadge label={activeBadgeLabel} />}
                  {compact && billing === "annual" && plan.annual.strikePrice && <SaveRibbon />}
                  <div className={`flex flex-col ${compact ? "gap-1" : "gap-2"}`}>
                    {categoryRow(plan.id, plan.category)}
                    <h3 className={`font-semibold text-[#008DC3] ${compact ? "text-xl leading-[30px]" : "text-2xl leading-8"}`}>{plan.name}</h3>
                    {option !== "b3" && (
                      <p className="text-sm font-normal leading-5 text-[#475467]">{plan.description}</p>
                    )}
                  </div>
                </div>

                {/* Row 2 — price + discount (left-aligned; 20px gap under price) */}
                <div className={`${compact ? "px-4 py-3" : "p-4"} self-start w-full`}>
                  {option === "b3" ? (
                    <PlanPriceV3
                      planId={planId}
                      pricing={pricing}
                      billing={billing}
                      onTalkToSales={onTalkToSales}
                      salesRequested={salesRequested}
                    />
                  ) : (
                  <div className="flex flex-col">
                    <div className="flex items-start gap-1.5">
                      <span className="text-sm font-normal leading-5 text-[#475467] pt-1.5 shrink-0">
                        Starting
                      </span>
                      <p className="inline-flex items-start font-semibold text-[#1D2939] tracking-[-0.72px]">
                        <span className="text-xl leading-[30px] mt-1">$</span>
                        <span className="text-[36px] leading-[44px]">{pricing.display}</span>
                        <span className="text-base leading-6 mt-3.5 font-semibold">{pricing.suffix}</span>
                      </p>
                    </div>
                    {isValueLed(option) && planId !== "basic" && (
                      <CreditChip>
                        Includes {fmtNumber(value.included)} credits · worth{" "}
                        {fmtMoney(value.includedValue)}
                      </CreditChip>
                    )}
                    <div
                      className={`mt-4 text-sm leading-5 ${
                        billing === "annual" ? "text-[#0D7867]" : "text-[#475467]"
                      }`}
                    >
                      {billing === "annual" && pricing.strikePrice ? (
                        <>
                          <p>
                            <span className="font-semibold line-through">${pricing.strikePrice}</span>
                            <span className="font-semibold">/yr</span>
                            <span> - Billed annually</span>
                          </p>
                          <p>Only 10 months&apos; cost when paid upfront</p>
                        </>
                      ) : (
                        pricing.supportLines.map((line) => <p key={line}>{line}</p>)
                      )}
                    </div>
                    {isValueLed(option) && planId === "basic" && <PaygCreditNote billing={billing} />}
                    {isValueLed(option) && planId === "pro" && <CreditEquation billing={billing} />}
                    {isValueLed(option) && planId === "team" && <SeatsInlineAlert onTalkToSales={onTalkToSales} />}
                  </div>
                  )}
                </div>

                {/* Row 3 — CTA */}
                <div className={`${compact ? "px-4 py-3" : "p-4"} self-stretch`}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCta(plan.id);
                    }}
                    className={`w-full h-10 box-border rounded-lg text-sm font-medium leading-5 transition-colors ${
                      isSelected
                        ? "bg-[#008DC3] border border-[#008DC3] text-white hover:bg-[#00729F]"
                        : "bg-white border border-[#008DC3] text-[#008DC3] hover:bg-[#F0F9FF]"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>

                {/* Row 4 — plan facts (blue box below CTA) */}
                <div className="flex flex-col self-stretch h-full min-h-0">
                {option !== "b3" && (
                <div className="px-4">
                  <PlanFacts
                    items={[
                      { label: "Access", value: summary.access },
                      {
                        label: "Credits",
                        value:
                          option !== "current" && planId === "basic" ? (
                            `Pay as you go · ${fmtRate(PAYG_CREDIT_RATE)}/credit`
                          ) : (
                            summary.creditsLabel(billing)
                          ),
                        emphasize: planId === "pro" || planId === "team",
                      },
                      { label: "Users", value: summary.users, emphasize: planId === "team" },
                    ]}
                  />
                </div>
                )}

                {/* Row 5 — feature checklists; addons bottom-aligned across cards */}
                <div className={`px-4 ${compact ? "pt-3 pb-5" : "py-6"} flex-1 min-h-0`}>
                  <PlanFeatureChecklist
                    plan={fullPlan}
                    expanded={expanded}
                    onToggle={toggleExpand}
                    compact={compact}
                  />
                </div>
                </div>
              </div>
              </Fragment>
            );
          })}

          {sectioned && (
            <GroupLabel group={PLAN_GROUPS[2]} groupStyle={groupStyle} active={activeGroup.id === "one-time"} />
          )}

          {/* Buy List — same 5-row subgrid structure */}
          {shows("buy-list") && (
          <div
            data-plan-card
            role="radio"
            aria-checked={buySelected}
            tabIndex={0}
            onClick={() => onSelectCard("buy-list")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectCard("buy-list");
              }
            }}
            className={`relative box-border h-full flex flex-col min-w-0 ${
              sectioned ? GROUPED_CARD_PLACEMENT["buy-list"] + " border-dashed" : "xl:row-span-4"
            } xl:grid xl:grid-cols-[minmax(0,1fr)] xl:grid-rows-subgrid xl:gap-y-0 rounded-xl bg-white border cursor-pointer overflow-visible ${
              cardMotion("buy-list", buySelected).className
            }${switchMode ? " animate-plan-rise" : ""} ${
              buySelected
                ? "border-[#B9D9EC]"
                : "border-[#D0D5DD] hover:border-[#98A2B3]"
            }`}
            style={{ boxShadow: cardMotion("buy-list", buySelected).shadow, ...borderSelected("buy-list", buySelected) }}
          >
            <div className={`relative px-4 ${compact ? "pt-5 pb-3" : "pt-6 pb-4"} rounded-t-xl self-stretch transition-colors duration-300 ${headerSurface("buy-list", buySelected)}`}>
              {buySelected && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-0 right-0 top-0 z-[1] h-2 rounded-t-[12px] transition-colors duration-300"
                  style={{ backgroundColor: selectedBar("buy-list") }}
                />
              )}
              {buyBadge && <PlanBadge label={activeBadgeLabel} />}
              <div className={`flex flex-col ${compact ? "gap-1" : "gap-2"}`}>
                {categoryRow("buy-list", buyPlan.category)}
                <h3 className={`font-semibold text-[#008DC3] ${compact ? "text-xl leading-[30px]" : "text-2xl leading-8"}`}>{buyPlan.name}</h3>
                {option !== "b3" && (
                  <p className="text-sm font-normal leading-5 text-[#475467]">{buyPlan.description}</p>
                )}
              </div>
            </div>

            <div className={`${compact ? "px-4 py-3" : "p-4"} self-start w-full`}>
              <div className="flex flex-col">
                {!/\d/.test(buyListPriceDisplay) ? (
                  <p className="font-semibold text-[#1D2939] text-[36px] leading-[44px] tracking-[-0.72px]">
                    {buyListPriceDisplay}
                  </p>
                ) : (
                  <p className="inline-flex items-start font-semibold text-[#1D2939] tracking-[-0.72px]">
                    <span className="text-xl leading-[30px] mt-1">$</span>
                    <span className="text-[36px] leading-[44px]">{buyListPriceDisplay}</span>
                  </p>
                )}
                <div className={`text-[#0D7867] ${compact ? "mt-1 text-xs leading-[18px]" : "mt-4 text-sm leading-5"}`}>
                  {buyListSupportLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                {option === "b3" && (
                  <CreditSummary
                    icon={faCartShopping}
                    title="One-time purchase"
                    points={[
                      "No subscription needed",
                      "12 months re-export access",
                    ]}
                  />
                )}
              </div>
            </div>

            <div className={`${compact ? "px-4 py-3" : "p-4"} self-stretch`}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCta("buy-list");
                }}
                className={`w-full h-10 box-border rounded-lg text-sm font-medium leading-5 transition-colors ${
                  buySelected
                    ? "bg-[#008DC3] border border-[#008DC3] text-white hover:bg-[#00729F]"
                    : "bg-white border border-[#008DC3] text-[#008DC3] hover:bg-[#F0F9FF]"
                }`}
              >
                {buyListCta}
              </button>
            </div>

            <div className="flex flex-col self-stretch h-full min-h-0">
            {option !== "b3" && (
            <div className="px-4">
              <PlanFacts
                items={[
                  { label: "Purchase", value: "One-time" },
                  {
                    label: "Price",
                    value:
                      !/\d/.test(buyListPriceDisplay)
                        ? "Calculated from selected records"
                        : `$${buyListPriceDisplay}`,
                  },
                  { label: "Access", value: "12 month re-export", emphasize: true },
                ]}
              />
            </div>
            )}

            <div className={`px-4 ${compact ? "pt-3 pb-5" : "py-6"} flex-1 min-h-0`}>
              <PlanFeatureChecklist
                plan={buyPlan}
                expanded={expanded}
                onToggle={toggleExpand}
                compact={compact}
              />
            </div>
            </div>
          </div>
          )}

          {switchMode && activeGroup.id !== "individual" && (
            <CompanionCard
              key={activeGroup.id}
              kind={activeGroup.id === "team" ? "team" : "one-time"}
              onTalkToSales={onTalkToSales}
              onSeeIndividual={() => onSelectCard("pro")}
            />
          )}

          {trayMode && <TalkBar onTalkToSales={onRequestCall} sent={salesRequested} />}
        </div>

        {grouped && !trayMode && (
          <div className="pt-6">
            <TalkBar onTalkToSales={onRequestCall} sent={salesRequested} />
          </div>
        )}

      </div>

      <SubscriptionComparison billing={billing} onSelectPlan={onSelectPlan} />
    </>
  );
}
