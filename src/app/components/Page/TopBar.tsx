"use client";

import Link from "next/link";
import SearchBar from "@/app/components/SearchBar";

export default function TopBar({
    qInput,
    setQInput,
    loading,
    onSubmit,
    onClear,
}: {
    qInput: string;
    setQInput: (v: string) => void;
    loading: boolean;
    onSubmit: (picked?: string) => void;
    onClear: () => void;
}) {
    return (
        <div className="flex items-center gap-4 py-4 md:py-6">
            <h1 className="hidden md:block text-xl font-semibold tracking-tight">
                <Link href="/" className="text-xl font-bold">
                    IMAGO
                </Link>
            </h1>
            <div className="flex-1">
                <SearchBar
                    value={qInput}
                    onChange={setQInput}
                    onSubmit={onSubmit}
                    loading={loading}
                    onClear={onClear}
                />
            </div>
        </div>
    );
}
