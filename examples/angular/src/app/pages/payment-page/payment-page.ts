import { Component, ElementRef, inject, signal, ViewChild, WritableSignal } from '@angular/core';
import StorageService from '@shared/services/StorageService';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AccountOnFile, BasicPaymentItems, Session } from 'onlinepayments-sdk-client-js';
import { FormInput } from '../../components/form-elements/input/input';
import { LogoComponent } from '../../components/logo/logo';
import { FormSelect } from '../../components/form-elements/select/select';
import countries from '@shared/constants/countries';
import currencies from '@shared/constants/currencies';
import { ProductSelection } from '../../components/product-selection/product-selection';
import { AccountOnFileSelection } from '../../components/account-on-file-selection/account-on-file-selection';
import { Checkbox } from '../../components/form-elements/checkbox/checkbox';
import { LoaderService } from '../../services/loader-service';

type Error = {
  message?: string;
  status?: number;
};

type PaymentContextForm = {
  amountOfMoney: FormGroup<{
    amount: FormControl<string>;
    currencyCode: FormControl<string>;
  }>;
  countryCode: FormControl<string>;
  isRecurring: FormControl<boolean>;
};

@Component({
  selector: 'app-payment-page',
  imports: [
    FormInput,
    LogoComponent,
    FormSelect,
    ReactiveFormsModule,
    ProductSelection,
    AccountOnFileSelection,
    Checkbox,
  ],
  templateUrl: './payment-page.html',
  styleUrl: './payment-page.css',
  standalone: true,
})
export class PaymentPage {
  router = inject(Router);

  @ViewChild('paymentContextFormRef', { read: ElementRef })
  paymentContextFormRef!: ElementRef<HTMLFormElement>;

  session: Session | null = null;

  paymentContext = new FormGroup<PaymentContextForm>({
    amountOfMoney: new FormGroup({
      amount: new FormControl('1000', { nonNullable: true }),
      currencyCode: new FormControl('EUR', { nonNullable: true }),
    }),
    countryCode: new FormControl('BE', { nonNullable: true }),
    isRecurring: new FormControl(false, { nonNullable: true }),
  });

  countryOptions = countries;
  currencyOptions = currencies;

  errorMessage = signal('');
  isFormExpanded = signal(true);
  paymentMethods: WritableSignal<BasicPaymentItems | null> = signal(null);

  constructor(private loader: LoaderService) {}

  ngOnInit() {
    this.session = new Session(StorageService.getSession()!);
  }

  handleUnauthorizedError(error: Error) {
    if (error?.status === 403) {
      StorageService.clear();
      void this.router.navigate(['/']);
    }
  }

  getContext() {
    return {
      ...this.paymentContext.getRawValue(),
      amountOfMoney: {
        ...this.paymentContext.getRawValue().amountOfMoney,
        amount: Number(this.paymentContext.getRawValue().amountOfMoney.amount),
      },
    };
  }

  handleExpandCollapse() {
    this.isFormExpanded.update((prev) => !prev);
  }

  fetchPaymentProducts() {
    this.loader.show();
    this.session
      ?.getBasicPaymentItems(this.getContext())
      .then((items) => {
        this.paymentMethods.set(items);
        this.errorMessage.set('');
        this.handleExpandCollapse();
      })
      .catch((error: Error) => {
        this.errorMessage.set(error?.message ?? '');
        this.handleUnauthorizedError(error);
        this.paymentMethods.set(null);
      })
      .finally(() => {
        this.loader.hide();
      });
  }

  handleSaveContext() {
    this.paymentContextFormRef.nativeElement.reportValidity();
    if (this.paymentContext.valid) {
      StorageService.setPaymentContext(this.getContext());
      void this.fetchPaymentProducts();
    }
  }

  async setSelectedProduct(productId: number) {
    this.loader.show();
    const paymentProduct = await this.session?.getPaymentProduct(productId, this.getContext());

    if (!paymentProduct) {
      this.errorMessage.set('Payment product not found.');
      return;
    }

    StorageService.setPaymentProduct(paymentProduct.json);
    this.loader.hide();

    return paymentProduct;
  }

  async handleProductChange(id: number) {
    const product = await this.setSelectedProduct(id);

    if (product?.paymentMethod === 'card') {
      void this.router.navigate(['/payment/credit-card']);
    } else if (
      product?.paymentMethod === 'mobile' &&
      product?.displayHints?.label === 'GOOGLEPAY'
    ) {
      void this.router.navigate(['/payment/google-pay']);
    } else {
      this.errorMessage.set('This payment product is not supported in this demo.');
    }
  }

  async handleAccountOnFileChange(id: string) {
    const aof = this.paymentMethods()?.accountOnFileById[id];
    if (aof) {
      const product = await this.setSelectedProduct(aof.paymentProductId);
      StorageService.setAccountOnFileId(id.toString());
      if (product?.paymentMethod === 'card') {
        void this.router.navigate(['/payment/account-on-file']);
      } else {
        this.errorMessage.set('This demo supports only card payment products.');
      }
    }
  }

  getAccountsOnFileById() {
    return Object.values(this.paymentMethods()?.accountOnFileById ?? {}).filter(
      (x): x is AccountOnFile => x !== undefined,
    );
  }
}
