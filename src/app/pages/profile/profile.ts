import { Button } from '@/components/form/button';
import { inject, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NavController,
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  SegmentCustomEvent,
  SegmentValue,
  IonProgressBar
} from '@ionic/angular/standalone';
import { InputIcon } from 'primeng/inputicon';

@Component({
  imports: [IonProgressBar, CommonModule, IonSegmentButton, IonSegment, IonIcon, IonContent, IonToolbar, IonHeader, Button, InputIcon],
  selector: 'profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html'
})
export class Profile {
  public progress = 50;
  // services
  private navCtrl = inject(NavController);

  segmentValue: SegmentValue = 'user-profile';

  // Hosted events array - replace with actual data from service
  hostedEvents: any[] = [];

  goToEditProfile(): void {
    this.navCtrl.navigateForward('/profile/edit');
  }

  onSegmentChange(event: SegmentCustomEvent): void {
    this.segmentValue = event.detail.value ?? 'user-profile';
  }

  goToCreateEvent(): void {
    this.navCtrl.navigateForward('/create-event');
  }
  eventCards = [
    {
      title: 'Scheveningen',
      organization: 'Networked AI',
      date: 'Fri 8/30, 7.00AM',
      location: 'Atlanta, GA',
      views: '12 views',
      image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Fri',
      day: '12'
    },
    {
      title: 'Scheveningen',
      organization: 'Networked AI',
      date: 'Fri 8/30, 7.00AM',
      location: 'Atlanta, GA',
      views: '12 views',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Tue',
      day: '16'
    },
    {
      title: 'Scheveningen',
      organization: 'Networked AI',
      date: 'Fri 8/30, 7.00AM',
      location: 'Atlanta, GA',
      views: '12 views',
      image: 'https://images.unsplash.com/photo-1444840535719-195841cb6e2b?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Fri',
      day: '27'
    }
  ];

  // upcoming events (empty by default to show the empty state)
  upcomingEvents: Array<(typeof this.eventCards)[number]> = [];

  constructor() {
    setInterval(() => {
      this.progress += 0.01;

      // Reset the progress bar when it reaches 100%
      // to continuously show the demo
      if (this.progress > 1) {
        setTimeout(() => {
          this.progress = 0;
        }, 1000);
      }
    }, 50);
  }
}
