"use client";

export default function SkeletonCard() {
    return (
        <div className="relative block w-full aspect-[4/3] bg-gray-200 overflow-hidden">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]" />
        </div>
    );
}
