"use client";

import { Loader2 } from "lucide-react";

export const SubmitButton = ({ loading }: { loading: boolean }) => (
    <button
        type="submit"
        className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium border border-gray-900 bg-gray-900 text-white hover:bg-black disabled:opacity-60"
        disabled={loading}
        aria-label="Run search"
    >
        {loading ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching…
            </>
        ) : (
            "Search"
        )}
    </button>
);
