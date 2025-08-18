import { Src } from "./types";
import { lex } from "./text";

// Build 1-grams and 2-grams that start with the given prefix (supports 1 or 2 words)
export function collectCandidates(src: Src, prefixLower: string): string[] {
    const fields = [
        src.title,
        src.headline,
        src.titel,
        src.caption,
        src.summary,
        src.description,
        src.suchtext,
    ].filter(Boolean) as string[];

    const out: string[] = [];
    const hasTwoWordPrefix = prefixLower.includes(" ");
    const prefixParts = hasTwoWordPrefix
        ? prefixLower.split(/\s+/).filter(Boolean)
        : [prefixLower];

    for (const field of fields) {
        const toks = lex(field);

        // indices of real words (min 2 chars like original)
        const wordIdx: number[] = [];
        for (let i = 0; i < toks.length; i++) {
            if (toks[i].isWord && toks[i].lower.length >= 2) wordIdx.push(i);
        }

        for (let wi = 0; wi < wordIdx.length; wi++) {
            const i = wordIdx[wi];
            const t = toks[i];

            if (!hasTwoWordPrefix) {
                if (!t.lower.startsWith(prefixLower)) continue;

                // 1-gram
                if (t.orig) out.push(t.orig);

                // prev + token (backward bigram)
                const prevI = wi > 0 ? wordIdx[wi - 1] : -1;
                if (prevI >= 0) {
                    const phrase = `${toks[prevI].orig} ${t.orig}`.trim();
                    if (phrase) out.push(phrase);
                }

                // token + next (forward bigram)
                const nextI = wi < wordIdx.length - 1 ? wordIdx[wi + 1] : -1;
                if (nextI >= 0) {
                    const phrase = `${t.orig} ${toks[nextI].orig}`.trim();
                    if (phrase) out.push(phrase);
                }
            } else {
                // two-word prefix: need (token + nextWord) to start with both parts
                const nextI = wi < wordIdx.length - 1 ? wordIdx[wi + 1] : -1;
                if (nextI < 0) continue;
                const bigramLower = `${t.lower} ${toks[nextI].lower}`;
                if (
                    !bigramLower.startsWith(
                        `${prefixParts[0]} ${prefixParts[1]}`
                    )
                )
                    continue;

                const phrase = `${t.orig} ${toks[nextI].orig}`.trim();
                if (phrase) out.push(phrase);
            }
        }
    }

    return out;
}
