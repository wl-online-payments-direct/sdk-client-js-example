type DeepPartial<T> = {
    [K in keyof T]?: DeepPartial<T[K]> | undefined;
};

export type { DeepPartial as default };
