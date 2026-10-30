import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import type { BillingPeriod, PlanId } from "./data/pricingPlans";
import type { ListPurchaseContext } from "./types";
import PlansView from "./views/PlansView";
import SubscriptionCheckoutView from "./views/SubscriptionCheckoutView";
import PurchaseView from "./views/PurchaseView";
import PurchaseSuccessView from "./views/PurchaseSuccessView";
import { GENIE_SHADOW_SM } from "./views/pricing/pricingTypes";
import { ANNUAL_BONUS_CREDITS } from "./views/pricing/creditValue";

// This review build always shows B3 (Value focused) in labelled sections (Individual / Team /
// One-time, no group toggle); no option switcher. Talk to sales / Request a call confirm with a toast (no popup).
const params = new URLSearchParams(window.location.search);
params.set("option", "b3");
params.set("groups", "sections");
params.delete("v");
window.history.replaceState(null, "", `${window.location.pathname}?${params}`);

type View = "plans" | "subscription-checkout" | "purchase" | "purchase-success";

/** How the pricing drawer opens over the app — review-only switch (?drawer=sheet|side|zoom). */
type DrawerMotion = "sheet" | "side" | "zoom";
const DRAWER_MOTIONS: { id: DrawerMotion; label: string }[] = [
  { id: "sheet", label: "Sheet" },
  { id: "side", label: "Side" },
  { id: "zoom", label: "Zoom" },
];
const readMotion = (): DrawerMotion => {
  const v = new URLSearchParams(window.location.search).get("drawer");
  return v === "side" || v === "zoom" ? v : "sheet";
};

const PANEL_BOX: Record<DrawerMotion, string> = {
  sheet: "inset-x-3 top-3 bottom-0 rounded-t-2xl sm:inset-x-6",
  side: "right-0 top-0 bottom-0 w-[min(1440px,calc(100vw-48px))] rounded-l-2xl",
  zoom: "inset-3 rounded-2xl sm:inset-6",
};

/** Simplified Salesgenie app behind the drawer — pricing opens on top of it like the Settings panel. */
function AppBackdrop({ onOpenPlans }: { onOpenPlans: () => void }) {
  const nav = ["Search", "Saved lists", "Tasks", "Email campaigns", "Direct mail", "Settings", "Support"];
  return (
    <div className="flex h-screen w-full bg-white">
      <aside className="flex w-[256px] shrink-0 flex-col bg-[#1D2939] p-2 text-[#D0D5DD]">
        <div className="flex h-16 items-center gap-2 px-3">
          <img src="/favicon.svg" alt="" className="size-9 rounded" />
          <span className="text-lg font-semibold text-white">salesgenie</span>
        </div>
        <nav className="mt-2 flex flex-col gap-1">
          {nav.map((item, i) => (
            <span key={item} className={`rounded-lg px-3 py-2 text-sm ${i === 0 ? "bg-white/10 text-white" : ""}`}>
              {item}
            </span>
          ))}
        </nav>
        <div className="mt-auto rounded-lg bg-white/10 p-3">
          <p className="text-sm font-semibold text-white">Get started today!</p>
          <p className="mt-1 text-xs leading-[18px]">Flexible options to help you start faster.</p>
          <button
            type="button"
            onClick={onOpenPlans}
            className="mt-3 h-9 w-full rounded-lg bg-[#008DC3] text-sm font-medium text-white hover:bg-[#00729F]"
          >
            Access pricing
          </button>
        </div>
      </aside>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <div className="text-center">
          <p className="text-2xl font-semibold text-[#008DC3]">Hey Jason,</p>
          <p className="text-3xl font-semibold text-[#1D2939]">What are we prospecting today?</p>
        </div>
        <div className="h-28 w-full max-w-[760px] rounded-xl border border-[#EAECF0] bg-[#F9FAFB]" />
        <button
          type="button"
          onClick={onOpenPlans}
          className="h-10 rounded-lg border border-[#008DC3] px-4 text-sm font-medium text-[#008DC3] hover:bg-[#F0F9FF]"
        >
          View plans
        </button>
      </main>
    </div>
  );
}

/** Stand-in for a list built in search (search isn't part of this link) — same shape as the NLP purchase flow. */
const SAMPLE_LIST: ListPurchaseContext = {
  pricingMode: "purchase-list",
  source: "signalfuse-results",
  query: "Restaurants in Texas with more than 20 employees",
  scenarioId: "restaurants-tx",
  listName: "Restaurants in Texas",
  resultCount: 12931,
  estimatedPrice: 2100,
};

/**
 * Pricing review app: pricing page plus the same checkout steps as the NLP prototype —
 * Choose plan → subscription checkout; Build my list → sample list → Proceed to checkout → purchase → success.
 */
