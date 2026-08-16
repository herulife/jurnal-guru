"use client";

const FEATURES: Record<string, { title: string; icon: string; tag: string; desc: string }> = {
  nilai: { title: "Input Nilai", icon: "fa-square-pen", tag: "Pro", desc: "Input nilai tugas, UTS, UAS per siswa lengkap dengan KKM" },
  "rekap-nilai": { title: "Rekap Nilai", icon: "fa-chart-simple", tag: "Pro", desc: "Rekap otomatis nilai seluruh siswa dalam tabel & grafik" },
  kelompok: { title: "Kelompok Belajar", icon: "fa-people-group", tag: "Pro", desc: "Kelompokkan siswa, pantau keaktifan tiap kelompok" },
  lckh: { title: "Generate LCKH", icon: "fa-file-signature", tag: "Premium", desc: "Generate surat LCKH otomatis untuk pegawai" },
  lkb: { title: "Generate LKB", icon: "fa-file-pen", tag: "Premium", desc: "Generate Lembar Kerja Bulanan (LKB) otomatis" },
};

function Row({ head, cells, delay, last }: { head?: boolean; cells: string[]; delay: number; last?: boolean }) {
  return (
    <div
      className={`flex text-[10px] items-center rounded ${head ? "bg-[#0D7C66]/10 font-semibold text-[#0D7C66] py-1.5" : "text-gray-600 py-1.5"} ${last ? "bg-[#E8A317]/15 font-semibold" : ""} fp-row`}
      style={{ animationDelay: `${delay}s` }}
    >
      {cells.map((c, i) => (
        <div key={i} className={`px-1.5 truncate ${i === 0 ? "w-6" : "flex-1 text-center"}`}>{c}</div>
      ))}
    </div>
  );
}

function TableMock({ title }: { title: string }) {
  const rows = [
    ["1", "Anisa Putri", "90", "85", "88", "88"],
    ["2", "Bima Sakti", "75", "80", "78", "78"],
    ["3", "Citra Ayu", "95", "90", "92", "92"],
    ["4", "Dwiki R", "70", "65", "68", "68"],
  ];
  return (
    <div className="rounded-lg border border-[#0D7C66]/15 bg-white p-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-2 h-2 rounded-full bg-[#0D7C66] fp-dot"></div>
        <div className="text-[10px] font-semibold text-[#1A2332]">{title}</div>
        <div className="ml-auto text-[8px] text-gray-400">termutakhir otomatis</div>
      </div>
      <Row head cells={["#", "Nama", "Tgs", "UTS", "UAS", "Akhir"]} delay={0} />
      {rows.map((r, i) => (
        <Row key={i} cells={r} delay={0.5 + i * 0.5} last={false} />
      ))}
      <Row cells={["", "Rata-rata", "84", "80", "81", "81"]} delay={2.8} last />
    </div>
  );
}

function BarsMock() {
  const bars = [35, 55, 70, 90, 62, 80, 48];
  return (
    <div className="rounded-lg border border-[#0D7C66]/15 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-2 h-2 rounded-full bg-[#E8A317] fp-dot" style={{ animationDelay: "0.4s" }}></div>
        <div className="text-[10px] font-semibold text-[#1A2332]">Grafik Rata-rata per Kelas</div>
      </div>
      <div className="flex items-end gap-1.5 h-16">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#0D7C66] to-[#34d399] fp-bar" style={{ height: `${h}%`, animationDelay: `${0.4 + i * 0.35}s` }}></div>
        ))}
      </div>
      <div className="flex justify-between mt-1.5 text-[8px] text-gray-400">
        {["K7A", "K7B", "K8A", "K8B", "K9A", "K9B", "K10"].map((k, i) => (
          <span key={i}>{k}</span>
        ))}
      </div>
    </div>
  );
}

