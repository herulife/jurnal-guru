export type InvoiceInfo = {
  paymentId: string;
  planName: string;
  duration: string;
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  date: string;
};

export function invoiceNumber(paymentId: string): string {
  return `JG-${paymentId.slice(0, 8).toUpperCase()}`;
}

export function invoiceWaText(info: InvoiceInfo, status: "pending" | "paid"): string {
  const lines = [
    "*INVOICE " + (status === "paid" ? "LUNAS" : "PESANAN") + " — JURNAL GURU*",
    "------------------------------",
    `No. Invoice : ${invoiceNumber(info.paymentId)}`,
    `Paket       : ${info.planName} (${info.duration})`,
    `Total       : Rp ${info.amount.toLocaleString("id-ID")}`,
    `Status      : ${status === "paid" ? "LUNAS - PAKET AKTIF" : "Menunggu Pembayaran"}`,
    `Tanggal     : ${info.date}`,
    "------------------------------",
    `Transfer ke:`,
    `${info.bankName} ${info.bankAccountNumber}`,
    `a.n. ${info.bankAccountName}`,
    "------------------------------",
    status === "paid"
      ? "Terima kasih sudah berlangganan! Paket kamu sudah aktif."
      : "Setelah transfer, konfirmasi di dashboard dan paket akan aktif maksimal 24 jam.",
    process.env.NEXT_PUBLIC_APP_URL || "https://guru.cintabuku.site",
  ];
  return lines.join("\n");
}

export function invoiceHtml(info: InvoiceInfo, status: "pending" | "paid"): string {
  const badgeColor = status === "paid" ? "#059669" : "#D97706";
  const badgeText = status === "paid" ? "LUNAS - PAKET AKTIF" : "MENUNGGU PEMBAYARAN";
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <div style="text-align:center;margin-bottom:20px">
        <div style="width:56px;height:56px;margin:0 auto 8px;border-radius:16px;
          background:linear-gradient(135deg,#0D7C66,#0A6352);display:flex;align-items:center;justify-content:center">
          <span style="color:#fff;font-size:24px">&#127891;</span>
        </div>
        <h1 style="color:#1A2332;font-size:20px;margin:0">Jurnal Guru</h1>
      </div>
      <div style="background:#fff;border:1px solid #E8E4DC;border-radius:16px;padding:28px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h2 style="color:#1A2332;font-size:17px;margin:0">Invoice ${status === "paid" ? "Pembayaran" : "Pesanan"}</h2>
          <span style="background:${badgeColor}1a;color:${badgeColor};font-size:11px;font-weight:700;
            padding:4px 10px;border-radius:999px">${badgeText}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr><td style="padding:8px 0;color:#718096">No. Invoice</td>
              <td style="padding:8px 0;text-align:right;color:#1A2332;font-weight:600">${invoiceNumber(info.paymentId)}</td></tr>
          <tr><td style="padding:8px 0;color:#718096">Paket</td>
              <td style="padding:8px 0;text-align:right;color:#1A2332;font-weight:600">${info.planName} (${info.duration})</td></tr>
          <tr><td style="padding:8px 0;color:#718096">Tanggal</td>
              <td style="padding:8px 0;text-align:right;color:#1A2332">${info.date}</td></tr>
          <tr><td style="padding:8px 0;color:#718096">Metode</td>
              <td style="padding:8px 0;text-align:right;color:#1A2332">Transfer ${info.bankName}</td></tr>
          <tr><td style="padding:8px 0;color:#718096">No. Rekening</td>
              <td style="padding:8px 0;text-align:right;color:#1A2332;font-weight:600">${info.bankAccountNumber}</td></tr>
          <tr><td style="padding:8px 0;color:#718096">Atas Nama</td>
              <td style="padding:8px 0;text-align:right;color:#1A2332">${info.bankAccountName}</td></tr>
          <tr><td style="padding:12px 0 8px;color:#1A2332;font-weight:700;border-top:1px dashed #E8E4DC">Total</td>
              <td style="padding:12px 0 8px;text-align:right;color:#0D7C66;font-weight:800;font-size:16px;border-top:1px dashed #E8E4DC">
                Rp ${info.amount.toLocaleString("id-ID")}</td></tr>
        </table>
        <p style="color:#4a5568;font-size:13px;line-height:1.6;margin:16px 0 0">
          ${status === "paid"
            ? "Pembayaran kamu sudah diverifikasi. Paket kamu sekarang aktif — terima kasih sudah berlangganan!"
            : "Silakan transfer sesuai nominal di atas, lalu konfirmasi di dashboard. Paket aktif otomatis maksimal 24 jam setelah diverifikasi admin."}
        </p>
      </div>
      <p style="color:#a0aec0;font-size:11px;text-align:center;margin-top:20px">
        &copy; ${new Date().getFullYear()} Jurnal Guru &middot; Dashboard Guru Indonesia
      </p>
    </div>
  `;
}