type FieldAttributes = {
    className?: string;
    step?: string;
};

export type Base = {
    id: string;
    label?: string;
    disabled?: boolean;
    fieldAttrs?: FieldAttributes;
};
