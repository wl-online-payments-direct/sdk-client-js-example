export type FieldAttributes = {
    className?: string;
    step?: string;
    [key: string]: string | number | boolean | undefined;
};

export type Base = {
    id: string;
    label?: string;
    disabled?: boolean;
    fieldAttrs?: FieldAttributes;
};
