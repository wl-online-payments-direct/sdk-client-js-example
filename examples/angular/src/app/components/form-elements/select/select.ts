import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type Base = {
  id: string;
  label?: string;
  disabled?: boolean;
  classes?: string;
};

export type Option = { label: string; value: string };

type Props = Base & {
  required?: boolean;
  options: Option[];
};

@Component({
  selector: 'wl-select',
  standalone: true,
  imports: [],
  templateUrl: './select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormSelect),
      multi: true,
    },
  ],
})
export class FormSelect implements ControlValueAccessor {
  @Input() label!: Props['label'];
  @Input() id!: Props['id'];
  @Input() options: Props['options'] = [];
  @Input() disabled: Props['disabled'] = false;
  @Input() classes: Base['classes'] = '';

  @Input({ transform: booleanAttribute }) required = false;

  value: string = '';

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(val: string | null): void {
    this.value = val ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  handleChange(event: Event): void {
    const next = (event.target as HTMLSelectElement).value;
    this.value = next;
    this.onChange(next);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
