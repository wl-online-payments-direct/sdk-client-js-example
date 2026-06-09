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
import { useEffect, useState } from 'react';
import MoonIcon from '../../icons/Moon/MoonIcon.tsx';
import SunIcon from '../../icons/Sun/SunIcon.tsx';

type Theme = 'dark' | 'light';

const ThemeSwitcher = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'light' || savedTheme === 'dark'
            ? savedTheme
            : window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleThemeChange = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <div className='flex row center'>
            <span>Choose theme: </span>
            <button type='button' role='switch' id='theme-switcher' data-value={theme} onClick={handleThemeChange}>
                <span>
                    <MoonIcon className='dark' />
                    <SunIcon className='light' />
                </span>
            </button>
        </div>
    );
};

export default ThemeSwitcher;
