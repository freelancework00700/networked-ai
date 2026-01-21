import { NotificationType } from '@/enums/enums';
import { Button } from '@/components/form/button';
import { NgOptimizedImage } from '@angular/common';
import { TimeAgoPipe } from '@/pipes/time-ago.pipe';
import { EventService } from '@/services/event.service';
import { INotification } from '@/interfaces/INotification';
import { ToasterService } from '@/services/toaster.service';
import { NetworkService } from '@/services/network.service';
import { EmptyState } from '@/components/common/empty-state';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { NotificationsService } from '@/services/notifications.service';
import { IonContent, IonHeader, IonIcon, IonToolbar, NavController } from '@ionic/angular/standalone';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { IonRefresher, IonInfiniteScroll, IonRefresherContent, RefresherCustomEvent, IonInfiniteScrollContent} from '@ionic/angular/standalone';

@Component({
  selector: 'notification',
  styleUrl: './notification.scss',
  templateUrl: './notification.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    IonIcon,
    IonHeader,
    IonContent,
    IonToolbar,
    EmptyState,
    TimeAgoPipe,
    IonRefresher,
    NgOptimizedImage,
    IonInfiniteScroll,
    IonRefresherContent,
    IonInfiniteScrollContent
  ]
})
export class Notification {
  // services
  private navCtrl = inject(NavController);
  private eventService = inject(EventService);
  private networkService = inject(NetworkService);
  private toasterService = inject(ToasterService);
  private notificationsService = inject(NotificationsService);
  
  // signals
  isLoadingMore = signal(false);
  notifications = this.notificationsService.notifications;
  notificationFilter = signal<NotificationType>(NotificationType.ALL);
  
  // computed
  isLoading = computed(() => this.notificationsService.isLoading());
  pagination = computed(() => this.notificationsService.pagination());
  unreadCount = computed(() => this.notificationsService.unreadCount());
  hasMore = computed(() => this.pagination().currentPage < this.pagination().totalPages);

  // constants
  readonly tabs: Array<{ value: NotificationType; label: string }> = [
    { value: NotificationType.ALL, label: 'All' },
    { value: NotificationType.UNREAD, label: 'Unread' },
    { value: NotificationType.MY_EVENTS, label: 'My Events' },
    { value: NotificationType.RSVP_REQUEST, label: 'RSVP Requests' },
    { value: NotificationType.INVITATION, label: 'Invitations' },
    { value: NotificationType.EVENTS, label: 'Events' },
    { value: NotificationType.NETWORK, label: 'Network' }
  ];

  constructor() {
    effect(() => {
      const limit = untracked(() => this.pagination().limit);
      this.notificationsService.resetAndLoad(this.notificationFilter(), limit);
    });
    
    // fetch unread count on component initialization
    this.notificationsService.fetchUnreadCount();
  }

  async loadMore(): Promise<void> {
    const pagination = this.pagination();
    if (this.isLoading()) return;
    if (pagination.currentPage >= pagination.totalPages) return;

    await this.notificationsService.loadNotifications({
      page: pagination.currentPage + 1,
      limit: pagination.limit,
      type: this.notificationFilter(),
      append: true
    });
  }

  loadMoreNotifications = async (event: Event): Promise<void> => {
    const infiniteScroll = (event as CustomEvent).target as HTMLIonInfiniteScrollElement;

    if (this.isLoadingMore() || !this.hasMore()) {
      infiniteScroll.complete();
      return;
    }

    try {
      this.isLoadingMore.set(true);
      await this.loadMore();
    } catch (error) {
      console.error('Error loading more notifications:', error);
    } finally {
      this.isLoadingMore.set(false);
      infiniteScroll.complete();
    }
  };

  async onRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      await this.notificationsService.resetAndLoad(this.notificationFilter(), this.pagination().limit);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      event.target.complete();
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await this.notificationsService.markAllNotificationsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async acceptNetwork(userId: string): Promise<void> {
    try {
      await this.networkService.acceptNetworkRequest(userId);
    } catch (error) {
      console.error('Error accepting network request:', error);
      this.toasterService.showError('Failed to accept network request');
    }
  }
  
  async rejectNetwork(userId: string): Promise<void> {
    try {
      await this.networkService.rejectNetworkRequest(userId);
    } catch (error) {
      console.error('Error rejecting network request:', error);
      this.toasterService.showError('Failed to reject network request');
    }
  }

  async acceptRsvpRequest(notification: INotification): Promise<void> {
    try {

      const eventId = notification.event?.id;
      const requestId = notification.event?.rsvp_requests?.[0]?.id;
      if(!eventId || !requestId) return;

      await this.eventService.approveOrRejectRsvpRequest(eventId, requestId, 'Approved');
    } catch (error) {
      console.error('Error approving RSVP request:', error);
      this.toasterService.showError('Failed to approve RSVP request');
    }
  }

  async rejectRsvpRequest(notification: INotification): Promise<void> {
    try {

      const eventId = notification.event?.id;
      const requestId = notification.event?.rsvp_requests?.[0]?.id;
      if(!eventId || !requestId) return;

      await this.eventService.approveOrRejectRsvpRequest(eventId, requestId, 'Rejected');
    } catch (error) {
      console.error('Error approving RSVP request:', error);
      this.toasterService.showError('Failed to reject RSVP request');
    }
  }

  async handleNotificationClick(notification: INotification): Promise<void> {
    this.notificationsService.markNotificationRead(notification.id);

    if(notification.type === NotificationType.NETWORK) {
      this.navCtrl.navigateForward(`/${notification.related_user?.username}`);
    } else if (notification.type === NotificationType.MY_EVENTS || notification.type === NotificationType.EVENTS) {
      this.navCtrl.navigateForward(`/event/${notification.event?.slug}`);
    } else if(notification.type === NotificationType.RSVP_REQUEST) {
      this.navCtrl.navigateForward(`/${notification.related_user?.username}`);
    }
  }

  getEmptyStateMessage(): { title: string; description: string } {
    const filter = this.notificationFilter();
    const messages: Record<NotificationType, { title: string; description: string }> = {
      [NotificationType.ALL]: {
        title: 'No Notifications Yet',
        description: 'Your events, RSVPs, and connections are quiet for now.'
      },
      [NotificationType.UNREAD]: {
        title: 'No Unread Notifications',
        description: "You're all caught up! No new notifications to read."
      },
      [NotificationType.MY_EVENTS]: {
        title: 'No My Events Notifications',
        description: "You don't have any notifications related to your events."
      },
      [NotificationType.RSVP_REQUEST]: {
        title: 'No RSVP Requests',
        description: "You don't have any pending RSVP requests at the moment."
      },
      [NotificationType.INVITATION]: {
        title: 'No Invitations',
        description: "You don't have any pending invitations right now."
      },
      [NotificationType.EVENTS]: {
        title: 'No Event Notifications',
        description: "You don't have any event-related notifications."
      },
      [NotificationType.NETWORK]: {
        title: 'No Network Notifications',
        description: "You don't have any network activity notifications."
      }
    };
    return messages[filter];
  }

  goBack(): void {
    this.navCtrl.back();
  }

  onImageError(event: Event): void {
    onImageError(event);
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl, 'assets/images/profile.jpeg');
  }
}
