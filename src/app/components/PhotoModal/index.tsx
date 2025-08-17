"use client";

import { useEffect, useState } from "react";
import { formatDateDDMMYYYY, formatDbLabel } from "@/utils";
import ModalFrame from "./ModalFrame";
import CloseButton from "./CloseButton";
import Toast from "./Toast";
import TopBar from "./TopBar";
import MediaView from "./MediaView";
import DetailsPanel from "./DetailsPanel";
import { PhotoModalProps } from "./types";
import { toLarge, toThumb, toNum } from "./helpers";

const BASE_URL_REGEX =
    /^https:\/\/www\.imago-images\.de\/bild\/([^/]+)\/([^/]+)\/s\.jpg$/i;

export default function PhotoModal({
    open,
    doc,
    onClose,
    onPrev,
    onNext,
    hasPrev = false,
    hasNext = false,
}: PhotoModalProps) {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    // Reset image state whenever modal opens or the selected doc changes
    useEffect(() => {
        if (!open || !doc) return;
        setLoaded(false);
        setImgSrc(null);
        const t = setTimeout(() => setImgSrc(toLarge(doc.thumbnailUrl)), 0);
        return () => clearTimeout(t);
    }, [open, doc]);

    // ESC / arrows
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft" && hasPrev && onPrev) onPrev();
            if (e.key === "ArrowRight" && hasNext && onNext) onNext();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, hasPrev, hasNext, onPrev, onNext, onClose]);

    // Early out
    if (!open || !doc) return null;

    // Raw / derived fields
    const raw = (doc.raw ?? {}) as Record<string, unknown>;
    const suchtext =
        typeof raw["suchtext"] === "string"
            ? (raw["suchtext"] as string)
            : undefined;
    const photographer = (raw["fotografen"] as string) || "";
    const width = toNum(raw["breite"]) ?? toNum(raw["width"]);
    const height = toNum(raw["hoehe"]) ?? toNum(raw["height"]);
    const mp = width && height ? (width * height) / 1_000_000 : undefined;
    const bildnummer = (raw["bildnummer"] as string) || doc.mediaId;

    const dbLabel = formatDbLabel(doc.db);
    const niceDate = formatDateDDMMYYYY(doc.date);

    // Canonical page URL
    let openImagePageUrl = doc.thumbnailUrl;
    {
        const m = doc.thumbnailUrl.match(BASE_URL_REGEX);
        if (m) {
            const db = m[1];
            const padded = m[2];
            openImagePageUrl = `https://www.imago-images.de/${db}/${padded}`;
        }
    }

    const blurSrc = doc.thumbnailUrl;
    const aspectRatio = width && height ? `${width}/${height}` : "4/3";

    const copy = async (text: string, doneMsg: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setToast(doneMsg);
            window.setTimeout(() => setToast(null), 1200);
        } catch {
            setToast("Copy failed");
            window.setTimeout(() => setToast(null), 1200);
        }
    };

    return (
        <ModalFrame open={open} onClose={onClose}>
            <CloseButton onClose={onClose} />

            <TopBar
                title={doc.title || "Untitled"}
                dbLabel={dbLabel}
                date={niceDate}
                bildnummer={bildnummer}
                hasPrev={hasPrev}
                hasNext={hasNext}
                onPrev={onPrev}
                onNext={onNext}
            />

            <Toast text={toast ?? ""} />

            {/* Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain nice-scroll">
                <div className="grid grid-cols-1 md:grid-cols-5">
                    <MediaView
                        blurSrc={blurSrc}
                        imgSrc={imgSrc}
                        alt={doc.title || "Photo"}
                        loaded={loaded}
                        setLoaded={setLoaded}
                        onError={() =>
                            setImgSrc((s) =>
                                s ? toThumb(s) : doc.thumbnailUrl
                            )
                        }
                        aspectRatio={aspectRatio}
                    />

                    <DetailsPanel
                        description={doc.description}
                        photographer={photographer}
                        width={width}
                        height={height}
                        mp={mp}
                        paddedId={doc.paddedMediaId}
                        suchtext={suchtext}
                        onCopyId={() => copy(bildnummer, "ID copied")}
                        onCopyUrl={() =>
                            copy(toLarge(doc.thumbnailUrl), "URL copied")
                        }
                        openImagePageUrl={openImagePageUrl}
                    />
                </div>
            </div>
        </ModalFrame>
    );
}
