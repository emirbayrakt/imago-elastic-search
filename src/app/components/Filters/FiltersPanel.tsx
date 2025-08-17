"use client";

import { FiltersState } from "./types";
import { Filter, X, Image as ImageIcon, Trophy } from "lucide-react";
import CollectionButton from "./CollectionButton";

export default function FiltersPanel({
    value,
    onChange,
    toggleDb,
    update,
    clearAll,
}: {
    value: FiltersState;
    onChange: (v: FiltersState) => void;
    toggleDb: (k: "st" | "sp") => void;
    update: (patch: Partial<FiltersState>) => void;
    clearAll: () => void;
}) {
    const stActive = value.db.includes("st");
    const spActive = value.db.includes("sp");

    return (
        <>
            {/* Header (hidden on mobile; MobileSheet has its own header) */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-3">
                <Filter className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-semibold tracking-tight">
                    Filters
                </h3>

                {(value.db.length > 0 || value.start || value.end) && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="ml-auto inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                        aria-label="Clear all filters"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear
                    </button>
                )}
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gray-300" />

            {/* Body */}
            <div className="px-4 py-3">
                {/* Collection */}
                <div className="mb-3">
                    <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                        Collection
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <CollectionButton
                            label="Stock"
                            active={stActive}
                            onClick={() => toggleDb("st")}
                            icon={<ImageIcon className="h-3.5 w-3.5" />}
                        />
                        <CollectionButton
                            label="Sport"
                            active={spActive}
                            onClick={() => toggleDb("sp")}
                            icon={<Trophy className="h-3.5 w-3.5" />}
                        />
                    </div>

                    {value.db.length > 0 && (
                        <button
                            type="button"
                            onClick={() => onChange({ ...value, db: [] })}
                            className="mt-2 text-xs text-gray-600 hover:text-gray-900 underline"
                        >
                            Clear collection
                        </button>
                    )}
                </div>

                {/* Date range */}
                <div>
                    <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                        Date range
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {/* Start */}
                        <label className="group relative flex items-center">
                            <span className="pointer-events-none absolute left-2 top-1.5 text-[11px] uppercase tracking-wide text-gray-500">
                                Start
                            </span>
                            <input
                                type="date"
                                value={value.start ?? ""}
                                onChange={(e) =>
                                    update({
                                        start: e.target.value || undefined,
                                    })
                                }
                                className="w-full border border-gray-300 px-2.5 pt-5 pb-2 text-sm outline-none transition-colors focus:border-gray-400"
                            />
                        </label>

                        {/* End */}
                        <label className="group relative flex items-center">
                            <span className="pointer-events-none absolute left-2 top-1.5 text-[11px] uppercase tracking-wide text-gray-500">
                                End
                            </span>
                            <input
                                type="date"
                                value={value.end ?? ""}
                                onChange={(e) =>
                                    update({ end: e.target.value || undefined })
                                }
                                className="w-full border border-gray-300 px-2.5 pt-5 pb-2 text-sm outline-none transition-colors focus:border-gray-400"
                            />
                        </label>
                    </div>

                    {(value.start || value.end) && (
                        <button
                            type="button"
                            onClick={() =>
                                update({ start: undefined, end: undefined })
                            }
                            className="mt-2 text-xs text-gray-600 hover:text-gray-900 underline"
                        >
                            Clear dates
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
