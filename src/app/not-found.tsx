"use client";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF] p-6">
      <div className="card max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-map-signs text-yellow-600 text-2xl"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-800 font-[Outfit] mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-gray-500 mb-6">Halaman yang kamu cari tidak ada atau telah dipindahkan.</p>
        <a href="/" className="btn btn-primary inline-flex">
          <i className="fas fa-home"></i> Kembali ke Dashboard
        </a>
      </div>
    </div>
  );
}
