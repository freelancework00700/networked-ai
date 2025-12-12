import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonIcon, IonContent, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';
import { InputIcon } from 'primeng/inputicon';
import { SegmentCustomEvent, SegmentValue } from '@ionic/angular';
import { Swiper } from 'swiper';

@Component({
  selector: 'home',
  standalone: true,
  styleUrl: './home.scss',
  templateUrl: './home.html',
  imports: [CommonModule, IonIcon, IonHeader, IonToolbar, IonContent, IonSegment, IonSegmentButton, IonLabel, InputIcon]
})
export class Home implements OnInit {
  segmentValue: SegmentValue = 'events';
  eventFilter: 'browse' | 'upcoming' = 'browse';
  feedFilter: 'public' | 'networked' = 'public';
  cityCards = [
    {
      city: 'Atlanta, GA',
      events: '17 Events',
      image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80'
    },
    {
      city: 'Chicago, IL',
      events: '17 Events',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'
    },
    {
      city: 'Denver, CO',
      events: '12 Events',
      image: 'https://images.unsplash.com/photo-1444840535719-195841cb6e2b?auto=format&fit=crop&w=800&q=80'
    }
  ];

  peopleCards = [
    {
      name: 'Kathryn Murphy',
      location: 'Atlanta, GA',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'Esther Howard',
      location: 'Atlanta, GA',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'Arlene McCoy',
      location: 'Atlanta, GA',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
    }
  ];

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

  feedPosts = [
    {
      id: '1',
      primaryUser: {
        name: 'Ricky James',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      },
      otherCount: 3,
      event: {
        title: 'Atlanta Makes Me Laugh',
        organization: 'Networked AI',
        date: 'Fri 8/30, 7.00AM',
        location: 'Atlanta, GA',
        views: '12 views',
        image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80'
      }
    }
  ];

  networkSuggestions = [
    {
      id: '1',
      name: 'Alicia P.',
      location: 'Atlanta, GA',
      distance: '2.5 miles',
      timeAgo: '2m ago',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      mapImage: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=80'
    }
  ];

  constructor() {}

  ngOnInit() {}

  onSegmentChange(event: SegmentCustomEvent) {
    this.segmentValue = event.detail.value ?? 'events';
  }
  setEventFilter(filter: 'browse' | 'upcoming') {
    this.eventFilter = filter;
  }
  setFeedFilter(filter: 'public' | 'networked') {
    this.feedFilter = filter;
  }
  // signals
  currentSlide = signal(0);

  // swiper instance
  swiper?: Swiper;

  // view child
  @ViewChild('swiperContainerEventByCitites', { static: false }) swiperContainerEventByCities?: ElementRef<HTMLDivElement>;
  @ViewChild('swiperContainerEventByYou', { static: false }) swiperContainerEventByYou?: ElementRef<HTMLDivElement>;
  @ViewChild('swiperContainerPublicEvent', { static: false }) swiperContainerPublicEvent?: ElementRef<HTMLDivElement>;
  @ViewChild('swiperContainerPeople', { static: false }) swiperContainerPeople?: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    if (this.swiperContainerEventByCities?.nativeElement) {
      this.swiper = new Swiper(this.swiperContainerEventByCities.nativeElement, {
        spaceBetween: 8,
        slidesPerView: 2.7,
        allowTouchMove: true,
        on: {
          slideChange: (swiper) => {
            this.currentSlide.set(swiper.activeIndex);
          }
        }
      });
    }
    if (this.swiperContainerEventByYou?.nativeElement) {
      this.swiper = new Swiper(this.swiperContainerEventByYou.nativeElement, {
        spaceBetween: 8,
        slidesPerView: 1.5,
        allowTouchMove: true,
        on: {
          slideChange: (swiper) => {
            this.currentSlide.set(swiper.activeIndex);
          }
        }
      });
    }
    if (this.swiperContainerPublicEvent?.nativeElement) {
      this.swiper = new Swiper(this.swiperContainerPublicEvent.nativeElement, {
        spaceBetween: 8,
        slidesPerView: 1.5,
        allowTouchMove: true,
        on: {
          slideChange: (swiper) => {
            this.currentSlide.set(swiper.activeIndex);
          }
        }
      });
    }
    if (this.swiperContainerPeople?.nativeElement) {
      this.swiper = new Swiper(this.swiperContainerPeople.nativeElement, {
        spaceBetween: 8,
        slidesPerView: 2.2,
        allowTouchMove: true,
        on: {
          slideChange: (swiper) => {
            this.currentSlide.set(swiper.activeIndex);
          }
        }
      });
    }
  }
}
