export type NotificationFilter = 'all' | 'unread' | 'my-events' | 'rsvp-requests' | 'invitations' | 'events' | 'network';

export type NotificationType =
  | 'event-live'
  | 'cohost-invitation'
  | 'sponsor-invitation'
  | 'speaker-invitation'
  | 'event-update'
  | 'ticket-sold-out'
  | 'join-request'
  | 'spot-secured'
  | 'event-reminder'
  | 'check-in'
  | 'check-in-reminder'
  | 'network-invitation'
  | 'group-chat-invitation'
  | 'post-like'
  | 'multiple-likes'
  | 'comment-liked'
  | 'comment-reply'
  | 'cohost-acceptance'
  | 'sponsor-acceptance'
  | 'speaker-acceptance'
  | 'event-cancelled'
  | 'maximum-capacity'
  | 'post-event-survey'
  | 'rsvp-approved'
  | 'rsvp-declined'
  | 'event-cancelled-by-host'
  | 'feedback-request'
  | 'new-event'
  | 'user-on-platform'
  | 'comment-mention';

export interface INotificationEventDetails {
  id: string;
  name: string;
  location: string;
  date: string;
  time: string;
}

export interface INotificationUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface INotification {
  id: string;
  type: NotificationType;
  category: NotificationFilter[];
  isRead: boolean;
  timestamp: string;
  message: string;
  user?: INotificationUser;
  users?: INotificationUser[];
  event?: INotificationEventDetails;
  originalEvent?: INotificationEventDetails;
  updatedEvent?: INotificationEventDetails;
  commentText?: string;
  postThumbnail?: string;
  mentionedUser?: string;
}