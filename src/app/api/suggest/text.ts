import { Tok } from "./types";

// compact whitespace
export const sanitize = (s: string) => s.replace(/\s+/g, " ").trim();

// strip punctuation at edges but keep intra-word hyphens/apostrophes
export function stripPunct(s: string): string {
    return (s || "")
        .replace(/^[^a-z0-9äöüßàáâãäåæçèéêëìíîïñòóôõöøœùúûüýÿ'-]+/i, "")
        .replace(/[^a-z0-9äöüßàáâãäåæçèéêëìíîïñòóôõöøœùúûüýÿ'-]+$/i, "");
}

// break field into alternating tokens (words/spaces/punct), marking word-like chunks
export function lex(field: string): Tok[] {
    const parts = (field || "").split(/(\s+)/);
    return parts
        .filter((p) => p.length > 0)
        .map((p) => {
            const cleaned = stripPunct(p);
            const isWord = /[a-z0-9äöüßàáâãäåæçèéêëìíîïñòóôõöøœùúûüýÿ'-]/i.test(
                cleaned
            );
            return { orig: cleaned || p, lower: cleaned.toLowerCase(), isWord };
        });
}

// Title-case first letter of each word (keep inner apostrophes/hyphens)
export function toNice(s: string): string {
    return s.replace(/\b([a-zäöüßàáâãäåæçèéêëìíîïñòóôõöøœùúûüýÿ])/g, (m) =>
        m.toUpperCase()
    );
}
