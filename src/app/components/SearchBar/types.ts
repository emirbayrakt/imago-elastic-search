export type Props = {
    value: string;
    onChange: (v: string) => void;
    onSubmit: (pickedSuggestion?: string) => void;
    onClear?: () => void;
    placeholder?: string;
    loading?: boolean;
};
