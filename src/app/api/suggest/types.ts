export type Tok = { orig: string; lower: string; isWord: boolean };

export type Src = Partial<
    Record<
        | "title"
        | "headline"
        | "titel"
        | "suchtext"
        | "caption"
        | "summary"
        | "description",
        string
    >
>;
