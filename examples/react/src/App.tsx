import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SessionPage from './pages/Session/SessionPage.tsx';
import PaymentPage from './pages/Payment/PaymentPage.tsx';
import CreditCardPage from './pages/CreditCard/CreditCardPage.tsx';
import Layout from './components/Layout/Layout.tsx';
import NotFoundPage from './pages/NotFound/NotFoundPage.tsx';
import { LoaderProvider } from './components/Loader/Loader.tsx';
import AccountOnFilePage from './pages/AccountOnFile/AccountOnFilePage.tsx';
import FinalizePaymentPage from './pages/FinalizePayment/FinalizePaymentPage.tsx';
import GooglePayPage from './pages/GooglePay/GooglePayPage.tsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { path: '/', element: <SessionPage /> },
            { path: '/payment', element: <PaymentPage /> },
            { path: '/payment/credit-card', element: <CreditCardPage /> },
            { path: '/payment/account-on-file', element: <AccountOnFilePage /> },
            { path: '/payment/finalize', element: <FinalizePaymentPage /> },
            { path: '/payment/google-pay', element: <GooglePayPage /> },

            { path: '*', element: <NotFoundPage /> }
        ]
    }
]);

const App = () => {
    return (
        <LoaderProvider>
            <RouterProvider router={router} />
        </LoaderProvider>
    );
};

export default App;
