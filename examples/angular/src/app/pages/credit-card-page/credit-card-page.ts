import { ChangeDetectorRef, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import StorageService from '@shared/services/StorageService';
import { Router, RouterLink } from '@angular/router';
import {
  AmountOfMoney,
  init,
  OnlinePaymentSdk,
  PaymentContextWithAmount,
  PaymentProduct,
  SdkError,
} from 'onlinepayments-sdk-client-js';
import { LogoComponent } from '../../components/logo/logo';
import { FormInput } from '../../components/form-elements/input/input';
import { Checkbox } from '../../components/form-elements/checkbox/checkbox';
import { PaymentValidation } from '../../utilities/payment-validation';
import NumberFormatter from '@shared/utilities/NumberFormatter';
import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';
import EncryptionService from '@shared/services/EncryptionService';
import { AdditionalCardOperations } from '../../components/additional-card-operations/additional-card-operations';
import { LoaderService } from '../../services/loader-service';
import PaymentProductService from '@shared/services/PaymentProductService';

type CreditCardPayment = {
  cardNumber: FormControl<string>;
  cvv: FormControl<string>;
  cardholderName: FormControl<string>;
  expiryDate: FormControl<string>;
  isRecurring: FormControl<boolean>;
};

@Component({
  selector: 'app-credit-card-page',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    LogoComponent,
    FormInput,
    Checkbox,
    AdditionalCardOperations,
    RouterLink,
  ],
  templateUrl: './credit-card-page.html',
  standalone: true,
})
export class CreditCardPage {
  router = inject(Router);

  @ViewChild('creditCardFormRef', { read: ElementRef })
  creditCardFormRef!: ElementRef<HTMLFormElement>;

  sdk: OnlinePaymentSdk | null = null;
  paymentContext: PaymentContextWithAmount | null = StorageService.getPaymentContext();

  paymentProduct: PaymentProduct | null = null;

  isLoading: boolean = true;

  creditCardPayment = new FormGroup<CreditCardPayment>({
    cardNumber: new FormControl('', {
      nonNullable: true,
    }),
    cvv: new FormControl('', { nonNullable: true }),
    cardholderName: new FormControl('', { nonNullable: true }),
    expiryDate: new FormControl('', { nonNullable: true }),
    isRecurring: new FormControl(false, { nonNullable: true }),
  });

  errorMessage = signal('');

  setupValidators() {
    const fields = ['cardNumber', 'cvv', 'cardholderName', 'expiryDate'] as const;
    PaymentValidation.applyValidators(this.creditCardPayment, this.paymentProduct, fields);
  }

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
      return;
    }

    this.isLoading = false;
    this.cdr.detectChanges();

    this.setupValidators();

    this.loader.hide();
  }

  ngOnInit() {
    this.initData().catch((error) => console.log(error));
  }

  getIinDetails(cardNumber: string) {
    return this.sdk
      ?.getIinDetails(cardNumber.replaceAll(' ', '').trim(), StorageService.getPaymentContext()!)
      .catch(() => null);
  }

  handleProcessPayment() {
    this.creditCardFormRef.nativeElement.reportValidity();

    const paymentRequest = PaymentRequestUtility.get(this.paymentProduct ?? undefined);
    paymentRequest?.setTokenize(this.creditCardPayment.getRawValue().isRecurring);

    (['cardNumber', 'expiryDate', 'cvv', 'cardholderName'] as (keyof CreditCardPayment)[]).forEach(
      (key) => {
        if (this.creditCardPayment.contains(key)) {
          paymentRequest?.setValue(key, this.creditCardPayment.get(key)!.getRawValue());
        }
      },
    );

    if (paymentRequest?.validate().isValid) {
      this.getIinDetails(this.creditCardPayment.getRawValue()['cardNumber'])
        ?.then((details) => {
          if (details?.paymentProductId !== this.paymentProduct?.id) {
            throw Error(`Entered card is not for ${this.paymentProduct?.label}`);
          }
          EncryptionService.encrypt(this.sdk as OnlinePaymentSdk, paymentRequest)
            .then(() => {
              StorageService.setPaymentRequest(paymentRequest);
              void this.router.navigate(['/payment/finalize']);
            })
            .catch((error: SdkError) => {
              this.errorMessage.set('Errors: ' + JSON.stringify(error.metadata));
            });
        })
        .catch((error: Error) => {
          this.errorMessage.set(error.message);
        });
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

  getAmountOfMoney() {
    return this.paymentContext?.amountOfMoney as AmountOfMoney;
  }

  get hasCvvField(): boolean {
    return !!this.paymentProduct?.getField('cvv');
  }

  hasCardNumberError() {
    return this.creditCardPayment?.controls?.cardNumber.invalid || false;
  }

  getCardNumber() {
    return this.creditCardPayment?.getRawValue().cardNumber ?? '';
  }

  get cardLabel(): string {
    return this.paymentProduct?.label ?? '';
  }

  protected readonly NumberFormatter = NumberFormatter;
}
