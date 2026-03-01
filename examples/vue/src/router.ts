import { createRouter, createWebHistory } from 'vue-router';
import SessionPage from './pages/Session/SessionPage.vue';
import PaymentPage from './pages/Payment/PaymentPage.vue';
import CreditCardPage from './pages/CreditCard/CreditCardPage.vue';
import AccountOnFilePage from './pages/AccountOnFile/AccountOnFilePage.vue';
import FinalizePaymentPage from './pages/FinalizePayment/FinalizePaymentPage.vue';
import GooglePayPage from './pages/GooglePay/GooglePayPage.vue';
import NotFoundPage from './pages/NotFound/NotFoundPage.vue';
import { requiresContext } from './guards/contextGuard';
import { requiresSession } from './guards/sessionGuard';
import { requiresProduct } from './guards/productGuard';
import { requiresAccountOnFile } from './guards/accountOnFileGuard';
import { requiresData } from './guards/dataGuard';

const routes = [
    {
        path: '/',
        name: 'session',
        component: SessionPage
    },
    {
        path: '/payment',
        name: 'payment',
        component: PaymentPage,
        beforeEnter: [requiresSession]
    },
    {
        path: '/payment/credit-card',
        name: 'credit-card',
        component: CreditCardPage,
        beforeEnter: [requiresSession, requiresContext, requiresProduct]
    },
    {
        path: '/payment/account-on-file',
        name: 'account-on-file',
        component: AccountOnFilePage,
        beforeEnter: [requiresSession, requiresContext, requiresProduct, requiresAccountOnFile]
    },
    {
        path: '/payment/finalize',
        name: 'finalize',
        component: FinalizePaymentPage,
        beforeEnter: [requiresSession, requiresContext, requiresProduct, requiresData]
    },
    {
        path: '/payment/google-pay',
        name: 'google-pay',
        component: GooglePayPage,
        beforeEnter: [requiresSession, requiresContext, requiresProduct]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFoundPage
    }
];

export default createRouter({
    history: createWebHistory('/'),
    routes
});
