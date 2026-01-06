import { NavController, RefresherCustomEvent } from '@ionic/angular/standalone';
import { IonInfiniteScroll, IonInfiniteScrollContent, IonSpinner, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { inject, Component, ChangeDetectionStrategy, OnInit, signal, computed, input } from '@angular/core';
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

  // signals
  posts = this.feedService.myPosts;
  isLoading = signal(false);
  isLoadingMore = signal(false);
  hasLoadedOnce = signal(false);
  hasMore = computed(() => this.feedService.myFeedsHasMore());

  // Constants
  private readonly pageLimit = 10;

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

      if (reset) {
        this.feedService.myFeedsPage.set(1);
      }

      const page = reset ? 1 : this.feedService.myFeedsPage();

      await this.feedService.getMyFeeds({
        page,
        limit: this.pageLimit,
        append: !reset
      });

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

      const currentPage = this.feedService.myFeedsPage();
      const nextPage = currentPage + 1;

      await this.feedService.getMyFeeds({
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

  async onRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      this.feedService.myFeedsPage.set(1);
      await this.feedService.getMyFeeds({
        page: 1,
        limit: this.pageLimit,
        append: false
      });
    } catch (error) {
      console.error('Error refreshing feeds:', error);
    } finally {
      event.target.complete();
    }
  }
}
