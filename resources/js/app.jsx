import "../css/app.css";

import { hydrateRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { ThemeProvider } from "./components/theme-provider";

// Cek apakah 'window' tersedia sebelum mengaksesnya agar aman saat SSR
const appName =
    typeof window !== "undefined"
        ? window.document.getElementsByTagName("title")[0]?.innerText || "SIPRES Guru"
        : "SIPRES Guru";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.jsx`,
            import.meta.glob("./pages/**/*.jsx"),
        ),
    setup({ el, App, props }) {
        const root = (
            <ThemeProvider>
                <App {...props} />
            </ThemeProvider>
        );

        if (import.meta.env.SSR) {
            return root;
        }
        hydrateRoot(el, root);
    },
    progress: {
        color: "#2563eb",
    },
});
