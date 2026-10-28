import { useState } from "react";
import PlansView from "./views/PlansView";

// This review build always shows B3 (Value focused) with Focus tabs · Border; no option switcher.
const params = new URLSearchParams(window.location.search);
params.set("option", "b3");
params.set("groups", "tabsBorder");
window.history.replaceState(null, "", `${window.location.pathname}?${params}`);

type Version = 1 | 2;

const VERSIONS: { id: Version; label: string; description: string }[] = [
  { id: 1, label: "Version 1", description: "As shared — Talk to sales opens a request popup." },
  { id: 2, label: "Version 2", description: "Talk to sales / Request a call send straight away with an inline confirmation." },
];

const readVersion = (): Version => (new URLSearchParams(window.location.search).get("v") === "2" ? 2 : 1);

/** Pricing-only review app: no search, scenarios or admin — checkout CTAs show a note instead. */
export default function PricingApp() {
  const [note, setNote] = useState<string | null>(null);
  const [version, setVersion] = useState<Version>(readVersion);

  function changeVersion(next: Version) {
    setVersion(next);
    const url = new URL(window.location.href);
    if (next === 1) url.searchParams.delete("v");
    else url.searchParams.set("v", String(next));
    window.history.replaceState(null, "", url);
  }

  function showNote(message: string) {
    setNote(message);
    window.setTimeout(() => setNote(null), 2600);
  }

  return (
    <>
      <PlansView
        key={version}
        onBack={() => showNote("This review link only includes the pricing page.")}
        onSelectPlan={(planId, billing) =>
          showNote(`Checkout for ${planId} (${billing}) isn't part of this review link.`)
        }
        onSearchLeads={() => showNote("Lead search isn't part of this review link.")}
        hideOptionSwitcher
        salesConfirmInline={version === 2}
      />
      <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-1.5 rounded-xl bg-[#1D2939] p-2 text-white shadow-lg">
        <div className="flex items-center gap-1" role="group" aria-label="Version">
          {VERSIONS.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={v.id === version}
              onClick={() => changeVersion(v.id)}
              className={`h-8 whitespace-nowrap rounded-lg px-3 text-xs font-medium transition-colors ${
                v.id === version ? "bg-white text-[#1D2939]" : "text-[#D0D5DD] hover:bg-white/10"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="hidden px-2 text-center text-[11px] leading-4 text-[#98A2B3] sm:block">
          {VERSIONS.find((v) => v.id === version)!.description}
        </p>
      </div>
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
