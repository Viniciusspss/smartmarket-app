import { CommonModule } from '@angular/common';
import { Component, forwardRef, input, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface InputIcon {
  name: string;
  position: 'left' | 'right';
  clickable?: boolean;
}

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel';
export type InputState = 'default' | 'focused' | 'filled' | 'error' | 'disabled';

@Component({
  selector: 'app-custom-input',
  imports: [FormsModule, CommonModule], 
  templateUrl: './custom-input.html',
  styleUrls: ['./custom-input.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true
    }
  ]
})
export class CustomInputComponent implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  type = input<InputType>('text');
  icon = input<InputIcon | undefined>(undefined);
  showClearButton = input<boolean>(false);
  showPasswordToggle = input<boolean>(false);
  errorMessage = input<string>('');
  helperText = input<string>('');
  required = input<boolean>(false);
  disabled = input<boolean>(false); 

  iconClick = output<void>();
  clearClick = output<void>();

  value = '';
  isFocused = false;
  showPassword = false;
  isDisabled = false;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  get inputType(): string {
    if (this.type() === 'password' && this.showPasswordToggle()) {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type();
  }

  get currentInputState(): InputState {
    if (this.isDisabled || this.disabled()) return 'disabled';
    if (this.errorMessage()) return 'error';
    if (this.isFocused) return 'focused';
    if (this.value && this.value.length > 0) return 'filled';
    return 'default';
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onFocus(): void {
    this.isFocused = true;
    this.onTouched();
  }

  onBlur(): void {
    this.isFocused = false;
  }

  onIconClick(): void {
    if (this.icon()?.clickable) {
      this.iconClick.emit();
    }
  }

  onClearClick(): void {
    this.value = '';
    this.onChange('');
    this.clearClick.emit();
  }

  onPasswordToggle(): void {
    this.showPassword = !this.showPassword;
  }
}