import { Outlet } from 'react-router-dom';
import Header from './Header/Header.tsx';

const Layout = () => {
    return (
        <>
            <Header />
            <div id='app' className='flex'>
                <Outlet />
            </div>
        </>
    );
};

export default Layout;
