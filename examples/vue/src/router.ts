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
