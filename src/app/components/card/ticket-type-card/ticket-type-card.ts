import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'ticket-type-card',
  styleUrl: './ticket-type-card.scss',
  templateUrl: './ticket-type-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class TicketTypeCard {
  icon = input.required<string>();
  label = input.required<string>();
  description = input.required<string>();

  click = output<void>();

  constructor() {}

  onClick(event: Event): void {
    event.stopPropagation();
    this.click.emit();
  }
}
