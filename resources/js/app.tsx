import "../css/app.css";
import "./bootstrap";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"; // Pastikan path ini benar sesuai lokasi file layout kamu
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        // 1. Tambahkan 'async' dan 'await'
        const page = await resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx"),
        );

        // 2. Set Global Layout secara otomatis
        (page as any).default.layout =
            (page as any).default.layout ||
            ((page: React.ReactNode) => (
                <AuthenticatedLayout children={page} />
            ));

        // 3. Return page yang sudah dibungkus layout
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: "#4B5563",
    },
});
