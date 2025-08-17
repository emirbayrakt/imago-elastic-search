"use client";
import { Loader2 } from "lucide-react";

export default function Spinner({
    className = "h-5 w-5",
}: {
    className?: string;
}) {
    return (
        <Loader2 className={`${className} animate-spin`} aria-hidden="true" />
    );
}
