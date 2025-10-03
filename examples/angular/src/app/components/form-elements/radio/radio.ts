import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-radio',
  standalone: true,
  templateUrl: './radio.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioComponent {
  @Input({ required: true }) name!: string;
  @Input() value = '';
  @Input() label?: string;
  @Input() id?: string;
  @Input() disabled = false;
  @Input() checked = false;
  @Input() classes = '';

  @Output() onChange = new EventEmitter<string>();

  handleChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.checked) this.onChange.emit(this.value);
  }
}
