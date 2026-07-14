import Sidebar from "@/Components/Sidebar";

export default function AuthenticatedLayout({
    header,
    children,
}: {
    header?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen bg-gray-50 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {header && (
                    <header className="bg-white shadow-sm px-6 py-4 border-b border-gray-200">
                        {header}
                    </header>
                )}
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
