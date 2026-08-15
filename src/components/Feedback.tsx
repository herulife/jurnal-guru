"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  /** Kompatibilitas dengan pemakaian lama; toasts dirender oleh provider global */
  ToastComponent: null;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TYPE_META: Record<ToastType, { icon: string; bar: string; ring: string; iconColor: string; textColor: string }> = {
  success: {
    icon: "fa-circle-check",
    bar: "bg-emerald-500",
    ring: "border-emerald-200",
    iconColor: "text-emerald-500",
    textColor: "text-emerald-800",
  },
  error: {
    icon: "fa-circle-xmark",
    bar: "bg-red-500",
    ring: "border-red-200",
    iconColor: "text-red-500",
    textColor: "text-red-800",
  },
  warning: {
    icon: "fa-triangle-exclamation",
    bar: "bg-amber-500",
    ring: "border-amber-200",
    iconColor: "text-amber-500",
    textColor: "text-amber-800",
  },
  info: {
    icon: "fa-circle-info",
    bar: "bg-sky-500",
    ring: "border-sky-200",
    iconColor: "text-sky-500",
    textColor: "text-sky-800",
  },
};

function ToastItemView({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: () => void;
}) {
  const meta = TYPE_META[toast.type];

  return (
    <div
      role="status"
      className={`toast-item bg-white border ${meta.ring} rounded-xl shadow-xl overflow-hidden pointer-events-auto`}
    >
      <div className="flex items-start gap-3 p-3.5 pr-2.5">
        <i className={`fas ${meta.icon} ${meta.iconColor} text-lg mt-0.5 shrink-0`} aria-hidden="true"></i>
        <p className={`flex-1 text-sm font-medium leading-snug ${meta.textColor} min-w-0`}>{toast.message}</p>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer bg-transparent border-none p-1"
          aria-label="Tutup pesan"
        >
          <i className="fas fa-xmark text-xs"></i>
        </button>
      </div>
      <div className={`toast-progress ${meta.bar}`} style={{ animationDuration: `${toast.duration}ms` }} />
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = ++idRef.current;
      const duration = type === "error" ? 6000 : type === "warning" ? 5500 : 4500;
      setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const showSuccess = useCallback((m: string) => show(m, "success"), [show]);
  const showError = useCallback((m: string) => show(m, "error"), [show]);
  const showWarning = useCallback((m: string) => show(m, "warning"), [show]);
  const showInfo = useCallback((m: string) => show(m, "info"), [show]);

  return (
    <ToastContext.Provider value={{ show, showSuccess, showError, showWarning, showInfo, ToastComponent: null }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col items-end gap-2.5 w-[min(92vw,380px)] pointer-events-none" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast-anim w-full pointer-events-auto">
            <ToastItemView toast={t} onClose={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast harus dipakai di dalam <ToastProvider>");
  }
  return ctx;
}

export function useFormFeedback() {
  const { show } = useToast();

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

  return { handleApiResult, ToastComponent: null, show };
}
