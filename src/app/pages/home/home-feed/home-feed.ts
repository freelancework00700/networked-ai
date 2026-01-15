import { afterNextRender, effect, input, untracked } from '@angular/core';
import { NavController } from '@ionic/angular';
import { IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { PostCard } from '@/components/card/post-card';
import { ModalService } from '@/services/modal.service';
import { FeedService } from '@/services/feed.service';
import { AuthService } from '@/services/auth.service';
import { onImageError, getImageUrlOrDefault } from '@/utils/helper';
import { signal, Component, ChangeDetectionStrategy, inject, computed, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileEmptyState } from '@/components/common/profile-empty-state';
import { AuthEmptyState } from '@/components/common/auth-empty-state';
import { UserRecommendations } from '@/components/common/user-recommendations';
import { FeedPost } from '@/interfaces/IFeed';
import { IUser } from '@/interfaces/IUser';

type Filter = 'public' | 'networked';

@Component({
  selector: 'home-feed',
  imports: [PostCard, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent, ProfileEmptyState, AuthEmptyState, UserRecommendations],
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

  // Current user data input
  currentUser = input<IUser | null>(null);
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

  // Constants
  private readonly pageLimit = 10;

  constructor() {
    effect(() => {
      const currentUser = this.currentUser();
      if (currentUser) {
        untracked(() => {
          this.loadAllFeeds();
        })
      } else {
        this.loadPublicFeeds();
      }
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


  onImageError(event: Event): void {
    onImageError(event);
  }
}