import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import {
  AccountOnFile,
  init,
  OnlinePaymentSdk,
  PaymentContextWithAmount,
  PaymentProduct,
} from 'onlinepayments-sdk-client-js';
import StorageService from '@shared/services/StorageService';
import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormInput } from '../../components/form-elements/input/input';
import { LogoComponent } from '../../components/logo/logo';
import NumberFormatter from '@shared/utilities/NumberFormatter';
import { PaymentValidation } from '../../utilities/payment-validation';
import PaymentProductService from '@shared/services/PaymentProductService';
import { LoaderService } from '../../services/loader-service';

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

  sdk: OnlinePaymentSdk | null = null;
  accountOnFile = signal<AccountOnFile | undefined>(undefined);
  paymentProduct: PaymentProduct | null = null;

  paymentContext: PaymentContextWithAmount | null = StorageService.getPaymentContext();

  isLoading: boolean = true;

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

  constructor(private loader: LoaderService) {
    effect(() => {
      this.form.patchValue({
        cardNumber: this.getCardNumber(),
        cardholderName: this.getCardholderName(),
        expiryDate: this.getExpiryDate(),
      });
    });
  }

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

    const aofId = StorageService.getAccountOnFileId();
    this.accountOnFile.set(this.paymentProduct?.accountsOnFile.find((aof) => aof.id === aofId));

    this.setupValidators();

    this.isLoading = false;
    this.loader.hide();
  }

  ngOnInit() {
    this.initData().catch((error) => console.log(error));
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

    if (paymentRequest.validate().isValid && !!this.form.get('cvv')) {
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
    return this.accountOnFile()?.label ?? '';
  }

  getCardholderName() {
    return this.accountOnFile()?.getValue('cardholderName') ?? '';
  }

  getExpiryDate() {
    const paymentRequest = PaymentRequestUtility.get(
      this.paymentProduct ?? undefined,
      'expiryDate',
      this.accountOnFile()?.getValue('expiryDate'),
    );

    return paymentRequest?.getField('expiryDate').getMaskedValue() ?? '';
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
    return !!this.paymentProduct?.getField(id);
  }
}
