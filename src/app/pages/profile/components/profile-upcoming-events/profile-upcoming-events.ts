import { NavController } from '@ionic/angular/standalone';
import { UpcomingEventCard } from '@/components/card/upcoming-event-card';
import { input, inject, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  imports: [UpcomingEventCard],
  selector: 'profile-upcoming-events',
  styleUrl: './profile-upcoming-events.scss',
  templateUrl: './profile-upcoming-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileUpcomingEvents {
  // inputs
  events = input<any[]>([]);

  // services
  navCtrl = inject(NavController);
}
