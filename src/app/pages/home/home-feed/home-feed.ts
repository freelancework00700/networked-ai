import { Swiper } from 'swiper';
import { afterNextRender, effect } from '@angular/core';
import { NavController } from '@ionic/angular';
import { IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { UserCard } from '@/components/card/user-card';
import { PostCard } from '@/components/card/post-card';
import { ModalService } from '@/services/modal.service';
import { FeedService } from '@/services/feed.service';
import { AuthService } from '@/services/auth.service';
import { NgOptimizedImage } from '@angular/common';
import { onImageError, getImageUrlOrDefault } from '@/utils/helper';
import { signal, Component, afterEveryRender, ChangeDetectionStrategy, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileEmptyState } from '@/components/common/profile-empty-state';
import { AuthEmptyState } from '@/components/common/auth-empty-state';
import { FeedPost } from '@/interfaces/IFeed';

type Filter = 'public' | 'networked';

@Component({
  selector: 'home-feed',
  imports: [UserCard, PostCard, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent, NgOptimizedImage, ProfileEmptyState, AuthEmptyState],
  styleUrl: './home-feed.scss',
  templateUrl: './home-feed.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeFeed implements OnDestroy {
  navCtrl = inject(NavController);
  modalService = inject(ModalService);
  feedService = inject(FeedService);
  authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // signals
  feedFilter = signal<Filter>('public');

  // subscriptions
  private queryParamsSubscription?: Subscription;

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

  // Computed posts based on current filter (no API call on filter change)
  posts = computed<FeedPost[]>(() => {
    const filter = this.feedFilter();
    const feeds = filter === 'public' ? this.feedService.publicFeeds() : this.feedService.networkedFeeds();
    return feeds || [];
  });

  // Computed pagination state based on current filter
  hasMore = computed(() => {
    const filter = this.feedFilter();
    return filter === 'public' ? this.feedService.publicFeedsHasMore() : this.feedService.networkedFeedsHasMore();
  });

  // Current user data
  currentUser = this.authService.currentUser;
  currentUserName = computed(() => this.currentUser()?.name || this.authService.currentUser()?.username || '');
  currentUserImage = computed(() => {
    const user = this.currentUser();
    const imageUrl = user?.thumbnail_url;
    return getImageUrlOrDefault(imageUrl);
  });
  isLoggedIn = computed(() => !!this.authService.currentUser());

  // Loading state
  isLoading = signal(false);
  isLoadingMore = signal(false);

  // Track previous user ID to detect account changes
  private previousUserId: string | null = null;
  private previousLoginState: boolean | null = null;

  // Constants
  private readonly pageLimit = 10;

  constructor() {
    afterEveryRender(() => this.initSwiper());

    // Watch for user changes and login state - ONLY call APIs when auth state changes
    effect(() => {
      const currentUser = this.currentUser();
      const currentUserId = currentUser?.id || null;
      const currentLoginState = this.isLoggedIn();

      // Initialize previous state on first run (don't load on first run)
      if (this.previousLoginState === null) {
        this.previousUserId = currentUserId;
        this.previousLoginState = currentLoginState;
        
        // On initial mount, check if feeds exist, if not load them
        this.loadFeedsIfNeeded();
        return;
      }

      const loginStateChanged = this.previousLoginState !== currentLoginState;
      const userIdChanged = this.previousUserId !== null && this.previousUserId !== currentUserId;

      // Only call APIs when auth state changes
      if (userIdChanged) {
        this.handleAccountChangeAndLogin();
      } else if (loginStateChanged && currentLoginState && !this.previousLoginState) {
        this.handleAccountChangeAndLogin();
      }

      this.previousUserId = currentUserId;
      this.previousLoginState = currentLoginState;
    });

    afterNextRender(() => {
      const params = this.route.snapshot.queryParamMap;
      const filterParam = params.get('feedFilter');

      if (filterParam === 'public' || filterParam === 'networked') {
        this.feedFilter.set(filterParam as Filter);
      } else {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { feedFilter: this.feedFilter() },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
  }

  private async handleAccountChangeAndLogin(): Promise<void> {
    this.feedService.resetAllFeeds();
    await this.loadAllFeeds(true);
  }

  private async loadFeedsIfNeeded(): Promise<void> {
    // Only load if feeds don't exist in service (on initial mount)
    const hasPublicFeeds = this.feedService.publicFeeds().length > 0;
    const hasNetworkedFeeds = this.feedService.networkedFeeds().length > 0;
    const loggedIn = this.isLoggedIn();

    // If feeds already exist in service, don't load (just use global state)
    if (loggedIn && hasPublicFeeds && hasNetworkedFeeds) return;

    if (!loggedIn && hasPublicFeeds) return;

    // Only load if feeds don't exist
    if (!loggedIn) {
      if (!hasPublicFeeds) {
        await this.loadPublicFeeds();
      }
    } else {
      if (!hasPublicFeeds && !hasNetworkedFeeds) {
        await this.loadAllFeeds();
      }
    }
  }

  private async loadPublicFeeds(reset: boolean = true): Promise<void> {
    try {
      this.isLoading.set(true);
      this.feedService.publicFeedsPage.set(1);
      await this.feedService.getFeeds({
        is_public: true,
        page: 1,
        limit: this.pageLimit,
        append: !reset
      });
    } catch (error) {
      console.error('Error loading public feeds:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadAllFeeds(reset: boolean = true): Promise<void> {
    try {
      this.isLoading.set(true);
      this.feedService.publicFeedsPage.set(1);
      this.feedService.networkedFeedsPage.set(1);
      await Promise.all([
        this.feedService.getFeeds({
          is_public: true,
          page: 1,
          limit: this.pageLimit,
          append: !reset
        }),
        this.feedService.getFeeds({
          is_public: false,
          page: 1,
          limit: this.pageLimit,
          append: !reset
        })
      ]);
    } catch (error) {
      console.error('Error loading feeds:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadMoreFeeds(event: Event): Promise<void> {
    const infiniteScroll = (event as CustomEvent).target as HTMLIonInfiniteScrollElement;

    if (this.isLoadingMore() || !this.hasMore()) {
      infiniteScroll.complete();
      return;
    }

    // Don't load more networked feeds when not logged in
    const filter = this.feedFilter();
    if (!this.isLoggedIn() && filter === 'networked') {
      infiniteScroll.complete();
      return;
    }

    try {
      this.isLoadingMore.set(true);

      const isPublic = filter === 'public';
      const currentPage = isPublic ? this.feedService.publicFeedsPage() : this.feedService.networkedFeedsPage();

      const nextPage = currentPage + 1;

      await this.feedService.getFeeds({
        is_public: isPublic,
        page: nextPage,
        limit: this.pageLimit,
        append: true
      });
    } catch (error) {
      console.error('Error loading more feeds:', error);
    } finally {
      this.isLoadingMore.set(false);
      infiniteScroll.complete();
    }
  }

  async refresh(): Promise<void> {
    try {
      const loggedIn = this.isLoggedIn();
      
      if (!loggedIn) {
        // When not logged in, only refresh public feeds
        this.feedService.publicFeedsPage.set(1);
        await this.feedService.getFeeds({
          is_public: true,
          page: 1,
          limit: this.pageLimit,
          append: false
        });
      } else {
        // When logged in, refresh both feeds
        this.feedService.publicFeedsPage.set(1);
        this.feedService.networkedFeedsPage.set(1);
        await Promise.all([
          this.feedService.getFeeds({
            is_public: true,
            page: 1,
            limit: this.pageLimit,
            append: false
          }),
          this.feedService.getFeeds({
            is_public: false,
            page: 1,
            limit: this.pageLimit,
            append: false
          })
        ]);
      }
    } catch (error) {
      console.error('Error refreshing feeds:', error);
      throw error;
    }
  }

  async onFilterChange(): Promise<void> {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { feedFilter: this.feedFilter() },
      queryParamsHandling: 'merge'
    });
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


  onImageError(event: Event): void {
    onImageError(event);
  }
}
