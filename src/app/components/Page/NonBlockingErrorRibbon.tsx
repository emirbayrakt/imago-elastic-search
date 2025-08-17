"use client";

export default function NonBlockingErrorRibbon({
    message,
}: {
    message: string;
}) {
    return (
        <div className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-2 rounded bg-red-600/90 px-2 py-1.5 text-xs text-white shadow">
            {message}
        </div>
    );
}
