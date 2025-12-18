import { Swiper } from 'swiper';
import { Button } from '@/components/form/button';
import { UserCard } from '@/components/card/user-card';
import { signal, Component, afterEveryRender, ChangeDetectionStrategy } from '@angular/core';

type Filter = 'public' | 'networked';

@Component({
  selector: 'home-feed',
  imports: [Button, UserCard],
  styleUrl: './home-feed.scss',
  templateUrl: './home-feed.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeFeed {
  // signals
  feedFilter = signal<Filter>('public');

  users = [
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
  
  constructor() {
    afterEveryRender(() => this.initSwiper());
  }

  private initSwiper(): void {
    new Swiper('.swiper-user-recommendation', {
      spaceBetween: 8,
      slidesPerView: 2.2,
      allowTouchMove: true,
      slidesOffsetAfter: 16,
      slidesOffsetBefore: 16
    });
  }
}
