import Sidebar from "@/Components/Sidebar";
import Dropdown from "@/Components/Dropdown";
import { usePage } from "@inertiajs/react";
import { User, ChevronDown } from "lucide-react";

export default function AuthenticatedLayout({
    header,
    children,
}: {
    header?: React.ReactNode;
    children: React.ReactNode;
}) {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    return (
        <div className="h-screen bg-gray-50 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navbar */}
                <header className="bg-white shadow-sm px-6 py-3 border-b border-gray-200 flex justify-between items-center z-10 relative">
                    <div className="flex-1">
                        {header}
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

                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
