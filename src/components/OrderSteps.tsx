type OrderStepsProps = {
  step: 1 | 2 | 3;
};

const STEPS = [
  { n: 1, label: "Pilih Paket" },
  { n: 2, label: "Pembayaran" },
  { n: 3, label: "Verifikasi" },
];

export default function OrderSteps({ step }: OrderStepsProps) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto">
      {STEPS.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  done
                    ? "bg-[#0D7C66] border-[#0D7C66] text-white"
                    : active
                      ? "bg-white border-[#0D7C66] text-[#0D7C66] shadow-md"
                      : "bg-white border-[#E8E4DC] text-gray-300"
                }`}
              >
                {done ? <i className="fas fa-check"></i> : s.n}
              </div>
              <span
                className={`text-[11px] font-semibold whitespace-nowrap ${
                  active || done ? "text-[#1A2332]" : "text-gray-300"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 rounded-full mx-2 mb-5 ${
                  done ? "bg-[#0D7C66]" : "bg-[#E8E4DC]"
                }`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
}