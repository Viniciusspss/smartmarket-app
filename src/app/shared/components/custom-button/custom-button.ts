import { Component, Input, Output, EventEmitter, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-custom-button',
  imports: [CommonModule],
  templateUrl: './custom-button.html',
  styleUrls: ['./custom-button.css'],
})
export class CustomButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<ButtonType>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);
  icon = input<string | undefined>(undefined);
  iconPosition = input<'left' | 'right'>('left');
  customColor = input<string | undefined>(undefined);
  customBackground = input<string | undefined>(undefined);
  customBorder = input<string | undefined>(undefined);

  clicked = output<Event>();

  buttonClasses = computed(() => {
    const classes = [
      'custom-button',
      `custom-button--${this.variant()}`,
      `custom-button--${this.size()}`,
    ];

    if (this.fullWidth()) {
      classes.push('custom-button--full-width');
    }

    if (this.disabled() || this.loading()) {
      classes.push('custom-button--disabled');
    }

    if (this.loading()) {
      classes.push('custom-button--loading');
    }

    if (this.icon()) {
      classes.push(`custom-button--icon-${this.iconPosition()}`);
    }

    return classes.join(' ');
  });

  buttonStyles = computed(() => {
    const styles: { [key: string]: string } = {};

    if (this.customColor()) {
      styles['--custom-color'] = this.customColor()!;
    }

    if (this.customBackground()) {
      styles['--custom-background'] = this.customBackground()!;
    }

    if (this.customBorder()) {
      styles['--custom-border'] = this.customBorder()!;
    }

    return styles;
  });

  onClick(event: Event): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
