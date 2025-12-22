import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'post-event-card',
  styleUrl: './post-event-card.scss',
  templateUrl: './post-event-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostEventCard {
  onRemove = output<any>();
  onAdd = output<any>();
  event = input<any>();
  isModal = input<boolean>(false);
}
