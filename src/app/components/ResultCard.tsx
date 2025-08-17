"use client";

import Image from "next/image";
import { useState } from "react";
import { formatDateDDMMYYYY, formatDbLabel } from "@/utils";
import {
    Calendar,
    Database,
    Heart,
    Info,
    ZoomIn,
    ImageOff,
} from "lucide-react";

export type CardProps = {
    title: string;
    desc?: string;
    url: string;
    db: string; // 'st' | 'sp' | 'stock' | 'sport'
    date?: string;
    onClick?: () => void;
};

export default function ResultCard({
    title,
    desc,
    url,
    db,
    date,
    onClick,
}: CardProps) {
    const dbLabel = formatDbLabel(db);
    const [loaded, setLoaded] = useState(false);
    const [errored, setErrored] = useState(false);

    return (
        <button
            type="button"
            onClick={onClick}
            className="group relative block w-full aspect-[4/3] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gray/40"
            aria-label={`Open details for ${title || "image"}`}
        >
            {/* Skeleton with Imago branding */}
            {!loaded && (
                <div className="absolute inset-0 overflow-hidden">
                    {/* Shimmering background */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                "linear-gradient(110deg, rgba(30,30,30,0.9) 8%, rgba(60,60,60,0.9) 18%, rgba(30,30,30,0.9) 33%)",
                            backgroundSize: "200% 100%",
                            animation: "imago-shimmer 2.2s linear infinite",
                        }}
                    />

                    {/* Rotating ring behind text */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div
                            className="h-14 w-14 rounded-full border-2 border-white/20"
                            style={{
                                borderTopColor: "transparent",
                                animation:
                                    "imago-rotate-slow 3.5s linear infinite",
                            }}
                        />
                    </div>

                    {/* Centered IMAGO text with breathing effect */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span
                            className="uppercase  text-white font-semibold "
                            style={{
                                animation:
                                    "imago-breath 2.4s ease-in-out infinite",
                            }}
                        >
                            Imago
                        </span>
                    </div>
                </div>
            )}

            {/* Error fallback */}
            {errored && loaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                    <ImageOff className="h-6 w-6" />
                </div>
            )}

            {/* Image */}
            <Image
                src={url}
                alt={title || "Image"}
                fill
                priority={false}
                sizes="(max-width: 768px) 100vw,
               (max-width: 1200px) 50vw,
               33vw"
                onLoadingComplete={() => setLoaded(true)}
                onError={() => {
                    setErrored(true);
                    setLoaded(true);
                }}
                className={[
                    "object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]",
                    loaded && !errored ? "opacity-100" : "opacity-0",
                    "transition-opacity duration-300",
                ].join(" ")}
            />

            {/* Hover controls (top-right) */}
            <div className="pointer-events-none absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="pointer-events-auto inline-flex items-center justify-center rounded bg-black/60 px-1.5 py-1 text-[11px] font-medium text-white">
                    <ZoomIn className="mr-1 h-3 w-3" />
                    View
                </span>
                <span className="pointer-events-auto inline-flex items-center justify-center rounded bg-black/60 px-1.5 py-1 text-[11px] font-medium text-white">
                    <Heart className="mr-1 h-3 w-3" />
                    Save
                </span>
            </div>

            {/* Hover detail overlay (bottom) */}
            <div className="absolute inset-x-0 bottom-0 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="bg-gradient-to-t from-black/75 via-black/30 to-transparent pt-8">
                    <div className="px-2 pb-2 text-left text-white">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center text-[11px] uppercase tracking-wide text-white/80">
                                <Database className="mr-1 h-3 w-3" />
                                {dbLabel}
                            </span>
                            {date && (
                                <span className="inline-flex items-center text-[11px] text-white/80">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {formatDateDDMMYYYY(date) || "Unknown Date"}
                                </span>
                            )}
                        </div>
                        <div className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug">
                            {title || "Untitled"}
                        </div>
                        {desc && (
                            <div className="mt-0.5 line-clamp-1 text-[12px] text-white/80">
                                <Info className="mr-1 inline-block h-3 w-3 align-[-2px]" />
                                {desc}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}
