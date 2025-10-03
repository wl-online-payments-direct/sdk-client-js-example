export type FieldAttributes = {
    className?: string;
    step?: string;
} & Record<string, any>;

export type Base = {
    id: string;
    label?: string;
    fieldAttrs?: FieldAttributes;
};
