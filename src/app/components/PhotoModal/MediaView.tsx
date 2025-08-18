"use client";

import Image from "next/image";

export default function MediaView({
    blurSrc,
    imgSrc,
    alt,
    loaded,
    setLoaded,
    onError,
    aspectRatio,
}: {
    blurSrc: string;
    imgSrc: string | null;
    alt: string;
    loaded: boolean;
    setLoaded: (b: boolean) => void;
    onError: () => void;
    aspectRatio: string;
}) {
    return (
        <div className="relative md:col-span-3 bg-gray-50">
            <div
                className="relative mx-auto w-full"
                style={{ aspectRatio, maxHeight: "76vh" }}
            >
                {/* blurred thumb backdrop */}
                <div className="absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        data-testid="blur-backdrop"
                        src={blurSrc}
                        alt=""
                        className="h-full w-full object-contain blur-md opacity-40"
                    />
                </div>

                {imgSrc && (
                    <Image
                        data-testid="main-image"
                        src={imgSrc}
                        alt={alt}
                        fill
                        sizes="(min-width: 768px) 60vw, 100vw"
                        priority
                        placeholder="blur"
                        blurDataURL={blurSrc}
                        onLoad={() => setLoaded(true)}
                        onError={onError}
                        className={[
                            "object-contain transition-opacity duration-300",
                            loaded ? "opacity-100" : "opacity-0",
                        ].join(" ")}
                    />
                )}
            </div>
        </div>
    );
}
