import { useState } from "react";
import PlansView from "./views/PlansView";

// This review build always shows B3 (Value focused) with Focus tabs · Border; no option switcher.
const params = new URLSearchParams(window.location.search);
params.set("option", "b3");
params.set("groups", "tabsBorder");
window.history.replaceState(null, "", `${window.location.pathname}?${params}`);

/** Pricing-only review app: no search, scenarios or admin — checkout CTAs show a note instead. */
export default function PricingApp() {
  const [note, setNote] = useState<string | null>(null);

  function showNote(message: string) {
    setNote(message);
    window.setTimeout(() => setNote(null), 2600);
  }

  return (
    <>
      <PlansView
        onBack={() => showNote("This review link only includes the pricing page.")}
        onSelectPlan={(planId, billing) =>
          showNote(`Checkout for ${planId} (${billing}) isn't part of this review link.`)
        }
        onSearchLeads={() => showNote("Lead search isn't part of this review link.")}
        hideOptionSwitcher
      />
      {note && (
        <div
          role="status"
          className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg bg-[#1D2939] px-4 py-2 text-sm font-medium text-white shadow-lg animate-fade-in"
        >
          {note}
        </div>
      )}
    </>
  );
}
