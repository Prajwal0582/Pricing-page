import { useState } from "react";
import type { ListPurchaseContext } from "../types";

interface PurchaseViewProps {
  listName: string;
  isFreemium: boolean;
  purchaseContext?: ListPurchaseContext | null;
  onBack: () => void;
  onComplete: () => void;
  /** "Save up to 30% by subscribing!" → Subscribe opens Pricing. */
  onSubscribe?: () => void;
}

/* Live product rates (Figma S1b / 04, Nov 13): emails $0.45 each, ~5.8% email coverage, SF tax 8.625%. */
const EMAIL_RATE = 0.45;
const EMAIL_COVERAGE = 0.058;
const TAX_RATE = 0.08625;

function money(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function CheckBox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
        checked ? "border-[#008DC3] bg-[#F1F9FD]" : "border-[#D0D5DD] bg-white"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 12 12" fill="none" className="size-3" stroke="#008DC3" strokeWidth="2">
          <path d="M2.5 6l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative">
      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] leading-4 text-[#667085]">{label}</label>
      <input
        type="text"
        defaultValue={value}
        className="w-full rounded-lg border border-[#D0D5DD] px-4 py-2.5 text-sm text-[#1D2939] focus:border-[#008DC3] focus:outline-none focus:ring-1 focus:ring-[#008DC3]"
      />
    </div>
  );
}

function AddonChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-[#764FD9] px-2 py-0.5 text-xs font-medium leading-[18px] text-white">
      <svg viewBox="0 0 20 20" fill="none" className="size-3" aria-hidden>
        <path d="M5.75 3.25h8.5L17.25 7.5 10 17.25 2.75 7.5 5.75 3.25z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M2.75 7.5h14.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      Add-on
    </span>
  );
}

