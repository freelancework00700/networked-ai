import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgFor, NgStyle } from '@angular/common';

@Component({
  selector: 'app-default-profile',
  styleUrl: './default-profile.scss',
  templateUrl: './default-profile.html',
  imports: [NgFor, NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultProfile {
  eventCards: any[] = [];

  createEvent() {
    // Handle create event navigation
    console.log('Navigate to create event');
    // You can inject Router and navigate to create event page
  }
}
