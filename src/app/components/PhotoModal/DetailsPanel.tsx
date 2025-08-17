"use client";

import {
    BadgeInfo,
    Copy,
    ExternalLink,
    Hash,
    Image as ImageIcon,
    User,
} from "lucide-react";
import { humanAspect } from "./helpers";

export default function DetailsPanel({
    description,
    photographer,
    width,
    height,
    mp,
    paddedId,
    suchtext,
    onCopyId,
    onCopyUrl,
    openImagePageUrl,
}: {
    description?: string;
    photographer?: string;
    width?: number;
    height?: number;
    mp?: number;
    paddedId?: string;
    suchtext?: string;
    onCopyId: () => void;
    onCopyUrl: () => void;
    openImagePageUrl: string;
}) {
    return (
        <div className="md:col-span-2 flex min-h-0 flex-col border-l border-gray-200 md:overflow-y-auto nice-scroll overscroll-contain">
            <div className="p-4 sm:p-5">
                {description && (
                    <div className="mb-3">
                        <div className="mb-1.5 inline-flex items-center gap-1 text-xs uppercase tracking-wide text-gray-500">
                            <BadgeInfo className="h-3.5 w-3.5" />
                            Description
                        </div>
                        <p className="text-sm leading-relaxed text-gray-900 whitespace-pre-wrap">
                            {description}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3 text-sm text-gray-900">
                    {photographer && (
                        <div className="flex items-start gap-2">
                            <User className="mt-0.5 h-4 w-4 text-gray-500" />
                            <div className="min-w-0">
                                <div className="text-xs uppercase tracking-wide text-gray-500">
                                    Photographer
                                </div>
                                <div className="break-words">
                                    {photographer}
                                </div>
                            </div>
                        </div>
                    )}

                    {(width || height) && (
                        <div className="flex items-start gap-2">
                            <ImageIcon className="mt-0.5 h-4 w-4 text-gray-500" />
                            <div className="min-w-0">
                                <div className="text-xs uppercase tracking-wide text-gray-500">
                                    Dimensions
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    {width && height ? (
                                        <>
                                            <span>
                                                {width} × {height}px
                                            </span>
                                            {mp && (
                                                <>
                                                    <span className="text-gray-300">
                                                        •
                                                    </span>
                                                    <span>
                                                        {mp.toFixed(1)} MP
                                                    </span>
                                                </>
                                            )}
                                            <span className="text-gray-300">
                                                •
                                            </span>
                                            <span>
                                                {humanAspect(width, height)}
                                            </span>
                                        </>
                                    ) : (
                                        <span>{width || height}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {paddedId && (
                        <div className="flex items-start gap-2">
                            <Hash className="mt-0.5 h-4 w-4 text-gray-500" />
                            <div className="min-w-0">
                                <div className="text-xs uppercase tracking-wide text-gray-500">
                                    Padded ID
                                </div>
                                <div className="break-words">{paddedId}</div>
                            </div>
                        </div>
                    )}

                    {suchtext && (
                        <div className="flex items-start gap-2">
                            <BadgeInfo className="mt-0.5 h-4 w-4 text-gray-500" />
                            <div className="min-w-0">
                                <div className="text-xs uppercase tracking-wide text-gray-500">
                                    Caption / Keywords
                                </div>
                                <p className="mt-0.5 whitespace-pre-wrap leading-relaxed">
                                    {suchtext}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action row */}
            <div className="mt-auto border-t border-gray-200 px-4 py-3 sm:px-5">
                <div className="flex justify-end flex-wrap items-center gap-2">
                    <button
                        onClick={onCopyId}
                        className="inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs hover:bg-gray-50"
                        title="Copy image ID"
                    >
                        <Copy className="h-3.5 w-3.5" />
                        Copy ID
                    </button>
                    <button
                        onClick={onCopyUrl}
                        className="inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs hover:bg-gray-50"
                        title="Copy image URL"
                    >
                        <Copy className="h-3.5 w-3.5" />
                        Copy URL
                    </button>
                    <a
                        href={openImagePageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs hover:bg-gray-50"
                        title="Open image page"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open
                    </a>
                </div>
            </div>
        </div>
    );
}
