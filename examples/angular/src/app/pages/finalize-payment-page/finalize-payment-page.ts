import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../services/api-service';
import StorageService from '@shared/services/StorageService';
import { Router } from '@angular/router';
import {
  ErrorResponseJSON,
  PaymentContextWithAmount,
  PaymentProduct,
  Session,
} from 'onlinepayments-sdk-client-js';
import { useMockApi } from '../../../config';
import { LogoComponent } from '../../components/logo/logo';
import { LoaderService } from '../../services/loader-service';

type PaymentData = {
  type: 'encrypted' | 'raw';
  data: string;
};

@Component({
  selector: 'app-finalize-payment-page',
  imports: [LogoComponent],
  templateUrl: './finalize-payment-page.html',
  standalone: true,
})
export class FinalizePaymentPage {
  router = inject(Router);
  apiService: ApiService = inject(ApiService);

  session: Session | null = null;
  paymentProduct: PaymentProduct | null = null;
  paymentContext: PaymentContextWithAmount | null = StorageService.getPaymentContext();

  paymentResponse = signal('');
  paymentData = signal<PaymentData | null>(null);
  errorMessage = signal('');

  constructor(private loader: LoaderService) {}

  ngOnInit() {
    this.session = new Session(StorageService.getSession()!);
    this.paymentProduct = new PaymentProduct(StorageService.getPaymentProduct()!);

    if (StorageService.getEncryptedData()) {
      this.paymentData.set({
        type: 'encrypted',
        data: StorageService.getEncryptedData()!,
      });
    } else {
      this.paymentData.set({
        type: 'raw',
        data: JSON.stringify(StorageService.getCardPaymentSpecificData(), null, 2),
      });
    }
  }

  ngOnDestroy() {
    StorageService.clearItem('encryptedData');
    StorageService.clearItem('cardPaymentSpecificData');
  }

  handleRestartSession(): void {
    StorageService.clear();
    void this.router.navigate(['/']);
  }

  async processPayment(): Promise<void> {
    let errorMessage = '';
    this.loader.show();

    this.apiService
      .createPayment({
        ...this.paymentContext,
        ...(StorageService.getCardPaymentSpecificData()
          ? { ...StorageService.getCardPaymentSpecificData()! }
          : { data: StorageService.getEncryptedData()! }),
      })
      .then((response) => {
        this.paymentResponse.set(JSON.stringify(response, null, 2));
      })
      .catch((error: ErrorResponseJSON) => {
        if (error.errors?.length) {
          errorMessage =
            'Errors while submitting the data: ' +
            error.errors.map((error) => error.message).join(', ');
        } else {
          errorMessage = 'There was an error fetching data. Did you start the Mock API?';
        }
      })
      .finally(() => {
        this.errorMessage.set(errorMessage);
        this.loader.hide();
      });
  }

  getPaymentRequestInfo() {
    return JSON.stringify(StorageService.getPaymentRequest(), null, 2);
  }

  protected readonly useMockApi = useMockApi;
  protected readonly StorageService = StorageService;
}
