import { IonIcon } from '@ionic/angular/standalone';
import { input, output, Component, ChangeDetectionStrategy } from '@angular/core';

export interface SegmentButtonItem {
  value: string;
  label: string;
  icon?: string; // For ion-icon SVG path
  activeIcon?: string; // For ion-icon SVG path
  iconClass?: string; // For PrimeNG icon classes (e.g., 'pi pi-calendar-clock')
}

@Component({
  imports: [IonIcon],
  selector: 'segment-button',
  styleUrl: './segment-button.scss',
  templateUrl: './segment-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SegmentButton {
  // inputs
  value = input.required<string>();
  items = input.required<SegmentButtonItem[]>();

  // outputs
  valueChange = output<string>();
}
