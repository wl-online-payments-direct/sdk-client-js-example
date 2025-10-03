import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import {
  AccountOnFile,
  PaymentContextWithAmount,
  PaymentProduct,
  Session,
} from 'onlinepayments-sdk-client-js';
import StorageService from '@shared/services/StorageService';
import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormInput } from '../../components/form-elements/input/input';
import { LogoComponent } from '../../components/logo/logo';
import NumberFormatter from '@shared/utilities/NumberFormatter';
import { PaymentValidation } from '../../utilities/payment-validation';

type AccountOnFilePaymentForm = {
  cardNumber: FormControl<string>;
  cvv: FormControl<string>;
  expiryDate: FormControl<string>;
  cardholderName: FormControl<string>;
};

@Component({
  selector: 'app-account-on-file-selection-page',
  imports: [FormInput, FormsModule, LogoComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './account-on-file-page.html',
  standalone: true,
})
export class AccountOnFilePage {
  router = inject(Router);

  @ViewChild('accountOnFileFormRef', { read: ElementRef })
  accountOnFileFormRef!: ElementRef<HTMLFormElement>;

  session: Session | null = null;
  paymentProduct: PaymentProduct | null = null;
  paymentContext: PaymentContextWithAmount | null = StorageService.getPaymentContext();
  accountOnFile = signal<AccountOnFile | null>(null);

  form = new FormGroup<AccountOnFilePaymentForm>({
    cvv: new FormControl('', { nonNullable: true }),
    cardholderName: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    expiryDate: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    cardNumber: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
  });

  setupValidators() {
    const fields = ['cvv'] as const;
    PaymentValidation.applyValidators(this.form, this.paymentProduct, fields);
  }

  constructor() {
    afterNextRender({ write: () => this.setupValidators() });
    effect(() => {
      this.form.patchValue({
        cardNumber: this.getCardNumber(),
        cardholderName: this.getCardholderName(),
        expiryDate: this.getExpiryDate(),
      });
    });
  }

  ngOnInit() {
    this.session = new Session(StorageService.getSession()!);
    this.paymentProduct = new PaymentProduct(StorageService.getPaymentProduct()!);

    this.accountOnFile.set(
      this.paymentProduct?.accountOnFileById?.[StorageService.getAccountOnFileId()!] ?? null,
    );
  }

  ngOnDestroy() {
    StorageService.clearItem('accountOnFileId');
  }

  handleProcessPayment() {
    this.accountOnFileFormRef.nativeElement.reportValidity();

    const paymentRequest = PaymentRequestUtility.get(
      this.paymentProduct ?? undefined,
      'cvv',
      this.form.getRawValue().cvv,
    )!;

    this.accountOnFile() && paymentRequest.setAccountOnFile(this.accountOnFile());

    if (paymentRequest.isValid() && !!this.form.get('cvv')) {
      StorageService.setPaymentRequest(paymentRequest);

      StorageService.setCardPaymentSpecificData({
        token: this.accountOnFile()!.id,
        cvv: this.form.getRawValue().cvv!,
        paymentProductId: this.paymentProduct!.id,
      });

      void this.router.navigate(['payment/finalize']);
    }
  }

  getCardNumber() {
    return this.accountOnFile()?.getLabel()?.formattedValue ?? '';
  }

  getCardholderName() {
    return this.accountOnFile()?.attributeByKey['cardholderName']?.value ?? '';
  }

  getExpiryDate() {
    const paymentRequest = PaymentRequestUtility.get(
      this.paymentProduct ?? undefined,
      'expiryDate',
      this.accountOnFile()?.attributeByKey?.['expiryDate']?.value,
    );

    return paymentRequest?.getMaskedValue('expiryDate') ?? '';
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

  hasField(id: string): boolean {
    return !!this.paymentProduct?.json?.fields?.some((f) => f.id === id);
  }
}
