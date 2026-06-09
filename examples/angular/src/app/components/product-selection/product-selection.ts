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
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BasicPaymentProduct } from 'onlinepayments-sdk-client-js';
import { RadioComponent } from '../form-elements/radio/radio';

@Component({
  selector: 'product-selection',
  standalone: true,
  styles: [':host { display: contents; }'],
  imports: [ReactiveFormsModule, RadioComponent],
  templateUrl: './product-selection.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSelection {
  products = input.required<BasicPaymentProduct[]>();
  selectedProductId = signal<number | null>(null);

  onChange = output<number>();

  toString = (v: unknown) => (v ?? '').toString();
  isChecked = (id: number) => this.selectedProductId() === id;

  handleChange = (idStr: string) => {
    const id = Number(idStr);
    this.onChange.emit(id);
    this.selectedProductId.set(id);
  };
}
