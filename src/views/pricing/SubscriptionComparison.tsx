import type { BillingPeriod, CellVal, PlanId } from "../../data/pricingPlans";
import { ADDON_ROWS, COMPARE_SECTIONS, PLANS, resolveTooltip } from "../../data/pricingPlans";

function CheckIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="size-3.5 shrink-0" aria-hidden>
      <circle cx="7" cy="7" r="7" fill="#0BA38C" />
      <path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
      >
        <InfoIcon />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-[60] w-max max-w-[260px] -translate-x-1/2 rounded-md bg-[#1D2939] px-3 py-2 text-center text-xs font-normal leading-[18px] text-white hidden shadow-lg group-hover/tip:block group-focus-within/tip:block"
      >
        {text}
        <span
          className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-[#1D2939]"
          aria-hidden
        />
      </span>
    </span>
  );
}

function SalesToolsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-5 text-[#475467]" aria-hidden>
      <rect x="3" y="4" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="11" y="4" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="3" y="11" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="11" y="11" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function EngagementIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-5 text-[#475467]" aria-hidden>
      <path d="M4 5.5A2.5 2.5 0 016.5 3h7A2.5 2.5 0 0116 5.5v5A2.5 2.5 0 0113.5 13H9l-3.5 3v-3H6.5A2.5 2.5 0 014 10.5v-5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function CustomerSuccessIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-5 text-[#475467]" aria-hidden>
      <path d="M4 12v-2a6 6 0 0112 0v2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M16 13a1.5 1.5 0 01-1.5 1.5h-.5V11h2A1.5 1.5 0 0116 12.5V13zM4 13a1.5 1.5 0 001.5 1.5H6V11H4A1.5 1.5 0 004 12.5V13z" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-5 shrink-0 text-[#1D2939]" aria-hidden>
      <path
        d="M5.75 3.25h8.5L17.25 7.5 10 17.25 2.75 7.5 5.75 3.25z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M2.75 7.5h14.5" stroke="currentColor" strokeWidth="1.35" />
      <path d="M7 3.25L5.5 7.5 10 17.25M13 3.25l1.5 4.25L10 17.25" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function CompareXIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="size-3.5 shrink-0" aria-hidden>
      <circle cx="7" cy="7" r="7" fill="#D92D20" />
      <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AddonChip() {
  return (
    <span className="inline-flex h-6 items-center rounded px-2 text-xs font-medium leading-[18px] text-[#F8F7FF] bg-[#764FD9]">
      Add-on
    </span>
  );
}

function CellValue({ val, rowLabel }: { val: CellVal; rowLabel: string }) {
  if (val === true) return <div className="flex justify-center"><CheckIcon /></div>;
  if (val === false) return <div className="flex justify-center"><CompareXIcon /></div>;
  const tip = resolveTooltip(val, rowLabel);
  return (
    <span className="text-sm font-medium leading-5 text-[#475467] text-center inline-flex items-center gap-1 justify-center">
      {val}
      {tip ? <InfoTip text={tip} /> : null}
    </span>
  );
}

function sectionAccent(title: string) {
  if (title === "Sales tools") return "border-[#D0D5DD]";
  if (title === "Engagement tools") return "border-[#9CD1C2]";
  return "border-[#BEC6E2]";
}

function sectionIcon(title: string) {
  if (title === "Sales tools") return <SalesToolsIcon />;
  if (title === "Engagement tools") return <EngagementIcon />;
  return <CustomerSuccessIcon />;
}

const COMPARE_GRID = {
  gridTemplateColumns: "minmax(220px,1.3fr) repeat(3, minmax(170px,1fr))",
} as const;

/** Option 1 source-of-truth comparison — sticky through Sales/Engagement/Customer success. */
export default function SubscriptionComparison({
  billing,
  onSelectPlan,
}: {
  billing: BillingPeriod;
  onSelectPlan: (planId: Exclude<PlanId, "buy-list">, billing: BillingPeriod) => void;
}) {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-28 pb-12">
      <div className="w-full bg-white rounded-2xl px-4 sm:px-6 lg:px-10 py-2.5 flex flex-col gap-2.5 max-lg:overflow-x-auto">
        <div className="relative max-lg:min-w-[760px]">
          <div
            className="sticky top-0 z-30 grid h-[156px] box-border bg-white border-b border-[#EAECF0]"
            style={COMPARE_GRID}
          >
            <div className="px-6 py-4 flex flex-col justify-center self-stretch max-h-[156px]">
              <div className="px-3 flex flex-col gap-2">
                <h2 className="text-base font-semibold leading-6 text-[#008DC3]">
                  Compare subscription plans
                </h2>
                <p className="text-xs font-normal leading-[18px] text-[#1D2939]">
                  Dig into the details when you need validation pricing cards remain the primary path to choose.
                </p>
              </div>
            </div>
            {(["basic", "pro", "team"] as const).map((id) => {
              const plan = PLANS.find((p) => p.id === id)!;
              const pricing = billing === "monthly" ? plan.monthly : plan.annual;
              return (
                <div
                  key={id}
                  className="min-w-0 px-3 xl:px-6 py-4 flex flex-col justify-center bg-white self-stretch max-h-[156px]"
                >
                  <div className="px-3 flex flex-col items-center gap-4">
                    <div className="flex w-full flex-col items-center gap-1">
                      <p className="w-full text-center text-lg font-medium leading-7 text-[#008DC3]">
                        {plan.name}
                      </p>
                      <p className="w-full text-center text-2xl font-medium leading-8 text-[#1D2939]">
                        ${pricing.display}{pricing.suffix}
                      </p>
                    </div>
                  <button
                    type="button"
                    onClick={() => onSelectPlan(id, billing)}
                    className="w-full rounded-md text-sm font-medium leading-5 bg-white text-[#475467] border border-[#D0D5DD] px-3 py-1.5 hover:bg-[#F9FAFB]"
                  >
                    {plan.cta}
                  </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {COMPARE_SECTIONS.map((section) => (
              <div
                key={section.title}
                className={`border-l-4 ${sectionAccent(section.title)} flex flex-col`}
              >
                <div className="grid h-10 pl-2 border-b border-[#D0D5DD]" style={COMPARE_GRID}>
                  <div className="flex h-10 items-center gap-2">
                    {sectionIcon(section.title)}
                    <span className="text-sm font-semibold leading-5 text-[#1D2939]">{section.title}</span>
                  </div>
                  <div className="bg-[#F9FAFB] h-10 border-l border-[#EAECF0]" />
                  <div className="bg-[#F9FAFB] h-10 border-l border-[#EAECF0]" />
                  <div className="bg-[#F9FAFB] h-10 border-l border-[#EAECF0]" />
                </div>
                {section.rows.map((row) => {
                  const labelTip = row.info ? resolveTooltip(row.label) : undefined;
                  return (
                    <div
                      key={row.label}
                      className="grid min-h-10 pl-2 border-b border-[#D0D5DD]"
                      style={COMPARE_GRID}
                    >
                      <div className="pl-7 pr-2 min-h-10 py-1.5 flex items-center gap-1 text-sm font-normal leading-5 text-[#475467]">
                        {row.label}
                        {labelTip ? <InfoTip text={labelTip} /> : null}
                      </div>
                      <div className="min-w-0 bg-[#F9FAFB] min-h-10 py-1.5 px-3 xl:px-6 flex items-center justify-center overflow-visible border-l border-[#EAECF0]">
                        <CellValue val={row.basic} rowLabel={row.label} />
                      </div>
                      <div className="min-w-0 bg-[#F9FAFB] min-h-10 py-1.5 px-3 xl:px-6 flex items-center justify-center overflow-visible border-l border-[#EAECF0]">
                        <CellValue val={row.pro} rowLabel={row.label} />
                      </div>
                      <div className="min-w-0 bg-[#F9FAFB] min-h-10 py-1.5 px-3 xl:px-6 flex items-center justify-center overflow-visible border-l border-[#EAECF0]">
                        <CellValue val={row.team} rowLabel={row.label} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#F8F7FF] border-l-4 border-[#C9BFFD]">
          <div
            className="grid pl-2"
            style={{ gridTemplateColumns: "minmax(220px,1.3fr) minmax(0,3fr)" }}
          >
            <div className="py-2 flex items-center gap-2">
              <DiamondIcon />
              <span className="text-sm font-semibold leading-5 text-[#1D2939]">Additional Features</span>
              <AddonChip />
            </div>
            <div className="bg-[#F2EFFF]" />
          </div>
          {ADDON_ROWS.map((row) => (
            <div
              key={row.title}
              className="grid pl-2 border-t border-[#C9BFFD]/60"
              style={{ gridTemplateColumns: "minmax(220px,1.3fr) minmax(0,3fr)" }}
            >
              <div className="pl-7 pr-2 py-2 flex flex-col gap-2 justify-center min-h-[49px]">
                <p className="text-sm font-medium leading-5 text-[#475467]">{row.title}</p>
                {row.description ? (
                  <p className="text-xs font-normal leading-[18px] text-[#475467]">{row.description}</p>
                ) : null}
              </div>
              <div className="bg-[#F2EFFF] p-2 flex items-center justify-center">
                <p className="text-sm font-medium leading-5 text-[#475467] text-center">{row.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg px-6 py-4 shadow-[0_1px_1px_rgba(71,84,103,0.03)]">
          <p className="text-base leading-6 text-[#1D2939] text-center">
            <span className="font-semibold">Looking for custom solutions? </span>
            <span className="font-normal">Contact us at </span>
            <a href="tel:8777083844" className="font-semibold text-[#008DC3]">877.708.3844</a>
            <span className="font-normal"> or </span>
            <a href="mailto:genie@data-axle.com" className="font-semibold text-[#008DC3]">genie@data-axle.com</a>
            <span className="font-normal">.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
