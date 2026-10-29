import { useState } from "react";
import type { ListPurchaseContext } from "../types";

interface PurchaseViewProps {
  listName: string;
  isFreemium: boolean;
  purchaseContext?: ListPurchaseContext | null;
  onBack: () => void;
  onComplete: () => void;
}

function formatMoney(amount: number) {
  return amount.toLocaleString("en-US");
}

export default function PurchaseView({
  listName,
  purchaseContext = null,
  onBack,
  onComplete,
}: PurchaseViewProps) {
  const isBuyList = Boolean(purchaseContext);
  const fixedCount = purchaseContext?.resultCount ?? 12931;
  const fixedPrice = purchaseContext?.estimatedPrice ?? 3000;

  const [records, setRecords] = useState(fixedCount);
  const [emailAddon, setEmailAddon] = useState(false);
  const [billingMatch, setBillingMatch] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const maxRecords = isBuyList ? fixedCount : 27468;

  const basePrice = isBuyList ? fixedPrice : 3000;
  const purchaseSignal = isBuyList ? 0 : 390;
  const tax = isBuyList ? 0 : 30;
  const total = basePrice + purchaseSignal + tax;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <div className="flex items-center gap-3 px-6 py-4 shrink-0">
        <button
          onClick={onBack}
          className="text-[#475467] hover:text-[#1d2939] p-1 rounded hover:bg-[#f2f4f7] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="none" className="size-5" stroke="currentColor" strokeWidth="2">
            <path d="M12 5L7 10l5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-[#1d2939]">Checkout</h1>
      </div>

      <div className="flex-1 px-6 pb-10">
        <div className="max-w-[1100px] mx-auto flex gap-8 items-start">
          <div className="flex-1 flex flex-col gap-6">
            {isBuyList ? (
              <div className="border border-[#eaecf0] rounded-xl p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-[#667085] mb-1">One-time purchase</p>
                <h3 className="text-base font-semibold text-[#1d2939]">Buy List</h3>
                <p className="text-sm text-[#475467] mt-1">{purchaseContext?.listName || listName}</p>
                <p className="text-sm text-[#667085] mt-2">
                  {fixedCount.toLocaleString()} qualified leads
                </p>
                {purchaseContext?.query && (
                  <p className="text-xs text-[#98a2b3] mt-2 line-clamp-2">{purchaseContext.query}</p>
                )}
              </div>
            ) : (
              <div className="border border-[#eaecf0] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-[#1d2939]">How many records would you like to buy?</h3>
                  <div className="border border-[#d0d5dd] rounded-lg px-3 py-1.5 text-sm font-medium text-[#1d2939] tabular-nums min-w-[80px] text-center">
                    {records.toLocaleString()}
                  </div>
                </div>
                <input
                  type="range"
                  min={100}
                  max={maxRecords}
                  value={records}
                  onChange={(e) => setRecords(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#008dc3]"
                  style={{
                    background: `linear-gradient(to right, #008dc3 ${((records - 100) / (maxRecords - 100)) * 100}%, #e4e7ec ${((records - 100) / (maxRecords - 100)) * 100}%)`,
                  }}
                />
              </div>
            )}

            {!isBuyList && (
              <div className="border border-[#eaecf0] rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEmailAddon(!emailAddon)}
                      className={`size-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                        emailAddon ? "bg-[#008dc3] border-[#008dc3]" : "bg-white border-[#d0d5dd]"
                      }`}
                    >
                      {emailAddon && (
                        <svg viewBox="0 0 12 12" fill="none" className="size-3" stroke="white" strokeWidth="2">
                          <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span className="text-base font-semibold text-[#1d2939]">Email</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#e6f7f3] text-[#0d7867] border border-[#b8e8d8]">
                      Add-on
                    </span>
                  </div>
                  <span className="text-base font-medium text-[#1d2939]">$ x/record</span>
                </div>
                <p className="text-sm text-[#667085] mt-1.5 ml-8">
                  Enhance your list with email addresses (where available) for more effective outreach.
                </p>
              </div>
            )}

            <div className="border border-[#eaecf0] rounded-xl p-6">
              <h3 className="text-base font-semibold text-[#1d2939] mb-1">Location address</h3>
              <p className="text-sm text-[#667085] mb-5">Please provide us details of your location address.</p>

              <div className="flex flex-col gap-5">
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-[#667085]">Contact name</label>
                  <input
                    type="text"
                    defaultValue="Frank Smith"
                    className="w-full border border-[#d0d5dd] rounded-lg px-4 py-3 text-sm text-[#1d2939] focus:outline-none focus:border-[#008dc3] focus:ring-1 focus:ring-[#008dc3]"
                  />
                </div>
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-[#667085]">Billing Address</label>
                  <input
                    type="text"
                    defaultValue="1800 Owens St"
                    className="w-full border border-[#d0d5dd] rounded-lg px-4 py-3 text-sm text-[#1d2939] focus:outline-none focus:border-[#008dc3] focus:ring-1 focus:ring-[#008dc3]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-[#667085]">City</label>
                    <input
                      type="text"
                      defaultValue="San Francisco"
                      className="w-full border border-[#d0d5dd] rounded-lg px-4 py-3 text-sm text-[#1d2939] focus:outline-none focus:border-[#008dc3] focus:ring-1 focus:ring-[#008dc3]"
                    />
                  </div>
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-[#667085]">State</label>
                    <input
                      type="text"
                      defaultValue="CA"
                      className="w-full border border-[#d0d5dd] rounded-lg px-4 py-3 text-sm text-[#1d2939] focus:outline-none focus:border-[#008dc3] focus:ring-1 focus:ring-[#008dc3]"
                    />
                  </div>
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-[#667085]">ZIP</label>
                    <input
                      type="text"
                      defaultValue="94158"
                      className="w-full border border-[#d0d5dd] rounded-lg px-4 py-3 text-sm text-[#1d2939] focus:outline-none focus:border-[#008dc3] focus:ring-1 focus:ring-[#008dc3]"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setBillingMatch(!billingMatch)}
                    className={`size-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                      billingMatch ? "bg-[#008dc3] border-[#008dc3]" : "bg-white border-[#d0d5dd]"
                    }`}
                  >
                    {billingMatch && (
                      <svg viewBox="0 0 12 12" fill="none" className="size-3" stroke="white" strokeWidth="2">
                        <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className="text-sm text-[#344054]">Billing address same as Location address</span>
                </label>
              </div>
            </div>
          </div>

          <div className="w-[320px] shrink-0 flex flex-col gap-6 sticky top-6">
            <div className="border border-[#eaecf0] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#1d2939] mb-5">Order Summary</h3>

              <div className="flex flex-col gap-3">
                {isBuyList ? (
                  <>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-[#475467] flex-1">
                        Buy List — {fixedCount.toLocaleString()} qualified leads
                      </span>
                      <span className="text-sm text-[#1d2939] font-medium whitespace-nowrap">
                        ${formatMoney(basePrice)}.<sup className="text-[10px]">00</sup>
                      </span>
                    </div>
                    <p className="text-xs text-[#667085]">One-time purchase · No subscription</p>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-[#475467] flex-1">27,468 records (12 months export access)</span>
                      <span className="text-sm text-[#1d2939] font-medium whitespace-nowrap">
                        $3,000.<sup className="text-[10px]">00</sup>
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-[#475467]">Purchase signal</span>
                      <span className="text-sm text-[#1d2939] font-medium">
                        $390.<sup className="text-[10px]">00</sup>
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-[#475467]">Estimated tax</span>
                      <span className="text-sm text-[#1d2939] font-medium">
                        $30.<sup className="text-[10px]">00</sup>
                      </span>
                    </div>
                  </>
                )}

                <div className="border-t border-[#eaecf0] pt-3 mt-1 flex justify-between items-center">
                  <span className="text-base font-semibold text-[#1d2939]">Total</span>
                  <span className="text-base font-semibold text-[#1d2939]">
                    ${formatMoney(total)}.<sup className="text-[10px]">00</sup>
                  </span>
                </div>
              </div>

              <label className="flex items-start gap-2 mt-5 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setTermsAgreed(!termsAgreed)}
                  className={`size-5 shrink-0 rounded border flex items-center justify-center mt-0.5 transition-colors ${
                    termsAgreed ? "bg-[#008dc3] border-[#008dc3]" : "bg-white border-[#d0d5dd]"
                  }`}
                >
                  {termsAgreed && (
                    <svg viewBox="0 0 12 12" fill="none" className="size-3" stroke="white" strokeWidth="2">
                      <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className="text-xs text-[#475467] leading-relaxed">
                  I agree to the Terms of Service and acknowledge this is a one-time purchase.
                </span>
              </label>

              <button
                type="button"
                disabled={!termsAgreed}
                onClick={onComplete}
                className="w-full mt-4 h-11 rounded-lg bg-[#008dc3] text-white text-sm font-semibold hover:bg-[#007aab] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Complete purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
