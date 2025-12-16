import { input, Component } from '@angular/core';
import { EventCard } from '@/components/card/event-card';

@Component({
  imports: [EventCard],
  selector: 'profile-liked-events',
  styleUrl: './profile-liked-events.scss',
  templateUrl: './profile-liked-events.html'
})
export class ProfileLikedEvents {
  // inputs
  events = input<any[]>([]);
}
