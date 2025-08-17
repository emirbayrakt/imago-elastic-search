export default function Loading() {
    return (
        <div className="fixed inset-0 grid place-items-center bg-white/70">
            <div className="flex items-center gap-3 text-gray-700">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
                <span className="text-sm font-medium">Loading…</span>
            </div>
        </div>
    );
}
