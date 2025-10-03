import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PaymentProduct } from 'onlinepayments-sdk-client-js';
import PaymentRequestUtility from '@shared/utilities/PaymentRequestUtility';

@Component({
  selector: 'wl-input',
  standalone: true,
  templateUrl: './input.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInput),
      multi: true,
    },
  ],
})
export class FormInput implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'url' | 'number' = 'text';
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input() readonly = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input() id = '';
  @Input() ariaLabel = '';
  @Input() hint = '';
  @Input() autofocus = false;
  @Input() step = '1';

  @Input() classes = '';
  @Input() defaultValue = '';
  @Input() maskProduct?: PaymentProduct | null;
  @Input() maskField?: string;

  value = '';

  constructor(private cdr: ChangeDetectorRef) {}

  private onChange: (v: string) => void = () => {};
  private onTouch: () => void = () => {};

  private getInputMask(value: string): string {
    const request = PaymentRequestUtility.get(this.maskProduct!, this.maskField!, value);
    return request?.getMaskedValue?.(this.maskField!) ?? value;
  }

  handleInput(e: Event) {
    const element = e.target as HTMLInputElement;
    const rawValue = element.value ?? '';

    const masked = this.maskField && this.maskProduct ? this.getInputMask(rawValue) : rawValue;

    if (masked !== rawValue) {
      element.value = masked;
    }

    this.value = masked;
    this.onChange(masked);
  }

  handleTouch(): void {
    this.onTouch();
    this.cdr.markForCheck();
  }

  writeValue(value: string | null): void {
    this.value = value ?? this.defaultValue ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  handleBlur(): void {
    this.onTouch();
  }

  protected readonly HTMLInputElement = HTMLInputElement;
}
