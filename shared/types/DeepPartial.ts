type DeepPartial<T> = {
    [K in keyof T]?: DeepPartial<T[K]> | undefined;
};

export default DeepPartial;
