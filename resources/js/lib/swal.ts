import Swal from "sweetalert2";

const isDark = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

// Basis tampilan agar SweetAlert mengikuti tema aplikasi
export const swalBase = () => ({
    background: isDark() ? "#0f172a" : "#ffffff",
    color: isDark() ? "#e2e8f0" : "#0f172a",
    confirmButtonColor: "#1e40af", // blue-800
    cancelButtonColor: "#64748b", // slate-500
    customClass: { popup: "rounded-2xl" },
});

type ConfirmOptions = {
    title: string;
    text?: string;
    confirmText?: string;
    danger?: boolean;
};

export async function confirmAction({
    title,
    text,
    confirmText = "Ya, lanjutkan",
    danger = false,
}: ConfirmOptions) {
    const result = await Swal.fire({
        ...swalBase(),
        title,
        text,
        icon: danger ? "warning" : "question",
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: "Batal",
        confirmButtonColor: danger ? "#e11d48" : "#1e40af", // rose-600 / blue-800
        reverseButtons: true,
        focusCancel: danger,
    });

    return result.isConfirmed;
}

export function toastSuccess(message: string) {
    Swal.fire({
        ...swalBase(),
        toast: true,
        position: "top-end",
        icon: "success",
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });
}

export function toastError(message: string) {
    Swal.fire({
        ...swalBase(),
        toast: true,
        position: "top-end",
        icon: "error",
        title: message,
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
    });
}
