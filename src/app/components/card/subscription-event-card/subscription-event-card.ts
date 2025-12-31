import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'subscription-event-card',
  imports: [CommonModule, CheckboxModule, FormsModule],
  styleUrl: './subscription-event-card.scss',
  templateUrl: './subscription-event-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionEventCard {
  event = input.required<any>();
  selected = input<boolean>(false);

  toggle = output<string>();

  onToggle(): void {
    this.toggle.emit(this.event().id);
  }
}
