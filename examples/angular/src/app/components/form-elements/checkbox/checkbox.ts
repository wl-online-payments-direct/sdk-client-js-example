import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'wl-checkbox',
  imports: [],
  templateUrl: './checkbox.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Checkbox),
      multi: true,
    },
  ],
})
export class Checkbox implements ControlValueAccessor {
  @Input() id!: string;
  @Input() label?: string;

  value = false;
  disabled = false;

  private onChange: (val: boolean) => void = () => {};
  private onTouch: () => void = () => {};

  writeValue(val: boolean | null): void {
    this.value = !!val;
  }

  registerOnChange(fn: (val: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleChange(event: Event): void {
    const next = (event.target as HTMLInputElement).checked;
    this.value = next;
    this.onChange(next);
  }
}
