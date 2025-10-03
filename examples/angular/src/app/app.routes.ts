import { Routes } from '@angular/router';
import { SessionPage } from './pages/session-page/session-page';
import { PaymentPage } from './pages/payment-page/payment-page';
import { CreditCardPage } from './pages/credit-card-page/credit-card-page';
import { AccountOnFilePage } from './pages/account-on-file-page/account-on-file-page';
import { FinalizePaymentPage } from './pages/finalize-payment-page/finalize-payment-page';
import { GooglePayPage } from './pages/google-pay-page/google-pay-page';
import { NotFoundPage } from './pages/not-found-page/not-found-page';
import { Layout } from './components/layout/layout';
import { sessionGuard } from './guards/session-guard';
import { productGuard } from './guards/product-guard';
import { dataGuard } from './guards/data-guard';
import { accountOnFileGuard } from './guards/account-on-file-guard';
import { PageLayout } from './components/layout/page-layout/page-layout';

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        component: PageLayout,
        children: [
          { path: '', component: SessionPage, pathMatch: 'full' },
          {
            path: 'payment',
            component: PaymentPage,
            canActivate: [sessionGuard],
          },
          {
            path: 'payment/credit-card',
            component: CreditCardPage,
            canActivate: [sessionGuard, productGuard],
          },
          {
            path: 'payment/account-on-file',
            component: AccountOnFilePage,
            canActivate: [sessionGuard, productGuard, accountOnFileGuard],
          },
          {
            path: 'payment/finalize',
            component: FinalizePaymentPage,
            canActivate: [sessionGuard, productGuard, dataGuard],
          },
          {
            path: 'payment/google-pay',
            component: GooglePayPage,
            canActivate: [sessionGuard, productGuard],
          },
        ],
      },
      { path: '**', component: NotFoundPage },
    ],
  },
];

export default routes;
