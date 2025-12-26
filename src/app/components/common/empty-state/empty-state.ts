import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { IonIcon } from '@ionic/angular/standalone';
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  styleUrl: './empty-state.scss',
  templateUrl: './empty-state.html',
  imports: [CommonModule, IonIcon, Button],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyState {
  // inputs
  title = input('No Events Found');
  message = input('Check your spelling or try searching for a different keyword.');
  icon = input('/assets/svg/calendar-x.svg');
  iconStyle = input<'default' | 'notification' | 'network'>('default');
  iconBgColor = input('');
  showClearButton = input(false);
  clearButtonLabel = input('Clear Search');
  clearButtonColor = input<'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast'>('secondary');
  minHeight = input('min-h-[400px]');

  // outputs
  clear = output<void>();

  onClear(): void {
    this.clear.emit();
  }
}
