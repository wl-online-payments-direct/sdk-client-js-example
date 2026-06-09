/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */
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
