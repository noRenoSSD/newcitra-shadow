import Sidebar from "@/Components/Sidebar";
import Dropdown from "@/Components/Dropdown";
import { usePage } from "@inertiajs/react";
import { User, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export default function AuthenticatedLayout({
    header,
    children,
}: {
    header?: React.ReactNode;
    children: React.ReactNode;
}) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const [pageTitle, setPageTitle] = useState("");

    useEffect(() => {
        const updateTitle = () => {
            // Find the first h1 or h2 inside main to use as Topbar title
            const mainEl = document.querySelector("main");
            if (!mainEl) return;
            const h1 = mainEl.querySelector("h1");
            const h2 = mainEl.querySelector("h2");
            const newTitle = (h1?.textContent || h2?.textContent || "").trim();
            if (newTitle) {
                setPageTitle(newTitle);
            }
        };

        // Delay slightly to ensure React has flushed DOM
        const timeout = setTimeout(updateTitle, 50);

        // Observer to detect navigation changes inside main
        const mainEl = document.querySelector("main");
        const observer = new MutationObserver(() => {
            updateTitle();
        });
        
        if (mainEl) {
            observer.observe(mainEl, { childList: true, subtree: true });
        }

        return () => {
            clearTimeout(timeout);
            observer.disconnect();
        };
    }, []);

    return (
        <div className="h-screen bg-gray-50 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navbar */}
                <header className="bg-white shadow-sm px-6 py-4 border-b border-gray-200 flex justify-between items-center z-20 relative">
                    <div className="flex-1 flex items-center">
                        {header ? header : (
                            <h2 className="text-xl font-bold text-red-800">{pageTitle}</h2>
                        )}
                    </div>
                    
                    <div className="flex items-center">
                        <div className="ms-3 relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-2 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:text-gray-900 focus:outline-none transition ease-in-out duration-150"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-800 border border-red-200">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <span className="hidden sm:block font-semibold">{user?.name || 'User'}</span>
                                                <ChevronDown className="ms-1 -me-0.5 h-4 w-4 text-gray-400" />
                                            </div>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-6 py-8 relative z-10">{children}</main>
            </div>
        </div>
    );
}
