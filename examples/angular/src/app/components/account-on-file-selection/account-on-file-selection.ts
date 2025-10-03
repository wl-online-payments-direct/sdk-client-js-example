import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RadioComponent } from '../form-elements/radio/radio';
import { AccountOnFile } from 'onlinepayments-sdk-client-js';

@Component({
  selector: 'account-on-file-selection',
  standalone: true,
  styles: [':host { display: contents; }'],
  imports: [ReactiveFormsModule, RadioComponent],
  templateUrl: './account-on-file-selection.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOnFileSelection {
  @Input({ required: true }) accountsOnFile!: AccountOnFile[];
  selectedAccountId = signal<string | null>(null);

  @Output() onChange = new EventEmitter<string>();

  isChecked(id: string) {
    return this.selectedAccountId() === id;
  }

  getLabel(account: AccountOnFile) {
    return account.getLabel()?.formattedValue ?? '';
  }

  handleChange(id: string) {
    this.onChange.emit(id);
    this.selectedAccountId.set(id);
  }
}
