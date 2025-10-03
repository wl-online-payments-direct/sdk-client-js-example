import { createContext, type ReactNode, useContext, useState } from 'react';

const LoaderContext = createContext({
    show: () => {},
    hide: () => {}
});

type Props = {
    children: ReactNode;
};

export const LoaderProvider = ({ children }: Props) => {
    const [count, setCount] = useState(0);

    const show = () => {
        setCount((c) => c + 1);
    };

    const hide = () => {
        setCount((c) => Math.max(0, c - 1));
    };

    return (
        <LoaderContext.Provider value={{ show, hide }}>
            {children}
            {count > 0 && (
                <div className='loading-overlay'>
                    <div className='loader' />
                </div>
            )}
        </LoaderContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLoader = () => useContext(LoaderContext);