/** List checkout (Figma "S1b / 04 List checkout – Buy list"). */
export default function PurchaseView({ purchaseContext = null, onBack, onComplete, onSubscribe }: PurchaseViewProps) {
  const fixedCount = purchaseContext?.resultCount ?? 12931;
  const fixedPrice = purchaseContext?.estimatedPrice ?? Math.round((12931 * 3000) / 27468);

  const [records, setRecords] = useState(fixedCount);
  const [emailAddon, setEmailAddon] = useState(true);
  const [billingMatch, setBillingMatch] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [emailGuidelines, setEmailGuidelines] = useState(true);
  const minRecords = Math.min(100, fixedCount);
  const maxRecords = Math.max(fixedCount, Math.round(fixedCount * 2.6));

  const recordsPrice = Math.round((fixedPrice * records) / fixedCount);
  const emailRecords = Math.round(records * EMAIL_COVERAGE);
  const emailPrice = emailAddon ? emailRecords * EMAIL_RATE : 0;
  const tax = Math.round((recordsPrice + emailPrice) * TAX_RATE * 100) / 100;
  const payable = recordsPrice + emailPrice + tax;
  const pct = ((records - minRecords) / Math.max(1, maxRecords - minRecords)) * 100;
  const canOrder = termsAgreed && (!emailAddon || emailGuidelines);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white">
      <div className="mx-6 flex shrink-0 items-center gap-3 border-b border-[#EAECF0] py-5">
        <button type="button" onClick={onBack} aria-label="Back" className="rounded p-1 text-[#475467] hover:bg-[#F2F4F7] hover:text-[#1D2939]">
          <svg viewBox="0 0 20 20" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.6">
            <path d="M16 10H4m0 0l5-5m-5 5l5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-xl font-medium leading-[30px] text-[#1D2939]">Checkout</h1>
      </div>

      <div className="flex-1 px-6 pb-10 pt-8">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start gap-10 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {/* How many businesses */}
            <div className="rounded-lg border border-[#D0D5DD] bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-base font-semibold leading-6 text-[#1D2939]">How many businesses would you like to include?</h3>
                <span className="rounded-lg border border-[#D0D5DD] px-2.5 py-1 text-sm tabular-nums text-[#475467]">{records.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={minRecords}
                max={maxRecords}
                value={records}
                onChange={(e) => setRecords(Number(e.target.value))}
                aria-label="Number of businesses"
                className="list-slider mt-5 h-2 w-full cursor-pointer appearance-none rounded-full"
                style={{ background: `linear-gradient(to right, #008DC3 ${pct}%, #BBDEFB ${pct}%)` }}
              />
            </div>

            {/* Email add-on */}
            <div className="rounded-lg border border-[#D0D5DD] bg-white p-4">
              <div className="flex items-center gap-2">
                <CheckBox checked={emailAddon} onChange={setEmailAddon} label="Add email addresses" />
                <span className="text-base font-medium text-[#1D2939]">Email</span>
                <AddonChip />
                <span className="ml-auto text-base font-medium text-[#1D2939]">{money(emailRecords * EMAIL_RATE)}</span>
              </div>
              <p className="mt-2 text-sm text-[#475467]">Enhance your list with email addresses (where available) for more effective outreach.</p>
            </div>

            {/* Location address */}
            <div className="rounded-lg border border-[#D0D5DD] bg-white p-4">
              <h3 className="text-base font-semibold leading-6 text-[#1D2939]">Location address</h3>
              <p className="mb-6 text-xs text-[#475467]">Please provide us details of your location address.</p>
              <div className="flex flex-col gap-4">
                <Field label="Contact name" value="Frank Smith" />
                <Field label="Billing Address" value="1800 Owens St" />
                <div className="grid grid-cols-3 gap-4">
                  <Field label="City" value="San Francisco" />
                  <Field label="State" value="CA" />
                  <Field label="ZIP" value="94158" />
                </div>
                <label className="flex cursor-pointer items-center gap-2">
                  <CheckBox checked={billingMatch} onChange={setBillingMatch} label="Billing address same as Location address" />
                  <span className="text-sm text-[#344054]">Billing address same as Location address</span>
                </label>
              </div>
            </div>

            {/* Need assistance */}
            <div className="flex items-start gap-4 rounded-lg border border-[#D0D5DD] bg-[#F9FAFB] px-6 py-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE] text-lg font-medium text-[#0086C9]">?</span>
              <div>
                <p className="text-base font-semibold text-[#1D2939]">Need assistance refining your list?</p>
                <p className="text-sm text-[#475467]">
                  Contact us at{" "}
                  <a href="tel:8777083844" className="text-[#0086C9] hover:underline">877.708.3844</a> or{" "}
                  <a href="mailto:genie@data-axle.com" className="text-[#0086C9] hover:underline">genie@data-axle.com</a> for additional assistance.
                </p>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[472px]">
            <div className="flex flex-col gap-5 rounded-lg border border-[#D0D5DD] bg-[#F9FAFB] p-6">
              <div>
                <h2 className="text-lg font-semibold leading-7 text-[#344054]">Order Summary</h2>
                <p className="mt-1 text-xs text-[#475467]">One-time purchase · No subscription</p>
              </div>
              <div className="flex flex-col gap-5 text-base text-[#344054]">
                <div className="flex items-start gap-4">
                  <span className="flex-1">{records.toLocaleString()} records (12 months export access)</span>
                  <span className="whitespace-nowrap">{money(recordsPrice)}</span>
                </div>
                {emailAddon && (
                  <div className="flex items-start gap-4">
                    <span className="flex-1">{emailRecords.toLocaleString()} records with emails (12 months export access)</span>
                    <span className="whitespace-nowrap">{money(emailPrice)}</span>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <span className="flex-1">30 days online access to this list</span>
                  <span>Free</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="flex-1">Estimated tax</span>
                  <span className="whitespace-nowrap">{money(tax)}</span>
                </div>
              </div>
              <div className="border-t border-[#D0D5DD]" />
              <div className="flex items-center">
                <span className="flex-1 text-lg font-medium text-[#344054]">Payable amount</span>
                <span className="text-lg font-semibold text-[#1D2939]">{money(payable)}</span>
              </div>
              <div className="flex flex-col gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#667085]">
                  <CheckBox checked={termsAgreed} onChange={setTermsAgreed} label="I agree to the Terms and Conditions" />
                  <span>
                    I agree to the <span className="text-[#00A0DC]">Terms and Conditions</span>
                  </span>
                </label>
                {emailAddon && (
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#667085]">
                    <CheckBox checked={emailGuidelines} onChange={setEmailGuidelines} label="I have read the Released Email Guidelines" />
                    <span>
                      I have read and reviewed the <span className="text-[#00A0DC]">Released Email Guidelines</span>
                    </span>
                  </label>
                )}
              </div>
              <button
                type="button"
                disabled={!canOrder}
                onClick={onComplete}
                className="h-10 w-full rounded-lg bg-[#008DC3] text-sm font-medium text-white transition-colors hover:bg-[#00729F] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Place order
              </button>
              <div className="rounded-lg border border-[#D0D5DD] bg-white p-4">
                <p className="text-base font-semibold text-[#1D2939]">Save up to 30% by subscribing!</p>
                <p className="mt-1 text-xs leading-[18px] text-[#475467]">
                  Get unlimited access to all lists, plus our marketing hub and prospecting features—all designed to help you grow your customer base.
                </p>
                <button
                  type="button"
                  onClick={onSubscribe}
                  className="mt-3 rounded-md border border-[#D0D5DD] bg-white px-3 py-1.5 text-sm font-medium text-[#344054] hover:bg-[#F9FAFB]"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .list-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 9999px; background: #008DC3; border: 3px solid #fff; box-shadow: 0 1px 3px rgba(16,24,40,.2); cursor: pointer; }
        .list-slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 9999px; background: #008DC3; border: 3px solid #fff; cursor: pointer; }
      `}</style>
    </div>
  );
}
