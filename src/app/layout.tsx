import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Feedback";

export const metadata: Metadata = {
  title: {
    default: "Jurnal Guru — Aplikasi Jurnal Mengajar & Administrasi Guru Gratis",
    template: "%s — Jurnal Guru",
  },
  description:
    "Aplikasi jurnal mengajar gratis untuk guru Indonesia: kelola absensi, nilai, rekap otomatis, LCKH/LKB, dan data siswa dalam satu dashboard. Hemat waktu administrasi, rekap otomatis.",
  metadataBase: new URL("https://guru.cintabuku.site"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Jurnal Guru",
    title: "Jurnal Guru — Aplikasi Jurnal Mengajar & Administrasi Guru Gratis",
    description:
      "Aplikasi jurnal mengajar gratis untuk guru Indonesia: absensi, nilai, jurnal mengajar, LCKH/LKB, dan data siswa dalam satu dashboard yang aman dan mudah digunakan.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jurnal Guru — Aplikasi Jurnal Mengajar & Administrasi Guru Gratis",
    description:
      "Aplikasi jurnal mengajar gratis untuk guru Indonesia: absensi, nilai, jurnal mengajar, LCKH/LKB, dan data siswa dalam satu dashboard yang aman dan mudah digunakan.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
