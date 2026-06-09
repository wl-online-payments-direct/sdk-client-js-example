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
    return account.label ?? '';
  }

  handleChange(id: string) {
    this.onChange.emit(id);
    this.selectedAccountId.set(id);
  }
}
