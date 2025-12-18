import { Button } from '@/components/form/button';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  imports: [Button],
  selector: 'user-card',
  styleUrl: './user-card.scss',
  templateUrl: './user-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCard {
  // inputs
  user = input.required<any>();
}
