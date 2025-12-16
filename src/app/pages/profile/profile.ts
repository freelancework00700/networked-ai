import Swiper from 'swiper';
import { Scrollbar } from 'swiper/modules';
import { Button } from '@/components/form/button';
import { ProfileLink } from '@/pages/profile/components/profile-link';
import { ProfileAchievement } from '@/pages/profile/components/profile-achievement';
import { ProfileLikedEvents } from '@/pages/profile/components/profile-liked-events';
import { ProfilePosts } from '@/pages/profile/components/profile-posts/profile-posts';
import { ProfileHostedEvents } from '@/pages/profile/components/profile-hosted-events';
import { ProfileUpcomingEvents } from '@/pages/profile/components/profile-upcoming-events';
import { ProfileAttendedEvents } from '@/pages/profile/components/profile-attended-events';
import { inject, Component, AfterViewInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { IonIcon, IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';

type ProfileTabs = 'hosted-events' | 'attended-events' | 'upcoming-events' | 'user-posts' | 'user-achievement' | 'liked-events';

interface TabConfig {
  icon: string;
  value: ProfileTabs;
  iconActive: string;
}

@Component({
  selector: 'profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    IonIcon,
    IonHeader,
    IonContent,
    IonToolbar,
    ProfileLink,
    ProfilePosts,
    ProfileLikedEvents,
    ProfileAchievement,
    ProfileHostedEvents,
    ProfileAttendedEvents,
    ProfileUpcomingEvents
  ]
})
export class Profile implements AfterViewInit {
  navCtrl = inject(NavController);
  currentSlide = signal<ProfileTabs>('hosted-events');
  swiper?: Swiper;

  hostedEvents: unknown[] = [];
  attendedEvents: unknown[] = [];
  posts: unknown[] = [];
  events = [
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

  readonly tabs: ProfileTabs[] = ['hosted-events', 'attended-events', 'upcoming-events', 'user-posts', 'user-achievement', 'liked-events'];

  readonly slides: TabConfig[] = [
    { value: 'hosted-events', icon: '/assets/svg/profile/hosted-events.svg', iconActive: '/assets/svg/profile/hosted-events-active.svg' },
    { value: 'attended-events', icon: '/assets/svg/profile/attended-events.svg', iconActive: '/assets/svg/profile/attended-events-active.svg' },
    { value: 'upcoming-events', icon: '/assets/svg/profile/upcoming-events.svg', iconActive: '/assets/svg/profile/upcoming-events-active.svg' },
    { value: 'user-posts', icon: '/assets/svg/profile/user-posts.svg', iconActive: '/assets/svg/profile/user-posts-active.svg' },
    { value: 'user-achievement', icon: '/assets/svg/profile/user-achievement.svg', iconActive: '/assets/svg/profile/user-achievement-active.svg' },
    { value: 'liked-events', icon: '/assets/svg/profile/liked-events.svg', iconActive: '/assets/svg/profile/liked-events-active.svg' }
  ];

  changeTab(value: ProfileTabs): void {
    this.currentSlide.set(value);
    const slideIndex = this.tabs.indexOf(value);
    this.swiper?.slideTo(slideIndex);
  }

  goToCreateEvent(): void {
    this.navCtrl.navigateForward('/create-event');
  }

  ngAfterViewInit(): void {
    const initialSlide = this.tabs.indexOf(this.currentSlide());

    this.swiper = new Swiper('.swiper-profile', {
      initialSlide,
      spaceBetween: 0,
      slidesPerView: 1,
      autoHeight: true,
      modules: [Scrollbar],
      scrollbar: {
        el: '.swiper-scrollbar'
      },
      on: {
        slideChange: (swiper) => {
          const newTab = this.tabs[swiper.activeIndex];
          if (newTab) this.currentSlide.set(newTab);
        }
      }
    });
  }
}
