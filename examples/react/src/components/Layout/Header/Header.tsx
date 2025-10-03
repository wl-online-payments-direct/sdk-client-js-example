import { Link } from 'react-router-dom';
import ThemeSwitcher from '../../ThemeSwitcher/ThemeSwitcher.tsx';

const Header = () => {
    return (
        <header className='main-header small'>
            <Link className='button link' to='/'>
                Home
            </Link>
            <ThemeSwitcher />
        </header>
    );
};

export default Header;
