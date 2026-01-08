import { NavController, RefresherCustomEvent } from '@ionic/angular/standalone';
import { IonInfiniteScroll, IonInfiniteScrollContent, IonSpinner, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { inject, Component, ChangeDetectionStrategy, OnInit, signal, computed, input, effect } from '@angular/core';
import { PostCard } from '@/components/card/post-card';
import { FeedService } from '@/services/feed.service';
import { ViewWillEnter } from '@ionic/angular/standalone';
import { ProfileEmptyState } from '@/components/common/profile-empty-state';

@Component({
  selector: 'profile-posts',
  styleUrl: './profile-posts.scss',
  templateUrl: './profile-posts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PostCard, IonInfiniteScroll, IonInfiniteScrollContent, IonSpinner, IonRefresher, IonRefresherContent, ProfileEmptyState]
})
export class ProfilePosts implements OnInit, ViewWillEnter {
  // services
  navCtrl = inject(NavController);
  feedService = inject(FeedService);

  userId = input<string | null>(null);

  // signals
  posts = this.feedService.myPosts;
  isLoading = signal(false);
  isLoadingMore = signal(false);
  hasLoadedOnce = signal(false);
  hasMore = signal(true);
  currentPage = signal(1);
  totalPages = signal(0);

  // Constants
  private readonly pageLimit = 10;

  constructor() {
    // Reload feeds when userId changes
    effect(() => {
      const userId = this.userId();
      if (this.hasLoadedOnce()) {
        this.loadFeeds(true);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.checkAndLoadFeeds();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.checkAndLoadFeeds();
  }

  private async checkAndLoadFeeds(): Promise<void> {
    await this.loadFeeds();
  }

  private async loadFeeds(reset: boolean = true): Promise<void> {
    try {
      this.isLoading.set(true);

      const userId = this.userId();
      const page = reset ? 1 : this.currentPage();

      if (userId) {
        // Fetch other user's feeds
        const response = await this.feedService.getUserFeeds(userId, {
          page,
          limit: this.pageLimit
        });

        if (reset) {
          this.posts.set(response.posts);
        } else {
          this.posts.update(current => [...current, ...response.posts]);
        }

        this.currentPage.set(response.page);
        this.totalPages.set(Math.ceil(response.total / this.pageLimit));
        this.hasMore.set(response.hasMore);
      } 
      else {
        // Fetch current user's feeds
        if (reset) {
          this.feedService.myFeedsPage.set(1);
        }

        await this.feedService.getMyFeeds({
          page,
          limit: this.pageLimit,
          append: !reset
        });

        // Use the service's myPosts signal
        this.posts.set(this.feedService.myPosts());
        this.currentPage.set(this.feedService.myFeedsPage());
        this.hasMore.set(this.feedService.myFeedsHasMore());
      }

      this.hasLoadedOnce.set(true);
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

    try {
      this.isLoadingMore.set(true);

      const userId = this.userId();
      const nextPage = this.currentPage() + 1;

      if (userId) {
        // Load more for other user's feeds
        const response = await this.feedService.getUserFeeds(userId, {
          page: nextPage,
          limit: this.pageLimit
        });

        this.posts.update(current => [...current, ...response.posts]);
        this.currentPage.set(response.page);
        this.hasMore.set(response.hasMore);
      } else {
        // Load more for current user's feeds
        await this.feedService.getMyFeeds({
          page: nextPage,
          limit: this.pageLimit,
          append: true
        });

        this.posts.set(this.feedService.myPosts());
        this.currentPage.set(this.feedService.myFeedsPage());
        this.hasMore.set(this.feedService.myFeedsHasMore());
      }
    } catch (error) {
      console.error('Error loading more feeds:', error);
    } finally {
      this.isLoadingMore.set(false);
      infiniteScroll.complete();
    }
  }

  async onRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      await this.loadFeeds(true);
    } catch (error) {
      console.error('Error refreshing feeds:', error);
    } finally {
      event.target.complete();
    }
  }
}
