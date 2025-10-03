import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountOnFile, BasicPaymentItem } from 'onlinepayments-sdk-client-js';
import { RadioComponent } from '../form-elements/radio/radio';

type MappedBasicItem = {
  id: number;
  label?: string;
  logo: string;
  accountsOnFile: AccountOnFile[];
};

@Component({
  selector: 'product-selection',
  standalone: true,
  styles: [':host { display: contents; }'],
  imports: [ReactiveFormsModule, RadioComponent],
  templateUrl: './product-selection.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSelection {
  items = input.required<BasicPaymentItem[]>();
  selectedItemId = signal<number | null>(null);

  mappedItems = computed<MappedBasicItem[]>(() =>
    (this.items() ?? []).map((product) => ({
      id: product.id,
      label: product.json.displayHints.label,
      logo: product.json.displayHints.logo,
      accountsOnFile: product.accountsOnFile ?? [],
    })),
  );

  onChange = output<number>();

  toString = (v: unknown) => (v ?? '').toString();
  isChecked = (id: number) => this.selectedItemId() === id;

  handleChange = (idStr: string) => {
    const id = Number(idStr);
    this.onChange.emit(id);
    this.selectedItemId.set(id);
  };
}
