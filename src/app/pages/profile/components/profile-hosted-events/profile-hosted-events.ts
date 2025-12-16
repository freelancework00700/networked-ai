import { NavController } from '@ionic/angular/standalone';
import { ProfileEmptyState } from '@/components/common/profile-empty-state';
import { input, inject, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  imports: [ProfileEmptyState],
  selector: 'profile-hosted-events',
  styleUrl: './profile-hosted-events.scss',
  templateUrl: './profile-hosted-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileHostedEvents {
  // inputs
  events = input<any[]>([]);

  // services
  navCtrl = inject(NavController);
}
