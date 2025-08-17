"use client";

import { useRef } from "react";

export default function ModalFrame({
    open,
    onClose,
    children,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    const backdropRef = useRef<HTMLDivElement>(null);
    if (!open) return null;

    return (
        <div
            ref={backdropRef}
            onClick={(e) => {
                if (e.target === backdropRef.current) onClose();
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overscroll-none"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-6xl rounded-xl bg-white shadow-2xl ring-1 ring-black/10 max-h-[92vh] flex flex-col">
                {children}
            </div>
        </div>
    );
}
