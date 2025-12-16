import { EventCard } from '@/components/card/event-card';
import { NavController } from '@ionic/angular/standalone';
import { input, inject, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  imports: [EventCard],
  selector: 'profile-attended-events',
  styleUrl: './profile-attended-events.scss',
  templateUrl: './profile-attended-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileAttendedEvents {
  // inputs
  events = input<any[]>([]);

  // services
  navCtrl = inject(NavController);
}
