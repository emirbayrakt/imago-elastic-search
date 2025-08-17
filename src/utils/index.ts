function formatDateDDMMYYYY(iso?: string) {
    if (!iso) return "";
    try {
        return new Date(iso).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return iso;
    }
}

function formatDbLabel(db: string): string {
    const v = (db || "").toLowerCase();
    if (v === "st" || v === "stock") return "Stock";
    if (v === "sp" || v === "sport") return "Sport";
    return v ? v[0]!.toUpperCase() + v.slice(1) : "";
}

export { formatDateDDMMYYYY, formatDbLabel };
