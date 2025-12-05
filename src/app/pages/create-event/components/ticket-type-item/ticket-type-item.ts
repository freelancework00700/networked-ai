import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'ticket-type-item',
  styleUrl: './ticket-type-item.scss',
  templateUrl: './ticket-type-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class TicketTypeItem {
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
