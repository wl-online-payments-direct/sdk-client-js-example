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
import { PaymentProduct } from 'onlinepayments-sdk-client-js';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';

export class PaymentValidation {
  static validate(product: PaymentProduct | null, key: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const request = PaymentRequestUtility.get(product ?? undefined, key, control.value);
      if (!request) {
        return null;
      }

      const validationResult = request.validate();

      return !validationResult.isValid ? { paymentError: validationResult.errors } : null;
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
