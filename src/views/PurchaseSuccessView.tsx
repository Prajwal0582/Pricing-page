interface PurchaseSuccessViewProps {
  onViewList: () => void;
  onNewSearch: () => void;
}

export default function PurchaseSuccessView({ onViewList, onNewSearch }: PurchaseSuccessViewProps) {
  return (
    <div className="flex flex-col h-full items-center justify-center px-6">
      <div className="bg-white border border-[#eaecf0] rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="size-16 bg-[#f6fef9] rounded-full flex items-center justify-center mx-auto mb-5">
          <svg viewBox="0 0 32 32" fill="none" className="size-8 text-[#067647]" stroke="currentColor" strokeWidth="2">
            <path d="M26 10L13 23l-7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-[#1d2939] mb-2">Purchase complete!</h1>
        <p className="text-sm text-[#475467] mb-1">
          Your list of <strong>11,029 Texas restaurants</strong> has been purchased and saved.
        </p>
        <p className="text-sm text-[#475467] mb-6">
          Full contact and business details are now available.
        </p>

        {/* Sample unmasked record */}
        <div className="text-left bg-[#f9fafb] border border-[#eaecf0] rounded-xl p-4 mb-6">
          <p className="text-xs font-medium text-[#475467] mb-2">Sample — now unlocked</p>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-[#1d2939]">{"Pepe's Cantina"}</span>
            <span className="inline-flex items-center gap-1 bg-[#f6fef9] border border-[#abefc6] rounded px-1.5 py-0.5 text-[10px] font-medium text-[#067647]">
              ✓ Verified
            </span>
          </div>
          <p className="text-xs text-[#475467]">Houston, TX · (713) 555-0182</p>
          <p className="text-xs text-[#475467]">Patricia Perez, CEO · patricia@pepescantina.com</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onViewList}
            className="w-full bg-[#016dee] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#0156c4] transition-colors"
          >
            View full list
          </button>
          <button
            onClick={onNewSearch}
            className="w-full border border-[#d0d5dd] text-sm font-medium text-[#344054] py-2.5 rounded-lg hover:bg-[#f2f4f7] transition-colors"
          >
            Start a new search
          </button>
        </div>
      </div>
    </div>
  );
}
