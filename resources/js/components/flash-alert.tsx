import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

export function FlashAlert() {
    const { flash } = usePage().props as {
        flash?: {
            success?: string;
            error?: string;
            status?: string;
            info?: string;
        };
    };

    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

    useEffect(() => {
        if (flash?.success) {
            setMessage({ text: flash.success, type: "success" });
            setVisible(true);
        } else if (flash?.error) {
            setMessage({ text: flash.error, type: "error" });
            setVisible(true);
        } else if (flash?.status) {
            setMessage({ text: flash.status, type: "info" });
            setVisible(true);
        } else if (flash?.info) {
            setMessage({ text: flash.info, type: "info" });
            setVisible(true);
        }
    }, [flash]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible || !message) return null;

    const styles = {
        success: {
            bg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100",
            icon: <FiCheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
        },
        error: {
            bg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100",
            icon: <FiAlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
        },
        info: {
            bg: "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
            icon: <FiInfo className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />,
        },
    }[message.type];

    return (
        <div
            role="status"
            aria-live="polite"
            className={`mb-6 flex items-start justify-between gap-3 p-4 rounded-2xl border shadow-sm transition-all duration-200 ${styles.bg}`}
        >
            <div className="flex items-start gap-3">
                {styles.icon}
                <span className="text-sm font-semibold leading-relaxed">{message.text}</span>
            </div>
            <button
                type="button"
                onClick={() => setVisible(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Tutup notifikasi"
            >
                <FiX className="h-4 w-4" />
            </button>
        </div>
    );
}
