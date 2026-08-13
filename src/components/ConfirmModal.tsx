"use client";

import { useEffect, useState } from "react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

const variantStyles = {
  danger: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const buttonStyles = {
  danger: "bg-red-600 hover:bg-red-700",
  warning: "bg-amber-600 hover:bg-amber-700",
  info: "bg-blue-600 hover:bg-blue-700",
};

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  message,
  confirmText = "Ya",
  cancelText = "Batal",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted || !open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-[#E8E4DC] flex items-center justify-between">
          <h3 id="confirm-title" className="font-bold text-gray-800 font-[Outfit]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"
            aria-label="Tutup"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className={`p-5 ${variantStyles[variant]} rounded-b-xl border-t border-[#E8E4DC]`}>
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
        <div className="p-4 border-t border-[#E8E4DC] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-outline"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`btn ${buttonStyles[variant]}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Memproses...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  variant?: "success" | "error" | "info";
}

const alertStyles = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export function AlertModal({
  open,
  onClose,
  title = "Informasi",
  message,
  variant = "info",
}: AlertModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="alertdialog" aria-modal="true" aria-labelledby="alert-title">
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-[#E8E4DC] flex items-center justify-between">
          <h3 id="alert-title" className="font-bold text-gray-800 font-[Outfit]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"
            aria-label="Tutup"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className={`p-5 ${alertStyles[variant]} rounded-b-xl border-t border-[#E8E4DC]`}>
          <div className="flex items-start gap-3">
            <i className={`fas ${
              variant === "success" ? "fa-check-circle" :
              variant === "error" ? "fa-exclamation-circle" :
              "fa-info-circle"
            } flex-shrink-0 mt-0.5`}></i>
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="p-4 border-t border-[#E8E4DC] flex justify-end">
          <button type="button" onClick={onClose} className="btn btn-primary">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook untuk penggunaan mudah
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    resolve: (v: boolean) => void;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    variant: "danger" | "warning" | "info";
  } | null>(null);

  const confirm = (options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        resolve,
        title: options.title || "Konfirmasi",
        message: options.message,
        confirmText: options.confirmText || "Ya",
        cancelText: options.cancelText || "Batal",
        variant: options.variant || "danger",
      });
    });
  };

  const handleConfirm = () => {
    if (state) {
      state.resolve(true);
      setState(null);
    }
  };

  const handleCancel = () => {
    if (state) {
      state.resolve(false);
      setState(null);
    }
  };

  const ConfirmComponent = state ? (
    <ConfirmModal
      open={state.open}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={state.title}
      message={state.message}
      confirmText={state.confirmText}
      cancelText={state.cancelText}
      variant={state.variant}
    />
  ) : null;

  return { confirm, ConfirmComponent };
}

export function useAlert() {
  const [state, setState] = useState<{
    open: boolean;
    resolve: () => void;
    title: string;
    message: string;
    variant: "success" | "error" | "info";
  } | null>(null);

  const alert = (options: {
    title?: string;
    message: string;
    variant?: "success" | "error" | "info";
  }): Promise<void> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        resolve,
        title: options.title || "Informasi",
        message: options.message,
        variant: options.variant || "info",
      });
    });
  };

  const handleClose = () => {
    if (state) {
      state.resolve();
      setState(null);
    }
  };

  const AlertComponent = state ? (
    <AlertModal
      open={state.open}
      onClose={handleClose}
      title={state.title}
      message={state.message}
      variant={state.variant}
    />
  ) : null;

  return { alert, AlertComponent };
}