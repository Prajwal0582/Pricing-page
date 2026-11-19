import { useMemo, useState } from "react";
import type { BillingPeriod, PlanId } from "../data/pricingPlans";
import { PLANS } from "../data/pricingPlans";

/**
 * Two checkout explorations (Nov 19), switchable from the pill under "Checkout" or ?checkout=a|b:
 * A — fixed payment plan: billing cards show plan prices; credits are a separate card.
 * B — dynamic payment plan: billing + credits in one card; both billing prices include the credits.
 */
export type CheckoutOption = "a" | "b";

function readCheckoutOption(): CheckoutOption {
  return new URLSearchParams(window.location.search).get("checkout") === "b" ? "b" : "a";
}

interface SubscriptionCheckoutViewProps {
  planId: Exclude<PlanId, "buy-list">;
  billing: BillingPeriod;
  onBack: () => void;
  onComplete: (result: { billing: BillingPeriod; monthlyCredits: number }) => void;
}

const PLAN_META = {
  basic: { seats: 1, includedCredits: 0, monthly: 99, annualList: 1188, annualPay: 990 },
  pro: { seats: 1, includedCredits: 500, monthly: 149, annualList: 1788, annualPay: 1490 },
  team: { seats: 5, includedCredits: 500, monthly: 299, annualList: 3588, annualPay: 2990 },
} as const;

/** Extra credits beyond plan inclusion — same $0.15/credit rate as the pricing page. */
const CREDIT_RATE_MONTHLY = 0.15;
/** Annual bonus credits on Pro / Team — phase 2 (needs NXG ↔ OES automation); 0 in phase 1. */
const ANNUAL_BONUS = 0;
/** Self-serve credit cap: 5,000/mo (60,000/yr). One step past it = "Contact sales" (Surbhi, Nov 18). */
const CREDIT_MAX = 5000;
/**
 * Credits move in fixed packs: 500/mo on monthly, 6,000/yr on annual (the same 500/mo).
 * State is kept as monthly-equivalent credits; annual shows ×12.
 */
const CREDIT_STEP = 500;
const ADDON_MONTHLY = 50;
const SALES_PHONE = "877.708.3844";
const SALES_EMAIL = "genie@data-axle.com";

function formatMoney(amount: number, opts?: { cents?: boolean }) {
  const withCents = opts?.cents !== false;
  const fixed = withCents ? amount.toFixed(2) : String(Math.round(amount));
  const [whole, frac] = fixed.split(".");
  const grouped = Number(whole).toLocaleString("en-US");
  return withCents ? `$${grouped}.${frac}` : `$${grouped}`;
}

function formatRenewDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function addOneYear(from: Date) {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

function CheckBox({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative size-4 shrink-0 rounded border transition-colors ${
        checked
          ? "border-[#008DC3] bg-[#E5F3FC]"
          : "border-[#D0D5DD] bg-white hover:border-[#98A2B3]"
      }`}
    >
      {checked ? (
        <svg viewBox="0 0 12 12" className="absolute inset-0 m-auto size-2.5 text-[#008DC3]" aria-hidden>
          <path d="M2.5 6l2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </button>
  );
}

function AddonChip() {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded px-2 text-xs font-medium leading-[18px] text-[#F8F7FF] bg-[#764FD9]">
      <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden>
        <path d="M3.5 2h5L10.5 4.5 6 10.5 1.5 4.5 3.5 2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M1.5 4.5h9" stroke="currentColor" strokeWidth="1.1" />
      </svg>
      Add-on
    </span>
  );
}

function MoneyParts({ amount, size = "md" }: { amount: number; size?: "md" | "lg" | "xl" }) {
  const [whole, frac] = amount.toFixed(2).split(".");
  const grouped = Number(whole).toLocaleString("en-US");
  if (size === "xl") {
    return (
      <span className="whitespace-nowrap text-[#1D2939]">
        <span className="text-2xl font-semibold leading-8">${grouped}</span>
        <span className="text-xs font-medium leading-[18px]">.{frac}</span>
      </span>
    );
  }
  if (size === "lg") {
    return (
      <span className="whitespace-nowrap text-[#1D2939]">
        <span className="text-lg font-semibold leading-7">${grouped}</span>
        <span className="text-xs font-semibold leading-[18px]">.{frac}</span>
      </span>
    );
  }
  return (
    <span className="whitespace-nowrap text-[#1D2939]">
      <span className="text-base font-medium leading-6">${grouped}</span>
      <span className="text-xs font-medium leading-[18px]">.{frac}</span>
    </span>
  );
}

/** Order-summary price: struck-through list price beside what you pay (as on the plan cards). */
function PriceWithList({ list, pay }: { list?: number; pay: number }) {
  return (
    <span className="flex items-baseline gap-2 whitespace-nowrap">
      {list !== undefined && list > pay && (
        <span className="text-sm font-medium leading-5 text-[#98A2B3] line-through">{formatMoney(list)}</span>
      )}
      <MoneyParts amount={pay} />
    </span>
  );
}

export default function SubscriptionCheckoutView({
  planId,
  billing: initialBilling,
  onBack,
  onComplete,
}: SubscriptionCheckoutViewProps) {
  const plan = PLANS.find((p) => p.id === planId)!;
  const meta = PLAN_META[planId];
  const [billing, setBilling] = useState<BillingPeriod>(initialBilling);
  // Start at what the plan includes (Basic: 0) — extra credits are opt-in.
  const [credits, setCredits] = useState<number>(meta.includedCredits);
  const hasBonus = ANNUAL_BONUS > 0 && meta.includedCredits > 0;
  const [buyerIntent, setBuyerIntent] = useState(false);
  const [purchaseSignals, setPurchaseSignals] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [billingMatch, setBillingMatch] = useState(true);

  const renewDate = useMemo(() => formatRenewDate(addOneYear(new Date())), []);

  const [option, setOption] = useState<CheckoutOption>(readCheckoutOption);
  function changeOption(next: CheckoutOption) {
    setOption(next);
    const url = new URL(window.location.href);
    if (next === "a") url.searchParams.delete("checkout");
    else url.searchParams.set("checkout", next);
    window.history.replaceState(window.history.state, "", url);
  }

  /** Slider/value box show credits per billing period: monthly → /mo, annual → /yr (×12). */
  const unit = billing === "annual" ? 12 : 1;
  const periodSuffix = billing === "annual" ? "/yr" : "/mo";
  const sliderMin = meta.includedCredits; // can't go below what the plan includes
  const sliderMax = CREDIT_MAX + CREDIT_STEP; // last notch = "5,000+" → contact sales
  const overCap = credits > CREDIT_MAX;
  const capLabel = `${(CREDIT_MAX * unit).toLocaleString()} credits${periodSuffix}`;
  const creditsLabel = overCap ? `${(CREDIT_MAX * unit).toLocaleString()}+` : (credits * unit).toLocaleString();

  const extraCredits = overCap ? 0 : Math.max(0, credits - meta.includedCredits);
  /** Extra credits per month; annual = 12 months' value, only 10 billed (same deal as the plan). */
  const creditMonthly = extraCredits * CREDIT_RATE_MONTHLY;
  const creditAnnualList = creditMonthly * 12;
  const creditAnnualPay = creditMonthly * 10;

  const addonCount = (buyerIntent ? 1 : 0) + (purchaseSignals ? 1 : 0);
  const addonMonthly = addonCount * ADDON_MONTHLY;
  const addonAnnual = addonMonthly * 10;

  const annual = billing === "annual";
  const planList = annual ? meta.annualList : meta.monthly;
  const planPay = annual ? meta.annualPay : meta.monthly;
  const creditList = annual ? creditAnnualList : creditMonthly;
  const creditPay = annual ? creditAnnualPay : creditMonthly;
  const addonCharge = annual ? addonAnnual : addonMonthly;
  /** Savings are already taken off each line (struck-through list price → price you pay). */
  const savings = annual ? planList - planPay + (creditList - creditPay) : 0;

  const selectedSubtotal = planPay + creditPay + addonCharge;
  const payable = selectedSubtotal;

  /** Option B: billing-card prices include the chosen credits (both periods, same credit level). */
  const dyn = option === "b";
  const monthlyCardPrice = meta.monthly + (dyn ? creditMonthly : 0);
  const annualCardList = meta.annualList + (dyn ? creditAnnualList : 0);
  const annualCardPay = meta.annualPay + (dyn ? creditAnnualPay : 0);

  const billingCards = (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <button
          type="button"
          onClick={() => setBilling("monthly")}
          className={`flex min-h-[108px] flex-1 flex-col items-center justify-center rounded-lg border p-4 text-center transition-colors ${
            billing === "monthly" ? "border-[#00729F] bg-[#F1F9FD]" : "border-[#D0D5DD] bg-white hover:border-[#98A2B3]"
          }`}
        >
          <p className="flex w-full items-start justify-center tracking-tight text-[#1D2939]">
            <span className="text-[23px] font-semibold leading-[44px]">$</span>
            <span className="text-[36px] font-semibold leading-[44px] tabular-nums">{monthlyCardPrice.toLocaleString("en-US")}</span>
            <span className="pt-2 text-lg font-medium leading-7">.00</span>
            <span className="pt-2.5 text-base font-semibold leading-6">/mo</span>
          </p>
          <p className="mt-2 w-full text-sm font-medium leading-5 text-[#475467]">Pay monthly • Annual contract</p>
          {dyn && !overCap && credits > 0 && (
            <p className="mt-1 text-xs leading-[18px] text-[#667085]">Includes {credits.toLocaleString()} credits/mo</p>
          )}
        </button>

        <button
          type="button"
          onClick={() => setBilling("annual")}
          className={`flex min-h-[108px] flex-1 flex-col items-center justify-center rounded-lg border p-4 text-center transition-colors ${
            billing === "annual" ? "border-[#00729F] bg-[#F1F9FD]" : "border-[#D0D5DD] bg-white hover:border-[#98A2B3]"
          }`}
        >
          <div className="flex w-full flex-wrap items-center justify-center gap-5">
            <p className="flex items-end tracking-tight text-[#1D2939] line-through decoration-solid">
              <span className="text-[12px] font-semibold leading-[44px]">$</span>
              <span className="text-base font-medium leading-6 self-center tabular-nums">{annualCardList.toLocaleString("en-US")}</span>
            </p>
            <p className="flex items-start tracking-tight text-[#1D2939]">
              <span className="text-[23px] font-semibold leading-[44px]">$</span>
              <span className="text-[36px] font-semibold leading-[44px] tabular-nums">{annualCardPay.toLocaleString("en-US")}</span>
              <span className="pt-2.5 text-base font-medium leading-6">.00</span>
            </p>
          </div>
          <div className="mt-2 inline-flex h-6 items-center rounded bg-[#F2F9F7] px-2">
            <p className="text-xs font-medium leading-[18px] text-[#0D7867]">
              {hasBonus
                ? `Upfront payment for 10 months + get ${ANNUAL_BONUS.toLocaleString()} bonus credits`
                : "Upfront payment for 10 months"}
            </p>
          </div>
          {dyn && !overCap && credits > 0 && (
            <p className="mt-1 text-xs leading-[18px] text-[#667085]">Includes {(credits * 12).toLocaleString()} credits/yr</p>
          )}
        </button>
      </div>
      <p className="mt-4 text-sm font-normal leading-5 text-[#475467]">
        Membership renews <span className="font-medium text-[#1D2939]">{renewDate}</span>
      </p>
    </>
  );

  /** Credits slider — fixed packs; the value box is read-only (reflects the slider). */
  const creditsControl = (
    <>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h2 className="text-base font-semibold leading-6 text-[#1D2939]">Configure your credits</h2>
        </div>
        <output
          aria-live="polite"
          aria-label={annual ? "Credits per year" : "Credits per month"}
          className="min-w-[72px] rounded-lg border border-[#D0D5DD] bg-[#F9FAFB] px-2 py-1 text-right text-sm font-medium leading-5 text-[#475467] tabular-nums"
        >
          {creditsLabel}
        </output>
      </div>

      <div className="mt-2">
        <input
          type="range"
          min={sliderMin * unit}
          max={sliderMax * unit}
          step={CREDIT_STEP * unit}
          value={credits * unit}
          onChange={(e) => setCredits(Number(e.target.value) / unit)}
          className="credit-slider w-full cursor-pointer"
          aria-label={annual ? "Credits per year" : "Credits per month"}
          aria-valuetext={overCap ? `More than ${capLabel} — contact sales` : `${(credits * unit).toLocaleString()} credits${periodSuffix}`}
          style={{
            background: `linear-gradient(to right, #008DC3 ${((credits - sliderMin) / (sliderMax - sliderMin)) * 100}%, #BBDEFB ${((credits - sliderMin) / (sliderMax - sliderMin)) * 100}%)`,
          }}
        />
        <div className="mt-1 flex justify-between text-xs leading-[18px] text-[#98A2B3]">
          <span>{(sliderMin * unit).toLocaleString()}</span>
          <span>Steps of {(CREDIT_STEP * unit).toLocaleString()}</span>
          <span>{(CREDIT_MAX * unit).toLocaleString()}+</span>
        </div>
      </div>

      {overCap ? (
        <div role="status" className="mt-3 flex items-start gap-3 rounded-lg border border-[#CAE6F9] bg-[#F1F9FD] p-3">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#008DC3] text-xs font-semibold text-white" aria-hidden>
            i
          </span>
          <div className="text-sm leading-5 text-[#344054]">
            <p className="font-semibold text-[#1D2939]">Need more than {capLabel}? Let&apos;s talk.</p>
            <p className="mt-0.5">
              Larger credit packs are priced by our sales team. Contact us at{" "}
              <a href={`tel:${SALES_PHONE.replace(/\./g, "")}`} className="font-medium text-[#008DC3] hover:underline">
                {SALES_PHONE}
              </a>{" "}
              or{" "}
              <a href={`mailto:${SALES_EMAIL}`} className="font-medium text-[#008DC3] hover:underline">
                {SALES_EMAIL}
              </a>
              , or move the slider back to {capLabel} or less to check out now.
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-xs font-normal leading-[18px] text-[#667085]">
          {meta.includedCredits === 0
            ? `Your selected plan does not include any shared credits. Add credits in packs of ${(CREDIT_STEP * unit).toLocaleString()} before checkout.`
            : annual
              ? `${plan.name} includes ${(meta.includedCredits * 12).toLocaleString()} credits/yr, provided upfront${hasBonus ? ` + ${ANNUAL_BONUS.toLocaleString()} annual bonus credits` : ""}. Need more? Add packs of ${(CREDIT_STEP * 12).toLocaleString()} before checkout.`
              : `${plan.name} includes ${meta.includedCredits.toLocaleString()} credits/mo. Need more? Add packs of ${CREDIT_STEP.toLocaleString()} before checkout.`}
        </p>
      )}
    </>
  );

  return (
    <div className="h-full w-full overflow-y-auto bg-[#F9FAFB]">
      {/* Header — Figma: back + Checkout on page bg, no separate bar */}
      <div className="w-full px-8 pt-8 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex size-5 items-center justify-center text-[#475467] hover:text-[#1D2939] transition-colors"
            aria-label="Back"
          >
            <svg viewBox="0 0 20 20" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M12 5L7 10l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-xl font-medium leading-[30px] tracking-[0.2px] text-[#1D2939]">Checkout</h1>
          {/* Prototype-only: compare the two checkout explorations */}
          <div role="group" aria-label="Checkout option (prototype)" className="ml-auto flex items-center gap-2 rounded-full border border-dashed border-[#B692F6] bg-white p-1 pl-3 text-xs">
            <span className="font-medium text-[#6941C6]">Prototype</span>
            {(
              [
                { id: "a", label: "A · Fixed payment plan" },
                { id: "b", label: "B · Dynamic payment plan" },
              ] as const
            ).map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={option === o.id}
                onClick={() => changeOption(o.id)}
                className={`rounded-full px-3 py-1 font-medium transition-colors ${
                  option === o.id ? "bg-[#6941C6] text-white" : "text-[#475467] hover:bg-[#F4EBFF]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full px-6 pb-10 pt-4">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start gap-6 lg:flex-row">
          {/* Left column */}
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {option === "a" ? (
              <>
                {/* A — Payment plan (fixed prices) */}
                <div className="rounded-lg border border-[#D0D5DD] bg-white p-4 shadow-[0_1px_2px_rgba(71,84,103,0.04)]">
                  <h2 className="mb-4 text-base font-semibold leading-6 text-[#1D2939]">Payment plan</h2>
                  {billingCards}
                </div>
                {/* A — Configure credits */}
                <div className="rounded-lg border border-[#D0D5DD] bg-white p-4 shadow-[0_1px_2px_rgba(71,84,103,0.04)]">
                  {creditsControl}
                </div>
              </>
            ) : (
              /* B — one card: billing prices update with the credits chosen below */
              <div className="rounded-lg border border-[#D0D5DD] bg-white p-4 shadow-[0_1px_2px_rgba(71,84,103,0.04)]">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold leading-6 text-[#1D2939]">Payment plan</h2>
                    <p className="mt-0.5 text-sm leading-5 text-[#667085]">Prices include the credits you choose below.</p>
                  </div>
                </div>
                {billingCards}
                <div className="mt-5 border-t border-[#EAECF0] pt-4">{creditsControl}</div>
              </div>
            )}

            {/* Additional features */}
            <div className="rounded-lg border border-[#D0D5DD] bg-white p-4 shadow-[0_1px_2px_rgba(71,84,103,0.04)]">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-base font-semibold leading-6 text-[#1D2939]">Additional features</h2>
                <AddonChip />
              </div>

              <div className="flex flex-col gap-5">
                <label className="flex cursor-pointer items-start gap-3">
                  <div className="pt-0.5">
                    <CheckBox checked={buyerIntent} onChange={setBuyerIntent} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm font-semibold leading-5 text-[#1D2939]">Buyer Intent</span>
                      <span className="shrink-0 text-sm font-medium leading-5 text-[#1D2939]">$50/mo</span>
                    </div>
                    <p className="mt-1 text-sm font-normal leading-5 text-[#667085]">
                      Discover businesses that are actively looking for solutions like yours. Enhance your
                      prospecting and marketing strategies with this powerful tool.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3">
                  <div className="pt-0.5">
                    <CheckBox checked={purchaseSignals} onChange={setPurchaseSignals} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm font-semibold leading-5 text-[#1D2939]">Purchase Signals</span>
                      <span className="shrink-0 text-sm font-medium leading-5 text-[#1D2939]">$50/mo</span>
                    </div>
                    <p className="mt-1 text-sm font-normal leading-5 text-[#667085]">
                      Discover households showing confirmed or predicted purchase behavior. Use these insights
                      to refine your lists and power smarter prospecting.
                    </p>
                  </div>
                </label>

                <div className="pl-7">
                  <p className="text-sm font-semibold leading-5 text-[#1D2939]">Consumer Cell phone</p>
                  <p className="mt-1 text-sm font-normal leading-5 text-[#667085]">
                    Contact us at 877.708.3844 or genie@data-axle.com for pricing and availability
                  </p>
                </div>
              </div>
            </div>

            {/* Location address */}
            <div className="rounded-lg border border-[#D0D5DD] bg-white p-4 shadow-[0_1px_2px_rgba(71,84,103,0.04)]">
              <h2 className="text-base font-semibold leading-6 text-[#1D2939]">Location address</h2>
              <p className="mt-1 text-sm font-normal leading-5 text-[#667085]">
                Please provide us details of your location address.
              </p>

              <div className="mt-5 flex flex-col gap-5">
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-[#667085]">
                    Contact name
                  </label>
                  <input
                    type="text"
                    defaultValue="Frank Smith"
                    className="w-full rounded-lg border border-[#D0D5DD] px-4 py-3 text-sm text-[#1D2939] focus:border-[#008DC3] focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-[#667085]">
                    Billing Address
                  </label>
                  <input
                    type="text"
                    defaultValue="1800 Owens St"
                    className="w-full rounded-lg border border-[#D0D5DD] px-4 py-3 text-sm text-[#1D2939] focus:border-[#008DC3] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {(
                    [
                      { label: "City", value: "San Francisco" },
                      { label: "State", value: "CA" },
                      { label: "ZIP", value: "94158" },
                    ] as const
                  ).map((field) => (
                    <div key={field.label} className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-[#667085]">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        defaultValue={field.value}
                        className="w-full rounded-lg border border-[#D0D5DD] px-4 py-3 text-sm text-[#1D2939] focus:border-[#008DC3] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <label className="flex cursor-pointer items-center gap-2">
                  <CheckBox checked={billingMatch} onChange={setBillingMatch} />
                  <span className="text-sm font-normal leading-[18px] tracking-[0.14px] text-[#1D2939]">
                    Billing address same as Location address
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Order summary — Figma ~525px */}
          <div className="w-full shrink-0 lg:w-[525px]">
            <div className="sticky top-6 flex flex-col gap-4 rounded-lg border border-[#D0D5DD] bg-white p-6">
              <div>
                <h2 className="text-lg font-semibold leading-7 text-[#344054]">Order Summary</h2>
                <p className="mt-1 text-sm font-normal leading-5 text-[#475467]">
                  {billing === "annual"
                    ? "Annual contract · one upfront payment"
                    : "Annual contract · monthly payments"}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-0.5">
                  <p className="flex-1 text-base font-medium leading-6 text-[#344054]">
                    {plan.name} Plan (
                    {meta.includedCredits === 0
                      ? "no credits included"
                      : billing === "annual"
                        ? `${(meta.includedCredits * 12).toLocaleString()} credits`
                        : `${meta.includedCredits.toLocaleString()} credits/mo`}{" "}
                    · {meta.seats} seat
                    {meta.seats > 1 ? "s" : ""})
                  </p>
                  <PriceWithList list={annual ? planList : undefined} pay={planPay} />
                </div>

                {extraCredits > 0 && (
                  <div className="flex items-start gap-0.5 border-b border-[#D0D5DD] pb-4">
                    <p className="flex-1 text-base font-medium leading-6 text-[#344054]">
                      Additional credits
                      <br />
                      <span className="text-sm font-normal text-[#667085]">
                        ({(extraCredits * unit).toLocaleString()} credits{periodSuffix} · {formatMoney(CREDIT_RATE_MONTHLY)}/ea
                        {annual ? " · 10 mo billed" : ""})
                      </span>
                    </p>
                    <PriceWithList list={annual ? creditList : undefined} pay={creditPay} />
                  </div>
                )}

                {overCap && (
                  <div className="flex items-start gap-0.5 border-b border-[#D0D5DD] pb-4">
                    <p className="flex-1 text-base font-medium leading-6 text-[#344054]">
                      Additional credits
                      <br />
                      <span className="text-sm font-normal text-[#667085]">More than {capLabel} · priced by sales</span>
                    </p>
                    <span className="whitespace-nowrap text-base font-medium leading-6 text-[#475467]">Contact sales</span>
                  </div>
                )}

                {buyerIntent && (
                  <div className="flex items-start gap-0.5 border-b border-[#D0D5DD] pb-4">
                    <p className="flex-1 whitespace-pre-wrap text-base font-medium leading-6 text-[#344054]">
                      Buyer Intent Add-on
                      <br />
                      ($50/mo · $500/yr included)
                    </p>
                    <MoneyParts amount={billing === "annual" ? 500 : 50} />
                  </div>
                )}

                {purchaseSignals && (
                  <div className="flex items-start gap-0.5 border-b border-[#D0D5DD] pb-4">
                    <p className="flex-1 whitespace-pre-wrap text-base font-medium leading-6 text-[#344054]">
                      Purchase Signals Add-on
                      <br />
                      ($50/mo · $500/yr included)
                    </p>
                    <MoneyParts amount={billing === "annual" ? 500 : 50} />
                  </div>
                )}

                <div className="flex items-start gap-0.5">
                  <p className="flex-1 text-base font-medium leading-6 text-[#344054]">
                    Selected plan + Add-on (If any)
                  </p>
                  <MoneyParts amount={selectedSubtotal} />
                </div>

                {billing === "annual" && (
                  <>
                    <div className="flex items-start gap-0.5">
                      <p className="flex-1 text-base font-normal leading-6 text-[#344054]">
                        Annual savings included (pay for only 10 months)
                      </p>
                      <span className="whitespace-nowrap text-lg font-semibold leading-7 text-[#0D7867]">
                        {formatMoney(savings)}
                      </span>
                    </div>
                    {hasBonus && (
                      <div className="flex items-start gap-0.5">
                        <p className="flex-1 text-base font-normal leading-6 text-[#344054]">Bonus credits</p>
                        <span className="text-lg font-semibold leading-7 text-[#0D7867]">+{ANNUAL_BONUS.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-start gap-0.5">
                  <p className="flex-1 text-base font-normal leading-6 text-[#344054]">Estimated tax</p>
                  <MoneyParts amount={0} size="lg" />
                </div>
              </div>

              <div className="border-b border-[#D0D5DD]" />

              <div className="flex items-start gap-0.5">
                <p className="flex-1 text-lg font-semibold leading-7 text-[#344054]">Payable amount</p>
                <span className="whitespace-nowrap text-[#1D2939]">
                  <MoneyParts amount={payable} size="xl" />
                  <span className="text-sm font-medium leading-5">{billing === "monthly" ? "/mo" : "/yr"}</span>
                </span>
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <CheckBox checked={termsAgreed} onChange={setTermsAgreed} />
                <span className="text-sm font-normal leading-5 text-[#667085]">
                  I agree to{" "}
                  <span className="text-[#00A0DC]">Terms and Conditions</span> and authorize recurring
                  charges.
                </span>
              </label>

              {billing === "annual" ? (
                <div className="rounded-lg border border-[#CAE6F9] bg-[#F1F9FD] p-4">
                  <div className="flex items-start gap-2">
                    <svg viewBox="0 0 14 14" className="mt-0.5 size-3.5 shrink-0 text-[#00729F]" fill="none" aria-hidden>
                      <rect x="1.5" y="3.5" width="11" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M1.5 6h11" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    <div className="text-xs font-medium leading-[18px] text-[#00729F]">
                      <p>Annual billing</p>
                      <p className="mt-1 font-normal text-[#475467]">
                        One upfront payment · 12 months access · Only 10 months billed. Auto-renews yearly ·{" "}
                        <span className="font-medium text-[#00729F]">Renews on {renewDate}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-[#CAE6F9] bg-[#F1F9FD] p-4">
                  <div className="flex items-start gap-2">
                    <svg viewBox="0 0 14 14" className="mt-0.5 size-3.5 shrink-0 text-[#00729F]" fill="none" aria-hidden>
                      <rect x="1.5" y="3.5" width="11" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M1.5 6h11" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    <div className="text-xs font-medium leading-[18px] text-[#00729F]">
                      <p>Monthly billing</p>
                      <p className="mt-1 font-normal text-[#475467]">
                        Charged monthly under an annual contract. Auto-renews ·{" "}
                        <span className="font-medium text-[#00729F]">Renews on {renewDate}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => onComplete({ billing, monthlyCredits: credits })}
                disabled={!termsAgreed || overCap}
                className="w-full rounded-lg border border-[#008DC3] bg-[#008DC3] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00729F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Place order
              </button>
              {overCap && (
                <p className="-mt-2 text-center text-xs leading-[18px] text-[#667085]">
                  Orders above {capLabel} are completed with our sales team.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .credit-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 80px;
          outline: none;
        }
        .credit-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 80px;
          background: #008DC3;
          border: 3px solid #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.25);
          cursor: pointer;
        }
        .credit-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 80px;
          background: #008DC3;
          border: 3px solid #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.25);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
