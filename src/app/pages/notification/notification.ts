import { Button } from '@/components/form/button';
import { EmptyState } from '@/components/common/empty-state';
import { INotification, NotificationFilter } from '@/interfaces/INotification';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IonContent, IonHeader, IonIcon, IonToolbar, NavController } from '@ionic/angular/standalone';
import { ModalService } from '@/services/modal.service';

@Component({
  selector: 'notification',
  styleUrl: './notification.scss',
  templateUrl: './notification.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, IonContent, IonHeader, IonToolbar, Button, EmptyState]
})
export class Notification {
  private navCtrl = inject(NavController);

  tabs: Array<{ value: NotificationFilter; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'my-events', label: 'My Events' },
    { value: 'rsvp-requests', label: 'RSVP Requests' },
    { value: 'invitations', label: 'Invitations' },
    { value: 'events', label: 'Events' },
    { value: 'network', label: 'Network' }
  ];

  notificationFilter = signal<NotificationFilter>('all');
  modalService = inject(ModalService);
  notifications = signal<INotification[]>([
    {
      id: '1',
      type: 'event-live',
      category: ['my-events', 'events'],
      isRead: false,
      timestamp: '1m',
      message: 'Your event <strong>Atlanta Makes Me Laugh</strong> is live! Share the words with everyone.',
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '2',
      type: 'cohost-invitation',
      category: ['invitations'],
      isRead: false,
      timestamp: '10m',
      message: 'Jordan H. invited you to be a <strong>Cohost</strong> for <strong>Atlanta Makes me Laugh.</strong>',
      user: {
        id: 'user-1',
        name: 'Jordan H.',
        avatar: 'assets/images/profile.jpeg'
      },
      event: {
        id: 'event-1',
        name: 'Atlanta Makes me Laugh.',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '3',
      type: 'sponsor-invitation',
      category: ['invitations'],
      isRead: false,
      timestamp: '10m',
      message: 'Jordan H. invited you to be a <strong>Sponsor</strong> for <strong>Atlanta Makes me Laugh.</strong>',
      user: {
        id: 'user-1',
        name: 'Jordan H.',
        avatar: 'assets/images/profile.jpeg'
      },
      event: {
        id: 'event-1',
        name: 'Atlanta Makes me Laugh.',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '4',
      type: 'speaker-invitation',
      category: ['invitations'],
      isRead: false,
      timestamp: '10m',
      message: 'Jordan H. invited you to be a <strong>Speaker</strong> for <strong>Atlanta Makes me Laugh.</strong>',
      user: {
        id: 'user-1',
        name: 'Jordan H.',
        avatar: 'assets/images/profile.jpeg'
      },
      event: {
        id: 'event-1',
        name: 'Atlanta Makes me Laugh.',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '5',
      type: 'event-update',
      category: ['my-events', 'events'],
      isRead: false,
      timestamp: '1m',
      message: 'The details for <strong>Atlanta Makes Me Laugh</strong> have been updated.',
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      },
      originalEvent: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      },
      updatedEvent: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Sat, Aug 31',
        time: '6:00PM'
      }
    },
    {
      id: '6',
      type: 'ticket-sold-out',
      category: ['my-events'],
      isRead: false,
      timestamp: '1m',
      message: 'The <strong>Premium</strong> tickets for <strong>Atlanta Makes Me Laugh</strong> are now sold out!',
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '7',
      type: 'join-request',
      category: ['rsvp-requests'],
      isRead: false,
      timestamp: '1m',
      message: '<strong>Randy T.</strong> has requested to join <strong>Atlanta Makes Me Laugh</strong>',
      user: {
        id: 'user-2',
        name: 'Randy T.',
        avatar: 'assets/images/profile.jpeg'
      },
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '8',
      type: 'spot-secured',
      category: ['events'],
      isRead: false,
      timestamp: '1m',
      message: 'Your spot for <strong>Atlanta Makes Me Laugh</strong> on Aug 18 at 7PM is secured!',
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Aug 18',
        time: '7PM'
      }
    },
    {
      id: '9',
      type: 'event-reminder',
      category: ['events'],
      isRead: false,
      timestamp: '1m',
      message: 'The event <strong>Atlanta Makes Me Laugh</strong> starts tomorrow.',
      event: {
        id: 'event-1',
        name: 'Atlanta Makes me Laugh.',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '10',
      type: 'check-in',
      category: ['events'],
      isRead: false,
      timestamp: '1m',
      message: "Welcome to <strong>Atlanta Makes Me Laugh!</strong> You're officially checked-in and ready to enjoy the event.",
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '11',
      type: 'check-in-reminder',
      category: ['events'],
      isRead: false,
      timestamp: '1m',
      message: "The host hasn't marked you as checked-in for <strong>Atlanta Makes Me Laugh</strong> (started at 7PM)",
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '12',
      type: 'network-invitation',
      category: ['network'],
      isRead: false,
      timestamp: '1m',
      message: '<strong>Mike Letters</strong> added you to their network.',
      user: {
        id: 'user-3',
        name: 'Mike Letters',
        avatar: 'assets/images/profile.jpeg'
      }
    },
    {
      id: '13',
      type: 'group-chat-invitation',
      category: ['network'],
      isRead: false,
      timestamp: '1m',
      message: 'Mike Letters invited you to the group chat: <strong>Atlanta Makes Me Laugh</strong>',
      user: {
        id: 'user-3',
        name: 'Mike Letters',
        avatar: 'assets/images/profile.jpeg'
      },
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '14',
      type: 'post-like',
      category: ['network'],
      isRead: false,
      timestamp: '1m',
      message: '<strong>Mike Letters</strong> liked your post.',
      user: {
        id: 'user-3',
        name: 'Mike Letters',
        avatar: 'assets/images/profile.jpeg'
      },
      postThumbnail: 'assets/images/profile.jpeg'
    },
    {
      id: '15',
      type: 'multiple-likes',
      category: ['network'],
      isRead: false,
      timestamp: '1m',
      message: '<strong>Mike Letters, Tony H., and 130 others</strong> liked your post.',
      users: [
        {
          id: 'user-3',
          name: 'Mike Letters',
          avatar: 'assets/images/profile.jpeg'
        },
        {
          id: 'user-4',
          name: 'Tony H.',
          avatar: 'assets/images/profile.jpeg'
        }
      ],
      postThumbnail: 'assets/images/profile.jpeg'
    },
    {
      id: '16',
      type: 'comment-liked',
      category: ['network'],
      isRead: false,
      timestamp: '1m',
      message: '<strong>Mike Letters</strong> liked your comment:',
      user: {
        id: 'user-3',
        name: 'Mike Letters',
        avatar: 'assets/images/profile.jpeg'
      },
      commentText: "I'd also love to join the event!"
    },
    {
      id: '17',
      type: 'comment-liked',
      category: ['network'],
      isRead: false,
      timestamp: '1m',
      message: '<strong>Mike Letters, Tony H., and 130 others</strong> liked your comment:',
      users: [
        {
          id: 'user-3',
          name: 'Mike Letters',
          avatar: 'assets/images/profile.jpeg'
        },
        {
          id: 'user-4',
          name: 'Tony H.',
          avatar: 'assets/images/profile.jpeg'
        }
      ],
      commentText: 'I also loved the event!'
    },
    {
      id: '18',
      type: 'comment-reply',
      category: ['network'],
      isRead: false,
      timestamp: '1m',
      message: "<strong>Mike Letters</strong> replied to your comment on <strong>Jerome T.'s</strong> post:",
      user: {
        id: 'user-3',
        name: 'Mike Letters',
        avatar: 'assets/images/profile.jpeg'
      },
      commentText: "I'd also love to join the event!"
    },
    {
      id: '19',
      type: 'cohost-acceptance',
      category: ['my-events'],
      isRead: false,
      timestamp: '10m',
      message: 'Jordan H. accepted your invitation to be a <strong>Cohost</strong> on <strong>Atlanta Makes me Laugh.</strong>',
      user: {
        id: 'user-1',
        name: 'Jordan H.',
        avatar: 'assets/images/profile.jpeg'
      },
      event: {
        id: 'event-1',
        name: 'Atlanta Makes me Laugh.',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '20',
      type: 'sponsor-acceptance',
      category: ['my-events'],
      isRead: false,
      timestamp: '10m',
      message: 'Jordan H. accepted your invitation to be a <strong>Sponsor</strong> on <strong>Atlanta Makes me Laugh.</strong>',
      user: {
        id: 'user-1',
        name: 'Jordan H.',
        avatar: 'assets/images/profile.jpeg'
      },
      event: {
        id: 'event-1',
        name: 'Atlanta Makes me Laugh.',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '21',
      type: 'speaker-acceptance',
      category: ['my-events'],
      isRead: false,
      timestamp: '10m',
      message: 'Jordan H. accepted your invitation to be a <strong>Speaker</strong> on <strong>Atlanta Makes me Laugh.</strong>',
      user: {
        id: 'user-1',
        name: 'Jordan H.',
        avatar: 'assets/images/profile.jpeg'
      },
      event: {
        id: 'event-1',
        name: 'Atlanta Makes me Laugh.',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '22',
      type: 'event-cancelled',
      category: ['my-events'],
      isRead: false,
      timestamp: '1m',
      message: 'Your event <strong>Atlanta Makes Me Laugh</strong> has been cancelled.',
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '23',
      type: 'maximum-capacity',
      category: ['my-events'],
      isRead: false,
      timestamp: '1m',
      message: 'Your event <strong>Atlanta Makes Me Laugh</strong> has reached its maximum attendee capacity.',
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '24',
      type: 'post-event-survey',
      category: ['my-events'],
      isRead: false,
      timestamp: '1m',
      message: 'New post-event survey submission received for <strong>Atlanta Makes Me Laugh.</strong>',
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh.',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '25',
      type: 'event-cancelled-by-host',
      category: ['events'],
      isRead: false,
      timestamp: '1m',
      message: '<strong>Atlanta Makes Me Laugh</strong> on Aug 18 at 7PM has been cancelled by the host.',
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Aug 18',
        time: '7PM'
      }
    },
    {
      id: '26',
      type: 'feedback-request',
      category: ['events'],
      isRead: false,
      timestamp: '1m',
      message: 'Thanks for attending <strong>Atlanta Makes Me Laugh!</strong> Your feedback helps hosts improve future events.',
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '27',
      type: 'rsvp-approved',
      category: ['events'],
      isRead: false,
      timestamp: '1m',
      message:
        'RSVP approved!<br /><strong>Jordan H.</strong> approved your RSVP request for <strong>Atlanta Makes Me Laugh</strong> on Aug 18 at 7PM',
      user: {
        id: 'user-1',
        name: 'Jordan H.',
        avatar: 'assets/images/profile.jpeg'
      },
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Aug 18',
        time: '7PM'
      }
    },
    {
      id: '28',
      type: 'rsvp-declined',
      category: ['events'],
      isRead: false,
      timestamp: '1m',
      message: '<strong>Jordan H.</strong> declined your RSVP request for <strong>Atlanta Makes Me Laugh.</strong>',
      user: {
        id: 'user-1',
        name: 'Jordan H.',
        avatar: 'assets/images/profile.jpeg'
      },
      event: {
        id: 'event-1',
        name: 'Atlanta Makes Me Laugh.',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '29',
      type: 'new-event',
      category: ['events'],
      isRead: false,
      timestamp: '1m',
      message: 'New Event from <strong>Jordan H.</strong>!<br />RSVP now to <strong>Atlanta Makes Me Laugh</strong> for free!',
      user: {
        id: 'user-1',
        name: 'Jordan H.',
        avatar: 'assets/images/profile.jpeg'
      },
      event: {
        id: 'event-1',
        name: 'Atlanta Makes me Laugh.',
        location: 'Scarlett Saturdays, Atlanta, GA 2000',
        date: 'Fri, Aug 30',
        time: '7:00PM'
      }
    },
    {
      id: '30',
      type: 'user-on-platform',
      category: ['network'],
      isRead: false,
      timestamp: '1m',
      message: '<strong>Mike Letters</strong> who you might know, is on<br />Networked AI.',
      user: {
        id: 'user-3',
        name: 'Mike Letters',
        avatar: 'assets/images/profile.jpeg'
      }
    },
    {
      id: '31',
      type: 'comment-reply',
      category: ['network'],
      isRead: false,
      timestamp: '1m',
      message: "<strong>Mike Letters</strong> replied to your comment on <strong>Jerome T.'s</strong> post:",
      user: {
        id: 'user-3',
        name: 'Mike Letters',
        avatar: 'assets/images/profile.jpeg'
      },
      commentText: "I'd also love to join the event!"
    },
    {
      id: '32',
      type: 'comment-mention',
      category: ['network'],
      isRead: false,
      timestamp: '1m',
      message: '<strong>Mike Letters</strong> mentioned you in a comment:',
      user: {
        id: 'user-3',
        name: 'Mike Letters',
        avatar: 'assets/images/profile.jpeg'
      },
      commentText: "@sandra_tl I'd also love to join the event!",
      mentionedUser: 'sandra_tl'
    }
  ]);

  hasUnreadNotifications = computed(() => {
    return this.notifications().some((notification) => !notification.isRead);
  });

  filteredNotifications = computed((): INotification[] => {
    const filter = this.notificationFilter();
    const allNotifications = this.notifications();

    if (filter === 'all') {
      return allNotifications;
    }

    if (filter === 'unread') {
      return allNotifications.filter((n) => !n.isRead);
    }

    return allNotifications.filter((n) => n.category.includes(filter));
  });

  handleNotificationAction(notification: INotification, action: string): void {
    const actionMap: Record<string, () => void> = {
      share: this.shareEvent,
      'view-event': this.viewEvent,
      'accept-cohost': this.acceptCohost,
      'decline-cohost': this.declineCohost,
      'accept-sponsor': this.acceptSponsor,
      'decline-sponsor': this.declineSponsor,
      'accept-speaker': this.acceptSpeaker,
      'decline-speaker': this.declineSpeaker,
      'manage-event': this.manageEvent,
      'view-rsvp-list': this.viewRSVPList,
      'accept-join': this.acceptJoinRequest,
      'decline-join': this.declineJoinRequest,
      'view-ticket': this.viewTicket,
      'add-calendar': this.addToCalendar,
      'contact-host': this.contactHost,
      'accept-network': this.acceptNetworkInvitation,
      'decline-network': this.declineNetworkInvitation,
      'accept-group-chat': this.acceptGroupChatInvitation,
      'decline-group-chat': this.declineGroupChatInvitation,
      'view-survey': this.viewSurveyResponse,
      'view-details': this.viewEventDetails,
      'share-feedback': this.shareFeedback,
      'browse-events': this.browseMoreEvents,
      'rsvp-now': this.rsvpNow,
      dismiss: this.dismissNotification,
      reply: this.replyToComment
    };

    const handler = actionMap[action];
    if (handler) {
      handler.call(this);
    }
  }

  markAllAsRead(): void {
    this.notifications.update((notifications) => notifications.map((n) => ({ ...n, isRead: true })));
  }

  markAsRead(notification: INotification, event?: Event): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button') || target.closest('app-button')) {
        return;
      }
    }

    if (!notification.isRead) {
      this.notifications.update((notifications) => notifications.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
    }
  }

  getNotificationIcon(notification: INotification): { src: string; class: string } | null {
    const iconMap: Record<string, { src: string; class: string }> = {
      'event-live': { src: 'assets/svg/notification/rocket.svg', class: 'notification-icon' },
      'event-update': { src: 'assets/svg/notification/calendar.svg', class: 'notification-icon' },
      'ticket-sold-out': { src: 'assets/svg/notification/ticket.svg', class: 'notification-icon' },
      'spot-secured': { src: 'assets/svg/notification/calendar.svg', class: 'notification-icon' },
      'event-reminder': { src: 'assets/svg/notification/reminder.svg', class: 'notification-icon notification-icon-reminder' },
      'check-in-reminder': { src: 'assets/svg/notification/reminder.svg', class: 'notification-icon notification-icon-reminder' },
      'group-chat-invitation': { src: 'assets/svg/notification/users.svg', class: 'notification-icon' },
      'event-cancelled': { src: 'assets/svg/notification/calendar-x.svg', class: 'notification-icon notification-icon-cancelled' },
      'maximum-capacity': { src: 'assets/svg/notification/reminder.svg', class: 'notification-icon notification-icon-reminder' },
      'post-event-survey': { src: 'assets/svg/notification/user.svg', class: 'notification-icon' },
      'event-cancelled-by-host': { src: 'assets/svg/notification/calendar-x.svg', class: 'notification-icon notification-icon-cancelled' },
      'feedback-request': { src: 'assets/svg/notification/message.svg', class: 'notification-icon' },
      'rsvp-approved': { src: 'assets/svg/notification/calendar.svg', class: 'notification-icon' },
      'rsvp-declined': { src: 'assets/svg/notification/reminder.svg', class: 'notification-icon notification-icon-info' },
      'new-event': { src: '', class: 'notification-icon notification-icon-new-event' }
    };
    return iconMap[notification.type] || null;
  }

  hasUserAvatar(notification: INotification): boolean {
    const avatarTypes = [
      'cohost-invitation',
      'sponsor-invitation',
      'speaker-invitation',
      'join-request',
      'check-in',
      'network-invitation',
      'post-like',
      'comment-liked',
      'comment-reply',
      'comment-mention',
      'cohost-acceptance',
      'sponsor-acceptance',
      'speaker-acceptance',
      'user-on-platform'
    ];
    return avatarTypes.includes(notification.type);
  }

  hasMultipleUsers(notification: INotification): boolean {
    return notification.type === 'multiple-likes' || (notification.type === 'comment-liked' && !!notification.users && notification.users.length > 1);
  }

  getActionButtons(notification: INotification): Array<{
    label: string;
    action: string;
    color: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
    variant: 'text' | 'outlined' | undefined;
  }> | null {
    const actionMap: Record<
      string,
      Array<{
        label: string;
        action: string;
        color: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
        variant: 'text' | 'outlined' | undefined;
      }>
    > = {
      'event-live': [{ label: 'Share', action: 'share', color: 'secondary' as const, variant: 'text' as const }],
      'cohost-invitation': [
        { label: 'Accept', action: 'accept-cohost', color: 'primary' as const, variant: undefined },
        { label: 'Decline', action: 'decline-cohost', color: 'secondary' as const, variant: 'text' as const }
      ],
      'sponsor-invitation': [
        { label: 'Accept', action: 'accept-sponsor', color: 'primary' as const, variant: undefined },
        { label: 'Decline', action: 'decline-sponsor', color: 'secondary' as const, variant: 'text' as const }
      ],
      'speaker-invitation': [
        { label: 'Accept', action: 'accept-speaker', color: 'primary' as const, variant: undefined },
        { label: 'Decline', action: 'decline-speaker', color: 'secondary' as const, variant: 'text' as const }
      ],
      'ticket-sold-out': [
        { label: 'Manage Event', action: 'manage-event', color: 'secondary' as const, variant: 'text' as const },
        { label: 'RSVP List', action: 'view-rsvp-list', color: 'secondary' as const, variant: 'text' as const }
      ],
      'join-request': [
        { label: 'Accept', action: 'accept-join', color: 'primary' as const, variant: undefined },
        { label: 'Decline', action: 'decline-join', color: 'secondary' as const, variant: 'text' as const }
      ],
      'spot-secured': [
        { label: 'View Ticket', action: 'view-ticket', color: 'secondary' as const, variant: 'text' as const },
        { label: 'Add to Calendar', action: 'add-calendar', color: 'secondary' as const, variant: 'text' as const }
      ],
      'check-in-reminder': [{ label: 'Contact Host', action: 'contact-host', color: 'secondary' as const, variant: 'text' as const }],
      'network-invitation': [
        { label: 'Accept', action: 'accept-network', color: 'primary' as const, variant: undefined },
        { label: 'Decline', action: 'decline-network', color: 'secondary' as const, variant: 'text' as const }
      ],
      'group-chat-invitation': [
        { label: 'Accept', action: 'accept-group-chat', color: 'primary' as const, variant: undefined },
        { label: 'Decline', action: 'decline-group-chat', color: 'secondary' as const, variant: 'text' as const }
      ],
      'maximum-capacity': [
        { label: 'Manage Event', action: 'manage-event', color: 'secondary' as const, variant: 'text' as const },
        { label: 'RSVP List', action: 'view-rsvp-list', color: 'secondary' as const, variant: 'text' as const }
      ],
      'post-event-survey': [{ label: 'View Response', action: 'view-survey', color: 'secondary' as const, variant: 'text' as const }],
      'event-cancelled-by-host': [{ label: 'View Details', action: 'view-details', color: 'secondary' as const, variant: 'text' as const }],
      'feedback-request': [{ label: 'Share Your Feedback', action: 'share-feedback', color: 'primary' as const, variant: undefined }],
      'rsvp-approved': [
        { label: 'View Ticket', action: 'view-ticket', color: 'secondary' as const, variant: 'text' as const },
        { label: 'Add to Calendar', action: 'add-calendar', color: 'secondary' as const, variant: 'text' as const }
      ],
      'rsvp-declined': [{ label: 'Browse More Events', action: 'browse-events', color: 'secondary' as const, variant: 'text' as const }],
      'new-event': [{ label: 'RSVP Now', action: 'rsvp-now', color: 'primary' as const, variant: undefined }],
      'event-update': [{ label: 'View Event', action: 'view-event', color: 'secondary' as const, variant: 'text' as const }]
    };
    return actionMap[notification.type] || null;
  }

  private staticQuestionnaire = [
    {
      question: 'What is your name?',
      type: 'text',
      required: true,
      visibility: 'public'
    },
    {
      question: 'What is your age?',
      type: 'number',
      required: false,
      visibility: 'public'
    },
    {
      question: 'What is your phone number?',
      type: 'phone',
      required: true,
      visibility: 'private'
    },
    {
      question: 'What is your gender?',
      type: 'single',
      required: true,
      visibility: 'private',
      options: ['Male', 'Female', 'Other']
    },
    {
      question: 'What is your hobbies?',
      type: 'multiple',
      required: false,
      visibility: 'public',
      options: ['Reading', 'Writing', 'Other']
    },
    {
      question: 'What is your rating?',
      type: 'rating',
      required: true,
      visibility: 'public',
      scale: 5
    }
  ];

  hasEventCard(notification: INotification): boolean {
    const eventCardTypes = ['cohost-invitation', 'sponsor-invitation', 'speaker-invitation', 'event-reminder', 'new-event'];
    return eventCardTypes.includes(notification.type) && !!notification.event;
  }

  hasReplyButton(notification: INotification): boolean {
    return notification.type === 'comment-reply' || notification.type === 'comment-mention';
  }

  hasDismissButton(notification: INotification): boolean {
    return notification.type === 'user-on-platform';
  }

  hasReminderLabel(notification: INotification): boolean {
    return notification.type === 'event-reminder' || notification.type === 'check-in-reminder';
  }

  hasCheckmarkIcon(notification: INotification): boolean {
    return notification.type === 'check-in';
  }

  getBackgroundClass(notification: INotification): string {
    if (notification.type === 'rsvp-approved' || notification.type === 'rsvp-declined') {
      return 'bg-neutral-07 rounded-xl';
    }
    return '';
  }

  getEmptyStateMessage(): { title: string; description: string } {
    const filter = this.notificationFilter();
    const messages: Record<NotificationFilter, { title: string; description: string }> = {
      all: {
        title: 'No Notifications Yet',
        description: 'Your events, RSVPs, and connections are quiet for now.'
      },
      unread: {
        title: 'No Unread Notifications',
        description: "You're all caught up! No new notifications to read."
      },
      'my-events': {
        title: 'No My Events Notifications',
        description: "You don't have any notifications related to your events."
      },
      'rsvp-requests': {
        title: 'No RSVP Requests',
        description: "You don't have any pending RSVP requests at the moment."
      },
      invitations: {
        title: 'No Invitations',
        description: "You don't have any pending invitations right now."
      },
      events: {
        title: 'No Event Notifications',
        description: "You don't have any event-related notifications."
      },
      network: {
        title: 'No Network Notifications',
        description: "You don't have any network activity notifications."
      }
    };
    return messages[filter];
  }

  goBack(): void {
    this.navCtrl.back();
  }

  navigateToUserProfile(username: string, event: Event): void {
    event.stopPropagation(); // Prevent marking notification as read
    this.navCtrl.navigateForward(`/${username}`);
  }

  shareEvent(): void {
    console.log('Share event');
  }

  viewEvent(): void {
    console.log('View event');
  }

  acceptCohost(): void {
    console.log('Accept cohost invitation');
  }

  declineCohost(): void {
    console.log('Decline cohost invitation');
  }

  manageEvent(): void {
    console.log('Manage event');
  }

  viewRSVPList(): void {
    console.log('View RSVP list');
  }

  acceptJoinRequest(): void {
    console.log('Accept join request');
  }

  declineJoinRequest(): void {
    console.log('Decline join request');
  }

  viewTicket(): void {
    console.log('View ticket');
  }

  addToCalendar(): void {
    console.log('Add to calendar');
  }

  contactHost(): void {
    console.log('Contact host');
  }

  acceptNetworkInvitation(): void {
    console.log('Accept network invitation');
  }

  declineNetworkInvitation(): void {
    console.log('Decline network invitation');
  }

  acceptGroupChatInvitation(): void {
    console.log('Accept group chat invitation');
  }

  declineGroupChatInvitation(): void {
    console.log('Decline group chat invitation');
  }

  acceptSponsor(): void {
    console.log('Accept sponsor invitation');
  }

  declineSponsor(): void {
    console.log('Decline sponsor invitation');
  }

  acceptSpeaker(): void {
    console.log('Accept speaker invitation');
  }

  declineSpeaker(): void {
    console.log('Decline speaker invitation');
  }

  viewSurveyResponse(): void {
    console.log('View survey response');
  }

  viewEventDetails(): void {
    console.log('View event details');
  }

  async shareFeedback(): Promise<void> {
    await this.modalService.openQuestionnairePreviewModal(
      this.staticQuestionnaire,
      false,
      undefined,
      'Atlanta Makes Me Laugh',
      'Fri 8/30, 07:00AM - 09:30AM',
      'Bar Diver Atlanta, GA 50412',
      'test_id'
    );

    console.log('Share feedback');
  }

  browseMoreEvents(): void {
    console.log('Browse more events');
  }

  rsvpNow(): void {
    console.log('RSVP now');
  }

  dismissNotification(): void {
    console.log('Dismiss notification');
  }

  replyToComment(): void {
    console.log('Reply to comment');
  }
}
