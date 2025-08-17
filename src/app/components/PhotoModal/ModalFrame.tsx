"use client";

import { useEffect, useRef } from "react";

export default function ModalFrame({
    open,
    onClose,
    children,
    floating,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    floating?: React.ReactNode;
}) {
    const backdropRef = useRef<HTMLDivElement>(null);

    // Lock page scroll
    useEffect(() => {
        if (!open) return;
        const root = document.documentElement;
        const sbw = window.innerWidth - root.clientWidth;
        root.style.setProperty("--sbw", `${sbw}px`);
        root.classList.add("no-scroll");

        const el = backdropRef.current;
        // Block scroll only when the user wheels/touches *on the backdrop itself*
        const stopIfBackdrop = (e: Event) => {
            if (e.target === el) e.preventDefault();
        };
        el?.addEventListener("wheel", stopIfBackdrop, { passive: false });
        el?.addEventListener("touchmove", stopIfBackdrop, { passive: false });

        return () => {
            el?.removeEventListener("wheel", stopIfBackdrop);
            el?.removeEventListener("touchmove", stopIfBackdrop);
            root.classList.remove("no-scroll");
            root.style.removeProperty("--sbw");
        };
    }, [open]);

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
            <div className="relative w-full max-w-6xl">
                {floating}
                <div className="overflow-hidden relative w-full rounded-xl bg-white shadow-2xl max-h-[92vh] flex flex-col">
                    {children}
                </div>
            </div>
        </div>
    );
}
