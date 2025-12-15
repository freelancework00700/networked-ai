import { Button } from '@/components/form/button';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

export interface IUser {
  name: string;
  location: string;
  profileImage: string;
}

@Component({
  imports: [Button],
  selector: 'user-card',
  styleUrl: './user-card.scss',
  templateUrl: './user-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCard {
  user = input.required<IUser>();
}
