const CollectionButton = ({
    label,
    active,
    onClick,
    icon,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    count?: number;
    icon: React.ReactNode;
}) => (
    <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        className={[
            "inline-flex items-center gap-2 px-3 py-1.5 text-sm border transition",
            active
                ? "border-black bg-black text-white"
                : "border-gray-300 bg-white text-gray-900 hover:border-gray-400",
        ].join(" ")}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default CollectionButton;
