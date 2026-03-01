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
