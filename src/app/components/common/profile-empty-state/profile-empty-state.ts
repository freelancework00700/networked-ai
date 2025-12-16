import { Button } from '@/components/form/button';
import { IonIcon, NavController } from '@ionic/angular/standalone';
import { inject, input, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  imports: [IonIcon, Button],
  selector: 'profile-empty-state',
  styleUrl: './profile-empty-state.scss',
  templateUrl: './profile-empty-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEmptyState {
  // inputs
  buttonIcon = input('pi-search');
  title = input.required<string>();
  subtitle = input.required<string>();
  buttonText = input.required<string>();
  buttonRoute = input.required<string>();
  iconPath = input('/assets/svg/calendar-x.svg');

  // services
  navCtrl = inject(NavController);
}
