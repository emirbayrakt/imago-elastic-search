"use client";

export function DesktopSidebar({ children }: { children: React.ReactNode }) {
    return (
        <aside className="hidden lg:block lg:sticky lg:top-4">
            <div className="rounded-none border border-gray-300 bg-white/70 backdrop-blur p-0">
                {children}
            </div>
        </aside>
    );
}
