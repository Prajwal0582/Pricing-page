import { useMemo, useState } from "react";
import type { BillingPeriod, PlanId } from "../data/pricingPlans";
import { PLANS } from "../data/pricingPlans";

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

/** Extra credits beyond plan inclusion — $0.10 each per month (prototype rate). */
const CREDIT_RATE_MONTHLY = 0.1;
const CREDIT_MAX = 5000;
const CREDIT_STEP = 50;
const ADDON_MONTHLY = 50;

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

export default function SubscriptionCheckoutView({
  planId,
  billing: initialBilling,
  onBack,
  onComplete,
}: SubscriptionCheckoutViewProps) {
  const plan = PLANS.find((p) => p.id === planId)!;
  const meta = PLAN_META[planId];
  const [billing, setBilling] = useState<BillingPeriod>(initialBilling);
  const [credits, setCredits] = useState<number>(Math.max(meta.includedCredits, meta.includedCredits === 0 ? 500 : meta.includedCredits));
  const [buyerIntent, setBuyerIntent] = useState(false);
  const [purchaseSignals, setPurchaseSignals] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [billingMatch, setBillingMatch] = useState(true);

  const renewDate = useMemo(() => formatRenewDate(addOneYear(new Date())), []);

  const extraCredits = Math.max(0, credits - meta.includedCredits);
  const creditMonthly = extraCredits * CREDIT_RATE_MONTHLY;
  const creditAnnual = creditMonthly * 10;

  const addonCount = (buyerIntent ? 1 : 0) + (purchaseSignals ? 1 : 0);
  const addonMonthly = addonCount * ADDON_MONTHLY;
  const addonAnnual = addonMonthly * 10;

  const planList = billing === "annual" ? meta.annualList : meta.monthly;
  const planPay = billing === "annual" ? meta.annualPay : meta.monthly;
  const savings = billing === "annual" ? meta.annualList - meta.annualPay : 0;

  const creditCharge = billing === "annual" ? creditAnnual : creditMonthly;
  const addonCharge = billing === "annual" ? addonAnnual : addonMonthly;

  const selectedSubtotal = planList + addonCharge + creditCharge;
  const payable = planPay + addonCharge + creditCharge;

  function clampCredits(n: number) {
    const stepped = Math.round(n / CREDIT_STEP) * CREDIT_STEP;
    return Math.min(CREDIT_MAX, Math.max(0, stepped));
  }

  return (
    <div className="h-screen w-full overflow-y-auto bg-[#F9FAFB]">
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
        </div>
      </div>

      <div className="w-full px-6 pb-10 pt-4">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start gap-6 lg:flex-row">
          {/* Left column */}
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {/* Configure credits */}
            <div className="rounded-lg border border-[#D0D5DD] bg-white p-4 shadow-[0_1px_2px_rgba(71,84,103,0.04)]">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-base font-semibold leading-6 text-[#1D2939]">Configure your credits</h2>
                </div>
                <input
                  type="number"
                  min={0}
                  max={CREDIT_MAX}
                  step={CREDIT_STEP}
                  value={credits}
                  onChange={(e) => setCredits(clampCredits(Number(e.target.value) || 0))}
                  className="w-[63px] rounded-lg border border-[#D0D5DD] bg-white px-2 py-1 text-right text-sm font-medium leading-5 text-[#475467] tabular-nums focus:border-[#008DC3] focus:outline-none"
                  aria-label="Credit amount"
                />
              </div>

              <div className="mt-2">
                <input
                  type="range"
                  min={0}
                  max={CREDIT_MAX}
                  step={CREDIT_STEP}
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  className="credit-slider w-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #008DC3 ${(credits / CREDIT_MAX) * 100}%, #BBDEFB ${(credits / CREDIT_MAX) * 100}%)`,
                  }}
                />
              </div>

              <p className="mt-1 text-xs font-normal leading-[18px] text-[#667085]">
                {meta.includedCredits === 0
                  ? "Your selected plan does not include any shared credits. Add credits anytime before checkout"
                  : `Your ${plan.name} plan includes ${meta.includedCredits.toLocaleString()} credits/month. Adjust if you need more.`}
              </p>
            </div>

            {/* Payment plan */}
            <div className="rounded-lg border border-[#D0D5DD] bg-white p-4 shadow-[0_1px_2px_rgba(71,84,103,0.04)]">
              <h2 className="mb-4 text-base font-semibold leading-6 text-[#1D2939]">Payment plan</h2>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={`flex min-h-[108px] flex-1 flex-col items-center justify-center rounded-lg border p-4 text-center transition-colors ${
                    billing === "monthly"
                      ? "border-[#00729F] bg-[#F1F9FD]"
                      : "border-[#D0D5DD] bg-white hover:border-[#98A2B3]"
                  }`}
                >
                  <p className="flex w-full items-start justify-center tracking-tight text-[#1D2939]">
                    <span className="text-[23px] font-semibold leading-[44px]">$</span>
                    <span className="text-[36px] font-semibold leading-[44px]">
                      {meta.monthly.toLocaleString("en-US")}
                    </span>
                    <span className="pt-2 text-lg font-medium leading-7">.00</span>
                    <span className="pt-2.5 text-base font-semibold leading-6">/mo</span>
                  </p>
                  <p className="mt-2 w-full text-sm font-medium leading-5 text-[#475467]">
                    Pay monthly • Annual contract
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setBilling("annual")}
                  className={`flex min-h-[108px] flex-1 flex-col items-center justify-center rounded-lg border p-4 text-center transition-colors ${
                    billing === "annual"
                      ? "border-[#00729F] bg-[#F1F9FD]"
                      : "border-[#D0D5DD] bg-white hover:border-[#98A2B3]"
                  }`}
                >
                  <div className="flex w-full flex-wrap items-center justify-center gap-5">
                    <p className="flex items-end tracking-tight text-[#1D2939] line-through decoration-solid">
                      <span className="text-[12px] font-semibold leading-[44px]">$</span>
                      <span className="text-base font-medium leading-6 self-center">
                        {meta.annualList.toLocaleString("en-US")}
                      </span>
                    </p>
                    <p className="flex items-start tracking-tight text-[#1D2939]">
                      <span className="text-[23px] font-semibold leading-[44px]">$</span>
                      <span className="text-[36px] font-semibold leading-[44px]">
                        {meta.annualPay.toLocaleString("en-US")}
                      </span>
                      <span className="pt-2.5 text-base font-medium leading-6">.00</span>
                    </p>
                  </div>
                  <div className="mt-2 inline-flex h-6 items-center rounded bg-[#F2F9F7] px-2">
                    <p className="text-xs font-medium leading-[18px] text-[#0D7867]">
                      Upfront payment for 10 months + get 1000 bonus credits
                    </p>
                  </div>
                </button>
              </div>
              <p className="mt-4 text-sm font-normal leading-5 text-[#475467]">
                Membership renews <span className="font-medium text-[#1D2939]">{renewDate}</span>
              </p>
            </div>

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
                    ? "Annual contract with upfront payment"
                    : "Annual contract with monthly payment deductions"}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-0.5">
                  <p className="flex-1 text-base font-medium leading-6 text-[#344054]">
                    {plan.name} Plan ({credits.toLocaleString()} credits · {meta.seats} seat
                    {meta.seats > 1 ? "s" : ""})
                  </p>
                  <MoneyParts amount={planList} />
                </div>

                {extraCredits > 0 && (
                  <div className="flex items-start gap-0.5 border-b border-[#D0D5DD] pb-4">
                    <p className="flex-1 text-base font-medium leading-6 text-[#344054]">
                      Additional credits
                      <br />
                      <span className="text-sm font-normal text-[#667085]">
                        ({extraCredits.toLocaleString()} · {formatMoney(CREDIT_RATE_MONTHLY)}/ea
                        {billing === "annual" ? " · 10 mo" : "/mo"})
                      </span>
                    </p>
                    <MoneyParts amount={creditCharge} />
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

                {(buyerIntent || purchaseSignals || extraCredits > 0) && (
                  <div className="flex items-start gap-0.5">
                    <p className="flex-1 text-base font-medium leading-6 text-[#344054]">
                      Selected plan + Add-on (If any)
                    </p>
                    <MoneyParts amount={selectedSubtotal} />
                  </div>
                )}

                {billing === "annual" && (
                  <>
                    <div className="flex items-start gap-0.5">
                      <p className="flex-1 text-base font-normal leading-6 text-[#344054]">
                        Annual savings (pay for only 10 months)
                      </p>
                      <span className="whitespace-nowrap text-lg font-semibold leading-7 text-[#0D7867]">
                        -{formatMoney(savings)}
                      </span>
                    </div>
                    <div className="flex items-start gap-0.5">
                      <p className="flex-1 text-base font-normal leading-6 text-[#344054]">Bonus credits</p>
                      <span className="text-lg font-semibold leading-7 text-[#0D7867]">+1,000</span>
                    </div>
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
                  {billing === "monthly" ? (
                    <span className="text-sm font-medium leading-5">/mo</span>
                  ) : null}
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
                disabled={!termsAgreed}
                className="w-full rounded-lg border border-[#008DC3] bg-[#008DC3] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00729F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start subscription
              </button>

              <div className="flex flex-col items-center gap-1">
                <p className="text-center text-xs font-normal leading-[18px] text-[#98A2B3]">
                  256-bit SSL · PCI DSS · Powered by Stripe
                </p>
                <p className="text-center text-xs font-normal leading-[18px] text-[#98A2B3]">
                  Secure payment powered by Stripe
                </p>
              </div>
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
