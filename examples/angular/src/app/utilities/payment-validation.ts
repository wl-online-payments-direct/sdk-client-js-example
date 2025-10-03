import { PaymentProduct, PaymentRequest } from 'onlinepayments-sdk-client-js';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';

export class PaymentValidation {
  static validate(product: PaymentProduct | null, key: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const request = PaymentRequestUtility.get(product ?? undefined, key, control.value);
      if (!request) {
        return null;
      }

      const ids = (request as PaymentRequest).getErrorMessageIds?.() ?? [];

      return ids.length ? { paymentError: ids } : null;
    };
  }

  static applyValidators(
    form: FormGroup,
    product: PaymentProduct | null,
    fields: readonly string[],
  ): void {
    for (const name of fields) {
      const control = form.get(name);
      if (!control) {
        continue;
      }

      control.setValidators([this.validate(product, name)]);
    }

    form.updateValueAndValidity({ emitEvent: false });
  }
}
