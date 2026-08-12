"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF] p-6">
      <div className="card max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-800 font-[Outfit] mb-2">Terjadi Kesalahan</h2>
        <p className="text-sm text-gray-500 mb-6">Terjadi kesalahan. Silakan coba lagi.</p>
        <button className="btn btn-primary" onClick={reset}>
          <i className="fas fa-refresh"></i> Coba Lagi
        </button>
      </div>
    </div>
  );
}
