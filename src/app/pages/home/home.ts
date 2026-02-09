import { HomeFeed } from '@/pages/home/home-feed';
import { HomeEvent } from '@/pages/home/home-event';
import { Button } from "@/components/form/button";
import { AuthService } from '@/services/auth.service';
import { NavigationService } from '@/services/navigation.service';
import { ProfileHeaderToolbar } from '@/components/common/profile-header-toolbar';
import { SegmentButton, SegmentButtonItem } from '@/components/common/segment-button';
import { signal, inject, computed, Component, ChangeDetectionStrategy, OnDestroy, viewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, NavController, RefresherCustomEvent, IonFab } from '@ionic/angular/standalone';
import { NgOptimizedImage } from '@angular/common';
import { IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ViewWillEnter } from '@ionic/angular/standalone';
import { ScrollHandlerDirective, showFooter } from '@/directives/scroll-handler.directive';

type Tab = 'events' | 'feed';

@Component({
  selector: 'home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonFab,
    HomeFeed,
    IonHeader,
    HomeEvent,
    IonToolbar,
    IonContent,
    SegmentButton,
    ProfileHeaderToolbar,
    IonRefresher,
    IonRefresherContent,
    NgOptimizedImage,
    ScrollHandlerDirective,
    Button
]
})
export class Home implements OnDestroy, ViewWillEnter {
  // services
  navCtrl = inject(NavController);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  navigationService = inject(NavigationService);
  showFab = showFooter;
  showFabButton(): boolean {
    return this.tab() === 'feed' && this.showFab();
  }
  homeFeedRefSignal = viewChild<HomeFeed>('homeFeedRef');
  homeEventRefSignal = viewChild<HomeEvent>('homeEventRef');

  // signals
  tab = signal<Tab>('events');
  isLoggedIn = computed(() => !!this.authService.currentUser());
  currentUser = this.authService.currentUser;

  // subscriptions
  private queryParamsSubscription?: Subscription;

  // variables
  tabItems: SegmentButtonItem[] = [
    {
      value: 'events',
      label: 'Events',
      iconClass: 'pi-calendar-clock'
    },
    {
      value: 'feed',
      label: 'My Feed',
      iconClass: 'pi-book'
    }
  ];

  ionViewWillEnter(): void {
    const params = this.route.snapshot.queryParamMap;
    const tabParam = params.get('tab');

    if (tabParam === 'events' || tabParam === 'feed') {
      this.tab.set(tabParam as Tab);
    } else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: this.tab() },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  }

  onSegmentChange(value: string): void {
    const newTab = value as Tab;
    this.tab.set(newTab);
    const queryParams: any = { tab: newTab };

    if (newTab === 'events') {
      queryParams.feedFilter = null;
    } else if (newTab === 'feed') {
      queryParams.eventFilter = null;
    }

    // Update URL with query param
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  async onRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      const currentTab = this.tab();

      if (currentTab === 'events') {
        const homeEvent = this.homeEventRefSignal();
        if (homeEvent) {
          await homeEvent.refresh();
        }
      } else if (currentTab === 'feed') {
        const homeFeed = this.homeFeedRefSignal();
        if (homeFeed) {
          await homeFeed.refresh();
        }
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      event.target.complete();
    }
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
  }
 
  onCreatePost(){
    this.navigationService.navigateForward('/new-post')
  }
}
