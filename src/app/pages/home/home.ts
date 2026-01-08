import { HomeFeed } from '@/pages/home/home-feed';
import { HomeEvent } from '@/pages/home/home-event';
import { AuthService } from '@/services/auth.service';
import { ProfileHeaderToolbar } from '@/components/common/profile-header-toolbar';
import { SegmentButton, SegmentButtonItem } from '@/components/common/segment-button';
import { signal, inject, computed, Component, ChangeDetectionStrategy, ViewChild, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, NavController, RefresherCustomEvent } from '@ionic/angular/standalone';
import { NgOptimizedImage } from '@angular/common';
import { IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ViewWillEnter } from '@ionic/angular/standalone';
import { ScrollHandlerDirective } from '@/directives/scroll-handler.directive';

type Tab = 'events' | 'feed';

@Component({
  selector: 'home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeFeed, IonHeader, HomeEvent, IonToolbar, IonContent, SegmentButton, ProfileHeaderToolbar, IonRefresher, IonRefresherContent, NgOptimizedImage, ScrollHandlerDirective]
})
export class Home implements OnDestroy, ViewWillEnter {
  // services
  navCtrl = inject(NavController);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  @ViewChild('homeFeedRef') homeFeedRef?: HomeFeed;
  

  // signals
  tab = signal<Tab>('events');
  isLoggedIn = computed(() => !!this.authService.currentUser());
  
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
      // Refresh will be handled by the child component if needed
      if (this.homeFeedRef) {
        await this.homeFeedRef.refresh();
      }
    } catch (error) {
      console.error('Error refreshing feed:', error);
    } finally {
      event.target.complete();
    }
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
  }
}
