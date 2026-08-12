export default function Loading() {
  return (
    <div className="p-6 flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#E8E4DC] border-t-[#0D7C66] rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500">Memuat...</p>
      </div>
    </div>
  );
}
