import { Swiper } from 'swiper';
import { NavController } from '@ionic/angular';
import { UserCard } from '@/components/card/user-card';
import { PostCard } from '@/components/card/post-card';
import { ModalService } from '@/services/modal.service';
import { signal, Component, afterEveryRender, ChangeDetectionStrategy, inject, computed } from '@angular/core';

type Filter = 'public' | 'networked';

@Component({
  selector: 'home-feed',
  imports: [UserCard, PostCard],
  styleUrl: './home-feed.scss',
  templateUrl: './home-feed.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeFeed {
  navCtrl = inject(NavController);
  modalService = inject(ModalService);
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

  posts = signal<any[]>([
    {
      post_id: 'UNpWXAmZSRFuoUpg9vG8',
      uid: 'WdFzpiB4SoZfAC28Nvp380DJPn33',
      text: 'Get out. Get Networked.',
      media: [],
      eid: ['-OaRVjr6NoQrDdd1Bi1u'],
      location: '5600 Roswell Rd Building C, Sandy Springs, GA 30342, USA',
      lat: 33.9074988,
      lng: -84.3792591,
      visibility: 'public',
      createdAt: 1765927059811,
      updatedAt: null,
      like_count: 1,
      comment_count: 0,
      share_count: 0,
      id: 'UNpWXAmZSRFuoUpg9vG8',
      isLikedByYou: true
    },
    {
      post_id: '8nUe0RsykuGuU5sEUxwo',
      uid: 'fGoPjhM3LwVHVrPZiJrMRx6aWLu1',
      text: 'Hey! I’m attending the Lifetime Tech event  on the 18th and stoked!!!\n\n@[gaudravi](kkX01IRGUxfJW5Gdesx9Sh8yCRj2)',
      media: [],
      eid: [],
      location: '',
      lat: null,
      lng: null,
      visibility: 'public',
      createdAt: null,
      updatedAt: 1765134206978,
      comment_count: 0,
      share_count: 0,
      like_count: 2,
      id: '8nUe0RsykuGuU5sEUxwo'
    },
    {
      post_id: 'ETeoCIVbpN4iZI5VVzc5',
      uid: 'cCohEPzZLVTtLT1irgzNgtikD4J3',
      text: 'https://www.npmjs.com/package/angular-mentions',
      media: [
        {
          url: 'https://firebasestorage.googleapis.com/v0/b/networked-6f29b.appspot.com/o/eventImages%2F1764533538399.png?alt=media&token=b1bc2c33-5508-4722-a95e-dc3749cbd0cf',
          type: 'image'
        }
      ],
      eid: [],
      location: '',
      lat: null,
      lng: null,
      visibility: 'public',
      createdAt: 1764533548436,
      updatedAt: null,
      share_count: 0,
      like_count: 2,
      comment_count: 1,
      id: 'ETeoCIVbpN4iZI5VVzc5'
    },
    {
      post_id: 'NJQ8xQBknj0fmUvCYAdC',
      uid: 'WdFzpiB4SoZfAC28Nvp380DJPn33',
      media: [
        {
          url: 'https://firebasestorage.googleapis.com/v0/b/networked-6f29b.appspot.com/o/eventImages%2F1763129084316.jpeg?alt=media&token=1a1d743b-78cf-443d-89b3-85b8392e2c6b',
          type: 'image'
        },
        {
          url: 'https://firebasestorage.googleapis.com/v0/b/networked-6f29b.appspot.com/o/eventImages%2F1763129095994.jpeg?alt=media&token=08bb296d-781c-48b0-8d82-ad9e4efbf2e7',
          type: 'image'
        },
        {
          url: 'https://firebasestorage.googleapis.com/v0/b/networked-6f29b.appspot.com/o/eventVideo%2F1763129204617.quicktime?alt=media&token=dd30ba88-fe27-4655-8bb4-67349187da0a',
          type: 'video'
        }
      ],
      eid: [],
      location: '2500 Old Milton Pkwy Suite 250, Alpharetta, GA 30009, USA',
      lat: 34.0697989,
      lng: -84.2846194,
      visibility: 'networked',
      createdAt: 1763129269644,
      updatedAt: null,
      comment_count: 0,
      share_count: 0,
      like_count: 2,
      id: 'NJQ8xQBknj0fmUvCYAdC'
    },
    {
      post_id: 'ixDha2O6ktdNiS74NCrf',
      uid: 'WdFzpiB4SoZfAC28Nvp380DJPn33',
      text: 'Growth isn’t just about business — it’s about becoming who you’re called to be.',
      media: [
        {
          url: 'https://firebasestorage.googleapis.com/v0/b/networked-6f29b.appspot.com/o/eventImages%2F1762533208846.jpeg?alt=media&token=242defc6-f735-451d-a7bf-7e82cd56a492',
          type: 'image'
        }
      ],
      eid: [],
      location: 'Atlanta, GA, USA',
      lat: 33.7501275,
      lng: -84.3885209,
      visibility: 'public',
      createdAt: 1762533238228,
      updatedAt: null,
      comment_count: 0,
      share_count: 0,
      like_count: 1,
      id: 'ixDha2O6ktdNiS74NCrf'
    }
  ]);

  filteredPosts = computed(() => {
    return this.posts().filter((p) => p.visibility === this.feedFilter());
  });
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

  onLike(postId: string) {
    this.posts.update((p: any) => {
      return p.map((p: any) => {
        if (p.id !== postId) return p;

        const isLiked = !p.isLikedByYou;

        return {
          ...p,
          isLikedByYou: isLiked,
          like_count: isLiked ? (p.like_count || 0) + 1 : Math.max((p.like_count || 1) - 1, 0)
        };
      });
    });
  }

  onComment(post: any) {
    this.navCtrl.navigateForward(['/comments', post.id], { state: { post } });
  }
}
