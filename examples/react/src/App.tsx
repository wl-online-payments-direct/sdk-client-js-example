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
