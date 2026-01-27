import { Chip } from '@/components/common/chip';
import { Button } from '@/components/form/button';
import { ActivatedRoute } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { EventService } from '@/services/event.service';
import { Searchbar } from '@/components/common/searchbar';
import { ViewResponse } from '../components/view-response';
import { EmptyState } from '@/components/common/empty-state';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { SegmentButton } from '@/components/common/segment-button';
import { IonContent, IonToolbar, IonHeader } from '@ionic/angular/standalone';
import { QuestionnaireAnalytics } from '../components/questionnaire-analytics';
import { Component, computed, inject, signal, ChangeDetectionStrategy, effect, OnInit } from '@angular/core';
import { NavController, IonInfiniteScrollContent, IonInfiniteScroll } from '@ionic/angular/standalone';
@Component({
  selector: 'questionnaire-response',
  styleUrl: './questionnaire-response.scss',
  templateUrl: './questionnaire-response.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonToolbar,
    IonContent,
    IonHeader,
    Chip,
    Searchbar,
    Button,
    ViewResponse,
    QuestionnaireAnalytics,
    EmptyState,
    NgOptimizedImage,
    SegmentButton
  ]
})
export class QuestionnaireResponse {
  navCtrl = inject(NavController);
  route = inject(ActivatedRoute);
  eventService = inject(EventService);

  user = signal<any>(null);
  questions = signal<any>(null);
  isHost = signal<boolean>(true);
  searchQuery = signal<string>('');
  isDownloading = signal<boolean>(false);
  isViewResponse = signal<boolean>(false);
  totalResponses = signal<number>(0);
  filter = signal<'responses' | 'analytics'>('responses');
  segmentValue = signal<string>('pre-event');
  isLoadingMore = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);
  analytics = signal<any[]>([]);
  eventId = signal<string>('');

  hasMore = computed(() => this.currentPage() < this.totalPages());
  isResponsesMode = computed(() => (this.segmentValue() === 'pre-event' || this.segmentValue() === 'post-event') && this.filter() === 'responses');
  segmentItems = computed(() => [
    { value: 'pre-event', label: 'Pre-Event' },
    { value: 'post-event', label: 'Post-Event' }
  ]);
  constructor() {
    effect(() => {
      const segment = this.segmentValue();
      const filter = this.filter();
      const eventId = this.eventId();

      // prevent firing before required data exists
      if (!segment || !filter || !eventId) return;

      this.loadData();
    });
  }

  private navEffect = effect(async () => {
    const eventId = this.route.snapshot.paramMap.get('id');
    this.eventId.set(eventId || '');
    const params = this.route.snapshot.queryParamMap;
    const tabParam = params.get('Host');
    this.isHost.set(tabParam == 'false' ? false : true);
    if (!this.isHost()) {
      this.segmentValue.set('pre-event');
      this.filter.set('analytics');
    }
  });

  loadData = async () => {
    const eventId = this.eventId() || '';
    const phase = this.segmentValue() === 'pre-event' ? 'PreEvent' : 'PostEvent';
    const search = this.searchQuery() || '';

    let response: any;

    if (this.filter() === 'responses') {
      response = await this.eventService.getEventQuestionnaireResponses(eventId, phase, search);

      this.analytics.set(response?.users || []);
      this.totalResponses.set(response?.pagination?.totalCount || 0);
      this.totalPages.set(response?.pagination?.totalPages || 0);
    } else {
      response = await this.eventService.getEventQuestionAnalysis(eventId, phase);

      this.analytics.set(response?.questions || []);
      this.totalResponses.set(response?.total_responses || 0);
      this.totalPages.set(response?.pagination?.totalPages || 0);
    }
  };

  loadMoreUsers = async (event: Event): Promise<void> => {
    const infiniteScroll = event.target as HTMLIonInfiniteScrollElement;

    if (this.isLoadingMore() || !this.hasMore()) {
      infiniteScroll.complete();
      return;
    }

    try {
      this.isLoadingMore.set(true);

      const nextPage = this.currentPage() + 1;
      const eventId = this.eventId() || '';
      const phase = this.segmentValue() === 'pre-event' ? 'PreEvent' : 'PostEvent';
      const search = this.searchQuery() || '';

      let response: any;

      if (this.filter() === 'responses') {
        response = await this.eventService.getEventQuestionnaireResponses(eventId, phase, search, nextPage, 20);

        this.analytics.update((current) => [...current, ...(response?.users || [])]);

        this.totalPages.set(response?.pagination?.totalPages || 0);
      } else {
        response = await this.eventService.getEventQuestionAnalysis(eventId, phase, nextPage, 20);

        this.analytics.update((current) => [...current, ...(response?.questions || [])]);

        this.totalPages.set(response?.pagination?.totalPages || 0);
      }

      this.currentPage.set(nextPage);
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      this.isLoadingMore.set(false);
      infiniteScroll.complete();
    }
  };

  filteredSuggestions = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    const activeFlag = this.segmentValue() === 'pre-event' ? 'pre' : 'post';

    return this.analytics().filter((item) => {
      const matchesSegment = item.flag === activeFlag;
      const matchesSearch = !search || item.question?.toLowerCase().includes(search);
      return matchesSegment && matchesSearch;
    });
  });

  filteredAnalytics = computed(() => {
    const analytics = this.analytics();

    if (!this.isHost()) {
      return analytics.filter((item) => item.visibility === 'public');
    }

    const flag = this.segmentValue() === 'pre-event' ? 'pre' : 'post';
    return analytics.filter((item) => item.flag === flag);
  });

  goBack() {
    if (this.isViewResponse()) {
      this.isViewResponse.set(false);
    } else {
      this.navCtrl.back();
    }
  }

  viewResponse = async (user: any) => {
    this.isViewResponse.set(true);
    const response = await this.eventService.getEventQuestionnaireResponsesByUserId(
      user.id,
      this.eventId() || '',
      this.segmentValue() === 'pre-event' ? 'PreEvent' : 'PostEvent'
    );
    this.user.set(user);
    this.questions.set(response?.questions);
  };

  downloadResponses() {
    this.isDownloading.set(true);
    setTimeout(() => {
      this.isDownloading.set(false);
    }, 2000);
  }

  onImageError(event: Event): void {
    onImageError(event);
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }

  diamondPath = computed(() => {
    const points = this.user()?.total_gamification_points || 0;

    if (points >= 50000) {
      return '/assets/svg/gamification/diamond-50k.svg';
    } else if (points >= 40000) {
      return '/assets/svg/gamification/diamond-40k.svg';
    } else if (points >= 30000) {
      return '/assets/svg/gamification/diamond-30k.svg';
    } else if (points >= 20000) {
      return '/assets/svg/gamification/diamond-20k.svg';
    } else if (points >= 10000) {
      return '/assets/svg/gamification/diamond-10k.svg';
    } else if (points >= 5000) {
      return '/assets/svg/gamification/diamond-5k.svg';
    } else {
      return '/assets/svg/gamification/diamond-1k.svg';
    }
  });
}
