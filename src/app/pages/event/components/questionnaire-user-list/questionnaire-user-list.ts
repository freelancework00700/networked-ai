import { Button } from '@/components/form/button';
import { AuthService } from '@/services/auth.service';
import { EventService } from '@/services/event.service';
import { SocketService } from '@/services/socket.service';
import { UserCardList } from '@/components/card/user-card-list';
import { NavigationService } from '@/services/navigation.service';
import { NetworkConnectionUpdate } from '@/interfaces/socket-events';
import { Component, effect, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { IonContent, IonToolbar, IonHeader, IonInfiniteScrollContent, IonInfiniteScroll } from '@ionic/angular/standalone';

@Component({
  selector: 'questionnaire-user-list',
  styleUrl: './questionnaire-user-list.scss',
  templateUrl: './questionnaire-user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonInfiniteScroll, IonInfiniteScrollContent, IonHeader, IonToolbar, IonContent, UserCardList]
})
export class QuestionnaireUserList {
  navigationService = inject(NavigationService);
  eventService = inject(EventService);
  private authService = inject(AuthService);
  private socketService = inject(SocketService);

  question = signal<any>(null);
  option = signal<any>(null);
  users = signal<any[]>([]);
  currentPage = signal<number>(1);
  isLoading = signal<boolean>(false);
  totalPages = signal<number>(0);
  hasMore = computed(() => this.currentPage() < this.totalPages());

  private navEffect = effect(async () => {
    const state = history.state;

    if (state?.questionOption) {
      this.question.set(state.questionOption);
    }
    if (state?.option) {
      this.option.set(state.option);
    }

    const response = await this.eventService.getEventQuestionOptionUsers(this.question()?.id, this.option()?.id);
    this.users.set(response?.users);
  });

  ngOnInit() {
    this.setupNetworkConnectionListener();
  }

  loadUsers = async (page: number, append = false) => {
    if (this.isLoading()) return;

    try {
      this.isLoading.set(true);

      const response = await this.eventService.getEventQuestionOptionUsers(this.question()?.id, this.option()?.id, page, 20);

      this.totalPages.set(response?.pagination?.totalPages || 0);
      this.currentPage.set(page);

      this.users.update((current) => (append ? [...current, ...(response?.users || [])] : response?.users || []));
    } catch (error) {
      console.error('Error loading option users:', error);
    } finally {
      this.isLoading.set(false);
    }
  };

  loadMoreUsers = async (event: Event): Promise<void> => {
    const infiniteScroll = event.target as HTMLIonInfiniteScrollElement;

    if (!this.hasMore() || this.isLoading()) {
      infiniteScroll.complete();
      return;
    }

    await this.loadUsers(this.currentPage() + 1, true);
    infiniteScroll.complete();
  };

  addSuggestion(id: string) {
    const user = this.users().find((item) => item.id === id);
    if (!user) return;

    user.requested = true;
    user.networked = false;
  }

  messageUser(id: string) {
    const currentUserId = this.authService.currentUser()?.id;

    if (currentUserId && id) {
      this.navigationService.navigateForward('/chat-room', false, {
        user_ids: [currentUserId, id],
        is_personal: true
      });
    }
  }

  private setupNetworkConnectionListener(): void {
    this.socketService.onAfterRegistration(() => {
      this.socketService.on('network:connection:update', this.networkConnectionHandler);
    });
  }

  private networkConnectionHandler = (payload: NetworkConnectionUpdate) => {
    if (!payload || !payload.id) return;

    const userId = payload.id;
    const newStatus = payload.connection_status;

    this.users.update((users) => users.map((user) => (user.id === userId ? { ...user, connection_status: newStatus } : user)));
  };

  ngOnDestroy(): void {
    this.socketService.off('network:connection:update', this.networkConnectionHandler);
  }
}
