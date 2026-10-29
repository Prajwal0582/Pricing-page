import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import type { BillingPeriod, PlanId } from "./data/pricingPlans";
import type { ListPurchaseContext } from "./types";
import PlansView from "./views/PlansView";
import SubscriptionCheckoutView from "./views/SubscriptionCheckoutView";
import PurchaseView from "./views/PurchaseView";
import PurchaseSuccessView from "./views/PurchaseSuccessView";
import { GENIE_SHADOW_SM } from "./views/pricing/pricingTypes";

// This review build always shows B3 (Value focused) with Focus tabs · Border; no option switcher.
// Talk to sales / Request a call send straight away and confirm with a toast (no popup).
const params = new URLSearchParams(window.location.search);
params.set("option", "b3");
params.set("groups", "tabsBorder");
params.delete("v");
window.history.replaceState(null, "", `${window.location.pathname}?${params}`);

type View = "plans" | "subscription-checkout" | "purchase" | "purchase-success";

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

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }

  function backToPlans() {
    setList(null);
    setView("plans");
    window.scrollTo(0, 0);
  }

  return (
    <>
      {view === "plans" && (
        <PlansView
          purchaseContext={list}
          onBack={() => (list ? backToPlans() : showToast("This review link only includes the pricing page."))}
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
      )}
      {view === "subscription-checkout" && (
        <SubscriptionCheckoutView
          planId={plan.id}
          billing={plan.billing}
          onBack={() => setView("plans")}
          onComplete={({ billing, monthlyCredits }) => {
            const credits = billing === "annual" ? monthlyCredits * 12 + 1000 : monthlyCredits;
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
            onBack={() => setView("plans")}
            onComplete={() => setView("purchase-success")}
          />
        </div>
      )}
      {view === "purchase-success" && (
        <div className="h-screen bg-[#F9FAFB]">
          <PurchaseSuccessView onViewList={backToPlans} onNewSearch={backToPlans} />
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
