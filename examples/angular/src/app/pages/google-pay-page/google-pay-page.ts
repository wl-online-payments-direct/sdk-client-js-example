import {
  init,
  OnlinePaymentSdk,
  PaymentContextWithAmount,
  PaymentProduct,
  PaymentRequest,
} from 'onlinepayments-sdk-client-js';
import {
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import StorageService from '@shared/services/StorageService';
import NumberFormatter from '@shared/utilities/NumberFormatter';
import { LogoComponent } from '../../components/logo/logo';
import { Router, RouterLink } from '@angular/router';
import EncryptionService from '@shared/services/EncryptionService';
import PaymentProductService from '@shared/services/PaymentProductService';
import { LoaderService } from '../../services/loader-service';

declare const google: any;

declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'google-pay-page',
  standalone: true,
  templateUrl: './google-pay-page.html',
  imports: [LogoComponent, RouterLink],
})
export class GooglePayPage implements OnInit {
  router = inject(Router);

  @ViewChild('googlePayContainer') container!: ElementRef<HTMLElement>;

  sdk: OnlinePaymentSdk | null = null;
  paymentProduct: PaymentProduct | null = null;

  paymentContext: PaymentContextWithAmount | null = StorageService.getPaymentContext();

  errorMessage = signal('');
  isLoading: boolean = true;

  private paymentsClient!: any;
  private readonly ENVIRONMENT = 'TEST';
  private readonly baseRequest = { apiVersion: 2, apiVersionMinor: 0 };
  private readonly baseAllowedAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];

  constructor(
    private loader: LoaderService,
    private cdr: ChangeDetectorRef,
  ) {}

  async initData(): Promise<void> {
    this.loader.show();

    this.sdk = init(StorageService.getSessionData()!);

    this.paymentProduct = await PaymentProductService.getPaymentProduct(
      this.sdk,
      Number(StorageService.getPaymentProductId()!),
      StorageService.getPaymentContext()!,
    );

    if (!this.paymentProduct) {
      void this.router.navigate(['/payment']);
    }

    if (!window.google?.payments?.api) {
      this.errorMessage.set('Error loading Google Pay.');
      return;
    }

    this.paymentsClient = new google.payments.api.PaymentsClient({
      environment: this.ENVIRONMENT,
    });

    this.isLoading = false;
    this.cdr.detectChanges();

    void this.isGooglePayButtonReady();

    this.loader.hide();
  }

  ngOnInit() {
    this.initData().catch((error) => console.error(error));
  }

  private async isGooglePayButtonReady() {
    const baseCardPaymentMethod = {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: this.baseAllowedAuthMethods,
        allowedCardNetworks: this.paymentProduct?.paymentProduct320SpecificData?.networks,
      },
    };

    try {
      const isReady = await this.paymentsClient.isReadyToPay({
        ...this.baseRequest,
        allowedPaymentMethods: [baseCardPaymentMethod],
      });

      if (isReady.result) {
        const button = this.paymentsClient.createButton({
          onClick: () => this.handleClick(),
          allowedPaymentMethods: [this.getCardPaymentMethod()],
          buttonType: 'long',
          buttonColor: 'black',
        });
        this.container.nativeElement.appendChild(button);
      } else {
        this.errorMessage.set('Google Pay not ready.');
      }
    } catch (error) {
      console.error(error);
    }
  }

  private readonly tokenizationSpecification = computed(() => {
    return {
      type: 'PAYMENT_GATEWAY',
      parameters: {
        gateway:
          this.paymentProduct?.paymentProduct320SpecificData?.gateway?.trim().toLowerCase() ??
          'gateway',
        gatewayMerchantId: 'DemoMerchant',
      },
    } as const;
  });

  private getCardPaymentMethod() {
    const tokenizationSpecification = this.tokenizationSpecification();
    if (!tokenizationSpecification) {
      console.error('Missing tokenization specification');
      return;
    }

    return {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: this.baseAllowedAuthMethods,
        allowedCardNetworks: this.paymentProduct?.paymentProduct320SpecificData?.networks,
      },
      tokenizationSpecification,
    };
  }

  private getPaymentDataRequest() {
    const request: any = {
      ...this.baseRequest,
      allowedPaymentMethods: [this.getCardPaymentMethod()],
      merchantInfo: {
        merchantName: 'DemoMerchant',
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: NumberFormatter.formatAmountForGooglePay(
          this.paymentContext?.amountOfMoney.currencyCode ?? 'EUR',
          this.paymentContext?.amountOfMoney.amount ?? 1000,
        ),
        currencyCode: this.paymentContext?.amountOfMoney.currencyCode,
        countryCode: this.paymentContext?.countryCode,
      },
    };
    return request;
  }

  private async handleClick() {
    try {
      const paymentData = await this.paymentsClient.loadPaymentData(this.getPaymentDataRequest());
      const token = paymentData?.paymentMethodData?.tokenizationData?.token;

      if (!this.paymentProduct) {
        this.errorMessage.set('Payment product not found.');
        return;
      }

      const paymentRequest = new PaymentRequest(this.paymentProduct as PaymentProduct);

      paymentRequest.setValue('encryptedPaymentData', token);

      if (paymentRequest.validate().isValid && !!this.sdk) {
        EncryptionService.encrypt(this.sdk as OnlinePaymentSdk, paymentRequest)
          .then(() => {
            StorageService.setPaymentRequest(paymentRequest);
            void this.router.navigate(['/payment/finalize']);
          })
          .catch((errors) => {
            this.errorMessage.set('Errors: ' + JSON.stringify(errors));
          });
      }
    } catch (error) {
      console.error(error);
    }
  }

  getFormattedAmount() {
    return NumberFormatter.formatAmount(
      this.paymentContext?.amountOfMoney.currencyCode ?? 'EUR',
      this.paymentContext?.amountOfMoney.amount ?? 1000,
    );
  }

  getCurrency() {
    return this.paymentContext?.amountOfMoney.currencyCode;
  }
}