export default function PricingApp() {
  const [view, setView] = useState<View>("plans");
  const [plan, setPlan] = useState<{ id: Exclude<PlanId, "buy-list">; billing: BillingPeriod }>({ id: "pro", billing: "annual" });
  const [list, setList] = useState<ListPurchaseContext | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [motion, setMotion] = useState<DrawerMotion>(readMotion);
  const [drawer, setDrawer] = useState<"open" | "closing" | "closed">("open");

  function openDrawer() {
    setView("plans");
    setDrawer("open");
  }
  function closeDrawer() {
    setDrawer("closing");
    window.setTimeout(() => setDrawer("closed"), 280);
  }
  function changeMotion(next: DrawerMotion) {
    setMotion(next);
    const url = new URL(window.location.href);
    url.searchParams.set("drawer", next);
    window.history.replaceState(null, "", url);
    // Replay the opening so each motion can be compared.
    setDrawer("closed");
    window.setTimeout(() => setDrawer("open"), 60);
  }

  useEffect(() => {
    if (view !== "plans" || drawer !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("[role=dialog]")) closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [view, drawer]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }

  function backToPlans() {
    setList(null);
    openDrawer();
  }

  return (
    <>
      {view === "plans" && <AppBackdrop onOpenPlans={openDrawer} />}
      {view === "plans" && drawer !== "closed" && (
        <div className="fixed inset-0 z-40">
          <div
            aria-hidden
            onClick={closeDrawer}
            className={`absolute inset-0 bg-[#101828]/50 ${drawer === "closing" ? "drawer-backdrop-out" : "drawer-backdrop-in"}`}
          />
          <div
            role="region"
            aria-label="Plans and pricing"
            className={`absolute overflow-hidden bg-white shadow-2xl ${PANEL_BOX[motion]} ${
              drawer === "closing" ? `drawer-${motion}-out` : `drawer-${motion}-in`
            }`}
          >
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-lg text-[#475467] hover:bg-[#F2F4F7] hover:text-[#1D2939]"
            >
              <FontAwesomeIcon icon={faXmark} className="text-[18px]" />
            </button>
        <PlansView
          purchaseContext={list}
          onBack={closeDrawer}
          onSelectPlan={(id, billing) => {
            setPlan({ id, billing });
            setView("subscription-checkout");
          }}
          onSearchLeads={() => {
            setList(SAMPLE_LIST);
            showToast(`Sample list loaded: ${SAMPLE_LIST.resultCount.toLocaleString()} records`);
          }}
          onBuyListCheckout={() => setView("purchase")}
          hideOptionSwitcher
          salesConfirmInline
        />
          </div>
        </div>
      )}
      {view === "subscription-checkout" && (
        <SubscriptionCheckoutView
          planId={plan.id}
          billing={plan.billing}
          onBack={openDrawer}
          onComplete={({ billing, monthlyCredits }) => {
            // Annual: 12 months upfront (+ bonus credits on Pro / Team once phase 2 ships; 0 today).
            const bonus = billing === "annual" && plan.id !== "basic" ? ANNUAL_BONUS_CREDITS : 0;
            const credits = (billing === "annual" ? monthlyCredits * 12 : monthlyCredits) + bonus;
            const name = plan.id.charAt(0).toUpperCase() + plan.id.slice(1);
            backToPlans();
            showToast(`${name} ${billing} subscription started · ${credits.toLocaleString()} credits added.`);
          }}
        />
      )}
      {view === "purchase" && (
        <div className="h-screen">
          <PurchaseView
            listName={list?.listName ?? SAMPLE_LIST.listName}
            isFreemium
            purchaseContext={list}
            onBack={openDrawer}
            onComplete={() => setView("purchase-success")}
          />
        </div>
      )}
      {view === "purchase-success" && (
        <div className="h-screen bg-[#F9FAFB]">
          <PurchaseSuccessView
            listName={list?.listName}
            recordCount={list?.resultCount}
            amountPaid={list?.estimatedPrice}
            onViewList={backToPlans}
            onNewSearch={backToPlans}
          />
        </div>
      )}
      {view === "plans" && (
        <div className="fixed bottom-4 left-4 z-[60] flex items-center gap-1 rounded-xl bg-[#1D2939] p-1.5 text-white shadow-lg">
          <span className="px-2 text-[11px] font-semibold uppercase tracking-wide text-[#98A2B3]">Drawer</span>
          {DRAWER_MOTIONS.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={m.id === motion}
              onClick={() => changeMotion(m.id)}
              className={`h-7 rounded-lg px-3 text-xs font-medium ${
                m.id === motion ? "bg-white text-[#1D2939]" : "text-[#D0D5DD] hover:bg-white/10"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
      {toast && (
        // Genie Material Design · Toast (Type=Time Sensitive, State=Default, Icon=Leading)
        <div
          role="status"
          className="fixed left-1/2 top-4 z-50 flex w-[calc(100%-32px)] max-w-[480px] -translate-x-1/2 items-center gap-2 rounded-lg border border-[#475467] bg-[#475467] p-4 text-white animate-fade-in"
          style={{ boxShadow: GENIE_SHADOW_SM }}
        >
          <FontAwesomeIcon icon={faCircleCheck} className="shrink-0 text-[16px]" aria-hidden />
          <p className="min-w-0 text-base font-medium leading-6">{toast}</p>
        </div>
      )}
    </>
  );
}
