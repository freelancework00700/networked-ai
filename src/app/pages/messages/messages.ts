import {
  IonAvatar,
  IonBadge,
  IonItem,
  IonLabel,
  IonList,
  IonContent,
  IonHeader,
  IonToolbar,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  NavController
} from '@ionic/angular/standalone';
import { CommonModule, NgOptimizedImage, DatePipe } from '@angular/common';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Searchbar } from '@/components/common/searchbar';
import { AuthEmptyState } from '@/components/common/auth-empty-state';
import { AuthService } from '@/services/auth.service';
import { MessagesService } from '@/services/messages.service';
import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit, effect, OnDestroy, DestroyRef, untracked } from '@angular/core';
import { Subject, from, distinctUntilChanged, switchMap, debounce, timer, of, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScrollHandlerDirective } from '@/directives/scroll-handler.directive';
import { ChatRoom } from '@/interfaces/IChat';
import { IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { onImageError, getImageUrlOrDefault } from '@/utils/helper';
import { NavigationService } from '@/services/navigation.service';

type MessagesTab = 'all' | 'unread' | 'group' | 'event' | 'network';

@Component({
  selector: 'messages',
  imports: [
    Button,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonAvatar,
    IonHeader,
    Searchbar,
    IonContent,
    IonToolbar,
    CommonModule,
    NgOptimizedImage,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    AuthEmptyState,
    ScrollHandlerDirective,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent
  ],
  styleUrl: './messages.scss',
  templateUrl: './messages.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Messages implements OnInit, OnDestroy {
  private navCtrl = inject(NavController);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);
  private messagesService = inject(MessagesService);
  private navigationService = inject(NavigationService);
  private datePipe = new DatePipe('en-US');
  private destroyRef = inject(DestroyRef);

  // computed
  isLoggedIn = computed(() => !!this.authService.currentUser());
  isLoading = this.messagesService.isLoading;
  chatRooms = this.messagesService.chatRooms;
  pagination = this.messagesService.pagination;

  readonly tabs = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'group', label: 'Group' },
    { value: 'event', label: 'Event' },
    { value: 'network', label: 'Network' }
  ] satisfies ReadonlyArray<{ value: MessagesTab; label: string }>;

  activeTab = signal<MessagesTab>('all');
  searchInput = signal<string>('');

  private reloadSubject = new Subject<{ query: string; tab: MessagesTab; immediate: boolean }>();
  private isInitialized = false;

  hasMoreRooms = computed(() => {
    const pag = this.pagination();
    return pag.currentPage < pag.totalPages;
  });

  constructor() {
    this.reloadSubject
      .pipe(
        debounce(({ immediate, query }) => {
          if (immediate) return of(0);
          return query.trim() ? timer(300) : of(0);
        }),
        map(({ query, tab }) => ({ query: query.trim(), tab })),
        distinctUntilChanged((a, b) => a.query === b.query && a.tab === b.tab),
        switchMap(({ query, tab }) => from(this.messagesService.resetAndLoad(query || undefined, tab))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    // Watch search input changes (debounced)
    effect(() => {
      const query = this.searchInput();
      if (this.isLoggedIn() && this.isInitialized) {
        this.reloadSubject.next({ query, tab: this.activeTab(), immediate: false });
      }
    });

    // Watch tab changes (immediate), but DO NOT re-run on every keypress.
    effect(() => {
      const tab = this.activeTab();
      if (this.isLoggedIn() && this.isInitialized) {
        const query = untracked(() => this.searchInput());
        this.reloadSubject.next({ query, tab, immediate: true });
      }
    });
  }

  async ngOnInit() {
    if (this.isLoggedIn()) {
      await this.loadChatRooms();
      this.isInitialized = true;
    }
  }

  ngOnDestroy(): void {
    // Cleanup is handled by takeUntilDestroyed
  }

  /**
   * Load chat rooms from API
   */
  async loadChatRooms(reset: boolean = true): Promise<void> {
    try {
      const page = reset ? 1 : this.messagesService.currentPage() + 1;
      const filter = this.activeTab();
      const search = this.searchInput().trim() || undefined;

      await this.messagesService.getChatRooms({
        page,
        limit: 10,
        search,
        filter,
        append: !reset
      });
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  }

  /**
   * Load more rooms for infinite scroll
   */
  async loadMoreRooms(event: Event): Promise<void> {
    const infiniteScroll = (event as CustomEvent).target as HTMLIonInfiniteScrollElement;

    if (!this.hasMoreRooms()) {
      infiniteScroll.complete();
      return;
    }

    try {
      await this.loadChatRooms(false);
    } catch (error) {
      console.error('Error loading more rooms:', error);
    } finally {
      infiniteScroll.complete();
    }
  }

  /**
   * Get filtered chat rooms based on active tab
   * Filtering is now handled by the API, so we just return the rooms
   */
  getFilteredChatRooms = computed(() => {
    return this.chatRooms();
  });

  /**
   * Get chat display name (for personal chats, use other user's name)
   */
  getChatName(room: ChatRoom): string {
    // If event is available, use event title
    if (room.event?.title) {
      return room.event.title;
    }

    if (room.name) {
      return room.name;
    }

    // For personal chats without name, use other user's name
    if (room.is_personal && room.users && room.users.length > 0) {
      const currentUserId = this.authService.currentUser()?.id;
      const otherUser = room.users.find((user) => user.id !== currentUserId);
      return otherUser?.name || otherUser?.username || 'Unknown User';
    }

    return 'Unknown Chat';
  }

  /**
   * Get chat avatar image URL
   */
  getChatImage(room: ChatRoom): string {
    if (room.event?.thumbnail_url) {
      return room.event.thumbnail_url;
    }

    if (room.event?.image_url) {
      return room.event.image_url;
    }

    if (room.profile_image) return room.profile_image;

    // For personal chats, use other user's thumbnail
    if (room.is_personal && room.users && room.users.length > 0) {
      const currentUserId = this.authService.currentUser()?.id;
      const otherUser = room.users.find((user) => user.id !== currentUserId);
      return otherUser?.thumbnail_url || '';
    }
    return '';
  }

  /**
   * Get current user's unread count for a chat room
   */
  getUnreadCount(room: ChatRoom): number {
    if (!room.users || room.users.length === 0) return 0;
    const currentUserId = this.authService.currentUser()?.id;
    if (!currentUserId) return 0;

    const currentUser = room.users.find((user) => user.id === currentUserId);
    return currentUser?.unreadMessageCount || 0;
  }

  /**
   * Get chat type flags
   */
  isGroupChat(room: ChatRoom): boolean {
    return !room.is_personal && !room.event_id && !room.is_broadcast;
  }

  isEventChat(room: ChatRoom): boolean {
    return !!room.event_id;
  }

  isNetworkChat(room: ChatRoom): boolean {
    return room.is_broadcast;
  }

  formatTime(isoString: string): string {
    if (!isoString) return '';

    const date = new Date(isoString);
    const now = new Date();

    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

    if (isToday) {
      return this.datePipe.transform(date, 'h:mm a') || '';
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return this.datePipe.transform(date, 'MM/dd/yyyy') || '';
    }
  }

  startNewChat() {
    this.navCtrl.navigateForward('/new-chat');
  }

  async muteChat(room: ChatRoom) {
    // TODO: Implement mute API call when available
    const chatName = this.getChatName(room);
    const result = await this.modalService.openConfirmModal({
      icon: 'assets/svg/alertOffBlackIcon.svg',
      iconBgColor: '#ABABAB',
      title: 'Mute Chat',
      description: `Are you sure you want to mute the chat "${chatName}"?`,
      confirmButtonLabel: 'Mute',
      cancelButtonLabel: 'Cancel',
      confirmButtonColor: 'primary',
      iconPosition: 'left'
    });

    if (result && result.role === 'confirm' && result.data) {
      // TODO: Update mute status via API
      console.log('Mute chat:', room.id);
    }
  }

  async deleteChat(room: ChatRoom) {
    // TODO: Implement delete API call when available
    const chatName = this.getChatName(room);
    const result = await this.modalService.openConfirmModal({
      icon: 'assets/svg/deleteWhiteIcon.svg',
      iconBgColor: '#C73838',
      title: 'Delete Chat',
      description: `Are you sure you want to delete the chat "${chatName}"?`,
      confirmButtonLabel: 'Delete',
      cancelButtonLabel: 'Cancel',
      confirmButtonColor: 'danger',
      iconPosition: 'left'
    });

    if (result && result.role === 'confirm') {
      const roomId = room.id;
      const currentUserId = this.authService.currentUser()?.id;

      if (!roomId || !currentUserId) {
        console.error('Missing roomId or userId');
        return;
      }

      try {
        await this.messagesService.leaveRoom(roomId, currentUserId);
      } catch (error) {
        console.error('Error leaving group:', error);
      }
    }
  }

  goToChat(room: ChatRoom) {
    console.log('goToChat', room);

    // Pass room data in state - chat-room will use user_ids and is_personal to create/get room
    this.navigationService.navigateForward('/chat-room', false, {
      chatRoom: room,
      user_ids: room.user_ids,
      is_personal: room.is_personal,
      name: room.name,
      event_id: room.event_id,
      event_image: room.event_image,
      profile_image: room.profile_image
    });
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }

  onImageError(event: Event): void {
    onImageError(event);
  }
}
