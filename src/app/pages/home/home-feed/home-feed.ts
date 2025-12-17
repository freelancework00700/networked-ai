import { signal, Component, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { UserCard, IUser } from '@/components/card/user-card';
import Swiper from 'swiper';
import { IonIcon, IonImg } from '@ionic/angular/standalone';
import { Button } from '@/components/form/button';

interface SwiperConfig {
  spaceBetween: number;
  slidesPerView: number;
  allowTouchMove: boolean;
  slidesOffsetBefore: number;
  slidesOffsetAfter: number;
}

@Component({
  selector: 'home-feed',
  styleUrl: './home-feed.scss',
  templateUrl: './home-feed.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonImg, IonIcon, UserCard, Button]
})
export class HomeFeed {
  feedFilter = signal<'public' | 'networked'>('public');
  @ViewChild('swiperContainerPeople', { static: false }) swiperContainerPeople?: ElementRef<HTMLDivElement>;
  private initializeSwiper(element: ElementRef<HTMLDivElement> | undefined, config: SwiperConfig): Swiper | undefined {
    if (!element?.nativeElement) return undefined;

    return new Swiper(element.nativeElement, {
      ...config,
      on: {
        slideChange: () => {
          // Swiper slide change handler
        }
      }
    });
  }
  private readonly swiperConfigs: Record<string, SwiperConfig> = {
    people: { spaceBetween: 8, slidesPerView: 2.2, allowTouchMove: true, slidesOffsetBefore: 16, slidesOffsetAfter: 16 }
  };
  peopleCards: IUser[] = [
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
  ngAfterViewInit(): void {
    this.initializeSwiper(this.swiperContainerPeople, this.swiperConfigs['people']);
  }
}
