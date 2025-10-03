import { afterNextRender, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import StorageService from '@shared/services/StorageService';
import { Router, RouterLink } from '@angular/router';
import {
  AmountOfMoneyJSON,
  ErrorResponseJSON,
  PaymentContextWithAmount,
  PaymentProduct,
  Session,
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

  session: Session | null = null;
  paymentProduct: PaymentProduct | null = null;
  paymentContext: PaymentContextWithAmount | null = StorageService.getPaymentContext();

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

  constructor(private loader: LoaderService) {
    afterNextRender({ write: () => this.setupValidators() });
  }

  ngOnInit() {
    this.loader.show();
    this.session = new Session(StorageService.getSession()!);
    this.paymentProduct = new PaymentProduct(StorageService.getPaymentProduct()!);
    this.loader.hide();
  }

  getIinDetails(cardNumber: string) {
    return this.session
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

    if (paymentRequest?.isValid()) {
      this.getIinDetails(this.creditCardPayment.getRawValue()['cardNumber'])
        ?.then((details) => {
          if (details?.paymentProductId !== this.paymentProduct?.id) {
            throw Error(`Entered card is not for ${this.paymentProduct?.json.displayHints.label}`);
          }
          EncryptionService.encrypt(this.session as Session, paymentRequest)
            .then(() => {
              StorageService.setPaymentRequest(paymentRequest);
              void this.router.navigate(['/payment/finalize']);
            })
            .catch((errors: ErrorResponseJSON) => {
              this.errorMessage.set('Errors: ' + JSON.stringify(errors));
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
    return this.paymentContext?.amountOfMoney as AmountOfMoneyJSON;
  }

  hasField(id: string): boolean {
    return !!this.paymentProduct?.json?.fields?.some((f) => f.id === id);
  }

  hasCardNumberError() {
    return this.creditCardPayment?.controls?.cardNumber.invalid || false;
  }

  getCardNumber() {
    return this.creditCardPayment?.getRawValue().cardNumber ?? '';
  }

  protected readonly NumberFormatter = NumberFormatter;
}
