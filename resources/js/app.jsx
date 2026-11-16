import "../css/app.css";

import { hydrateRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";

// Cek apakah 'window' tersedia sebelum mengaksesnya agar aman saat SSR
const appName =
    typeof window !== "undefined"
        ? window.document.getElementsByTagName("title")[0]?.innerText || "SIMAG"
        : "SIMAG";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.jsx`,
            import.meta.glob("./pages/**/*.jsx"),
        ),
    setup({ el, App, props }) {
        if (import.meta.env.SSR) {
            return <App {...props} />;
        }
        hydrateRoot(el, <App {...props} />);
    },
    progress: {
        color: "#4b5563",
    },
});