function GroupMock() {
  return (
    <div className="rounded-lg border border-[#0D7C66]/15 bg-white p-2.5 shadow-sm space-y-2">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[#E8A317] fp-dot"></div>
        <div className="text-[10px] font-semibold text-[#1A2332]">Kelompok 1</div>
        <span className="ml-auto text-[8px] bg-[#0D7C66]/10 text-[#0D7C66] px-1.5 rounded-full">aktif</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {["Anisa", "Bima", "Citra", "Dwiki", "Eka", "Farah"].map((n, i) => (
          <span key={n} className="text-[9px] bg-[#0D7C66]/10 text-[#0D7C66] px-2 py-0.5 rounded-full fp-slide" style={{ animationDelay: `${0.3 + i * 0.3}s` }}>{n}</span>
        ))}
      </div>
      <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
        <div className="w-2 h-2 rounded-full bg-[#0D7C66] fp-dot" style={{ animationDelay: "1.2s" }}></div>
        <div className="text-[10px] font-semibold text-[#1A2332]">Kelompok 2</div>
      </div>
      <div className="flex flex-wrap gap-1">
        {["Gilang", "Hana", "Intan", "Joko"].map((n, i) => (
          <span key={n} className="text-[9px] bg-[#E8A317]/15 text-[#92620a] px-2 py-0.5 rounded-full fp-slide" style={{ animationDelay: `${1.6 + i * 0.3}s` }}>{n}</span>
        ))}
      </div>
    </div>
  );
}

function DocMock({ stamp }: { stamp: string }) {
  return (
    <div className="rounded-lg border border-[#0D7C66]/15 bg-white p-3 shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-2 h-2 rounded-full bg-[#0D7C66] fp-dot"></div>
        <div className="text-[10px] font-semibold text-[#1A2332]">{stamp === "VALID" ? "Surat LCKH — siap cetak" : "LKB — siap cetak"}</div>
        <div className="ml-auto text-[8px] text-gray-400">A4 · PDF</div>
      </div>
      <div className="space-y-1.5">
        <div className="h-1.5 w-3/4 bg-gray-200 rounded-full fp-line-grow" style={{ animationDelay: "0.2s" }}></div>
        <div className="h-1.5 w-1/2 bg-gray-100 rounded-full fp-line-grow" style={{ animationDelay: "0.8s" }}></div>
        <div className="h-1.5 w-2/3 bg-gray-100 rounded-full fp-line-grow" style={{ animationDelay: "1.4s" }}></div>
        <div className="h-1.5 w-5/6 bg-gray-100 rounded-full fp-line-grow" style={{ animationDelay: "2s" }}></div>
        <div className="h-1.5 w-1/3 bg-gray-100 rounded-full fp-line-grow" style={{ animationDelay: "2.6s" }}></div>
      </div>
      <div className="flex justify-end mt-3">
        <div className="w-20 h-6 rounded border border-[#0D7C66] text-[#0D7C66] text-[9px] font-bold flex items-center justify-center rotate-[-8deg] fp-stamp">{stamp}</div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#0D7C66]/40 to-transparent fp-blink"></div>
    </div>
  );
}

export default function FeaturePreview({ feature }: { feature: string }) {
  const meta = FEATURES[feature] ?? FEATURES.nilai;
  return (
    <div className="mb-6 text-left">
      <div className="rounded-2xl border border-[#0D7C66]/20 bg-gradient-to-b from-[#0D7C66]/5 to-white shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1A2332]">
          <span className="w-2 h-2 rounded-full bg-[#FF5F57]"></span>
          <span className="w-2 h-2 rounded-full bg-[#FEBC2E]"></span>
          <span className="w-2 h-2 rounded-full bg-[#28C840]"></span>
          <span className="ml-2 text-[11px] text-gray-300 font-medium flex items-center gap-1.5">
            <i className={`fas ${meta.icon} text-[#34d399]`}></i> {meta.title}
          </span>
          <span className="ml-auto flex items-center gap-1 text-[9px] text-[#FEBC2E] bg-[#FEBC2E]/10 px-2 py-0.5 rounded-full font-semibold">
            <i className="fas fa-lock text-[8px]"></i> Paket {meta.tag}
          </span>
        </div>
        <div className="p-4">
          {feature === "rekap-nilai" ? <BarsMock /> : feature === "kelompok" ? <GroupMock /> : feature === "lckh" || feature === "lkb" ? <DocMock stamp={feature === "lckh" ? "VALID" : "LKB"} /> : <TableMock title="Daftar Nilai Siswa" />}
        </div>
      </div>
      <p className="text-[11px] text-gray-500 mt-2.5 flex items-center gap-1.5">
        <i className="fas fa-circle-play text-[#0D7C66]"></i> Ini contoh tampilan {meta.title.toLowerCase()}. Fitur langsung terbuka setelah upgrade.
      </p>
    </div>
  );
}