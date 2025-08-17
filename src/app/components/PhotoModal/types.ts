export type PhotoDoc = {
    id: string;
    title: string;
    description?: string;
    db: string; // 'st' | 'sp' | 'stock' | 'sport'
    thumbnailUrl: string;
    date?: string;
    mediaId: string;
    paddedMediaId: string;
    raw: Record<string, unknown>;
};

export type PhotoModalProps = {
    open: boolean;
    doc?: PhotoDoc | null;
    onClose: () => void;
    onPrev?: () => void;
    onNext?: () => void;
    hasPrev?: boolean;
    hasNext?: boolean;
};
