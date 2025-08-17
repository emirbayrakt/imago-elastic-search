"use client";

type Props = {
    message: string;
    onRetry: () => void;
    onClear: () => void;
};

export default function ErrorPanel({ message, onRetry, onClear }: Props) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-900">
            <div className="text-sm font-medium">We couldn’t load results.</div>
            <div className="mt-1 text-sm opacity-90">{message}</div>
            <div className="mt-3 flex items-center gap-2">
                <button
                    onClick={onRetry}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                    Retry
                </button>
                <button
                    onClick={onClear}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                    Clear search
                </button>
            </div>
        </div>
    );
}
