"use client";

export const SuggestionItem = ({
    id,
    active,
    label,
    onMouseEnter,
    onMouseLeave,
    onClick,
}: {
    id: string;
    active: boolean;
    label: React.ReactNode;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
}) => {
    return (
        <li
            id={id}
            role="option"
            aria-selected={active}
            onMouseDown={(e) => e.preventDefault()} // keep input focus
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            className={[
                "flex cursor-pointer items-center justify-between px-3 py-2",
                active ? "bg-gray-100" : "hover:bg-gray-50",
            ].join(" ")}
        >
            <div className="truncate w-full flex">{label}</div>
        </li>
    );
};
