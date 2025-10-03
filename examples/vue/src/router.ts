import { createRouter, createWebHistory } from 'vue-router';
import SessionPage from './pages/Session/SessionPage.vue';
import PaymentPage from './pages/Payment/PaymentPage.vue';
import { requiresSession } from './guards/sessionGuard.ts';
import CreditCardPage from './pages/CreditCard/CreditCardPage.vue';
import { requiresProduct } from './guards/productGuard.ts';
import { requiresAccountOnFile } from './guards/accountOnFileGuard.ts';
import AccountOnFilePage from './pages/AccountOnFile/AccountOnFilePage.vue';
import FinalizePaymentPage from './pages/FinalizePayment/FinalizePaymentPage.vue';
import { requiresData } from './guards/dataGuard.ts';
import GooglePayPage from './pages/GooglePay/GooglePayPage.vue';
import NotFoundPage from './pages/NotFound/NotFoundPage.vue';

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
        beforeEnter: [requiresSession, requiresProduct]
    },
    {
        path: '/payment/account-on-file',
        name: 'account-on-file',
        component: AccountOnFilePage,
        beforeEnter: [requiresSession, requiresProduct, requiresAccountOnFile]
    },
    {
        path: '/payment/finalize',
        name: 'finalize',
        component: FinalizePaymentPage,
        beforeEnter: [requiresSession, requiresProduct, requiresData]
    },
    {
        path: '/payment/google-pay',
        name: 'google-pay',
        component: GooglePayPage,
        beforeEnter: [requiresSession, requiresProduct]
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
