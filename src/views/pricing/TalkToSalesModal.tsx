import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";

const SEAT_RANGES = ["6–10", "11–25", "26–50", "50+"];

const MODAL_SHADOW =
  "0px 1px 3px rgba(71,84,103,0.04), 0px 5px 5px rgba(71,84,103,0.03), 0px 11px 7px rgba(71,84,103,0.02), 0px 19px 8px rgba(71,84,103,0.01)";

/**
 * Callback request — one click sends the request; sales calls the account owner.
 * No contact-method choice: we use the details already on the account.
 */
export default function TalkToSalesModal({ onClose }: { onClose: () => void }) {
  const [seats, setSeats] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      data-sales-modal
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="talk-to-sales-title"
        className="w-full max-w-[440px] rounded-xl bg-white animate-fade-in"
        style={{ boxShadow: MODAL_SHADOW }}
      >
        {sent ? (
          <div className="flex flex-col items-center px-8 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#F2F9F7] text-[#026B5C]">
              <FontAwesomeIcon icon={faCircleCheck} className="text-[22px]" />
            </span>
            <p id="talk-to-sales-title" className="mt-4 text-lg font-semibold leading-7 text-[#1D2939]">
              Request sent
            </p>
            <p className="mt-1 text-sm leading-5 text-[#475467]">
              A sales specialist will call you within 1 business day.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-10 rounded-lg border border-[#D0D5DD] bg-white px-4 text-sm font-medium text-[#344054] hover:bg-[#F9FAFB]"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F0F9FF] text-[#008DC3]">
                  <FontAwesomeIcon icon={faPhone} className="text-[16px]" />
                </span>
                <div>
                  <p id="talk-to-sales-title" className="text-lg font-semibold leading-7 text-[#1D2939]">
                    Need more seats?
                  </p>
                  <p className="text-sm leading-5 text-[#475467]">
                    Send a request and our sales team will call you to set up extra seats.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex size-6 shrink-0 items-center justify-center text-[#667085] hover:text-[#1D2939]"
              >
                <FontAwesomeIcon icon={faXmark} className="text-[16px]" />
              </button>
            </div>

            <div className="rounded-lg border border-[#EAECF0] bg-[#F9FAFB] px-3 py-2.5">
              <p className="text-xs font-medium uppercase leading-[18px] text-[#667085]">We&apos;ll reach out to</p>
              <p className="text-sm font-medium leading-5 text-[#1D2939]">Sarah Mitchell</p>
              <p className="text-xs leading-[18px] text-[#475467]">sarah@company.com</p>
            </div>

            <div>
              <p className="text-sm font-medium leading-5 text-[#344054]">
                How many seats? <span className="font-normal text-[#667085]">(optional)</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Seats needed">
                {SEAT_RANGES.map((range) => {
                  const selected = seats === range;
                  return (
                    <button
                      key={range}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSeats(selected ? null : range)}
                      className={`h-8 rounded-lg border px-3 text-sm leading-5 transition-colors ${
                        selected
                          ? "border-[#008DC3] bg-[#F0F9FF] font-medium text-[#00729F]"
                          : "border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      {range}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-medium leading-5 text-[#344054]">
                Anything we should know? <span className="font-normal text-[#667085]">(optional)</span>
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="e.g. Best time to call"
                className="mt-2 w-full resize-none rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm leading-5 text-[#1D2939] placeholder:text-[#98A2B3] focus:border-[#008DC3] focus:outline-none"
              />
            </label>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-lg border border-[#D0D5DD] bg-white px-4 text-sm font-medium text-[#344054] hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setSent(true)}
                className="h-10 rounded-lg border border-[#008DC3] bg-[#008DC3] px-4 text-sm font-medium text-white hover:bg-[#00729F]"
              >
                Request a call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
