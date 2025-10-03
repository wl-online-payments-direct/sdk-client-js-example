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
