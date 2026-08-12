"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className={`rounded-xl shadow-lg p-4 min-w-[300px] border ${
        type === "success" 
          ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
          : "bg-red-50 text-red-800 border-red-200"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className={`fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} text-sm`}></i>
            <span className="text-sm font-medium">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-2"
            aria-label="Tutup pesan"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const show = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const hide = () => setToast(null);

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hide} />
  ) : null;

  return { show, hide, ToastComponent };
}

export function useFormFeedback() {
  const { show, ToastComponent } = useToast();
  
  const handleApiResult = async (
    promise: Promise<{ ok: boolean; msg?: string }>,
    options?: {
      successMessage?: string;
      onSuccess?: () => void;
      onError?: (msg: string) => void;
    }
  ) => {
    try {
      const res = await promise;
      if (res.ok) {
        show(options?.successMessage || "Berhasil disimpan", "success");
        options?.onSuccess?.();
      } else {
        show(res.msg || "Terjadi kesalahan", "error");
        options?.onError?.(res.msg || "Terjadi kesalahan");
      }
      return res;
    } catch {
      show("Koneksi gagal", "error");
      return { ok: false, msg: "Koneksi gagal" };
    }
  };

  return { handleApiResult, ToastComponent, show };
}
