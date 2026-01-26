import { EventAttendee } from './event';
import { FeedPost, FeedComment } from './IFeed';
import { ChatRoom, ChatMessage } from './IChat';
import { INotification } from '@/interfaces/INotification';
import { IUser } from './IUser';

// Server to Client Events
export type ServerToClientEvents = {
  'register:success': (data: { userId: string; socketId: string; message: string }) => void;

  // Feed events
  'feed:created': (payload: { feed: FeedPost }) => void;
  'feed:updated': (payload: { feed: FeedPost }) => void;
  'feed:deleted': (payload: { feed_id: string; deleted_by?: string | null }) => void;

  // Comment events
  'feed:comment:created': (payload: { feed_id: string; comment: FeedComment }) => void;
  'feed:comment:updated': (payload: { feed_id: string; comment: FeedComment }) => void;
  'feed:comment:deleted': (payload: { feed_id: string; comment_id: string }) => void;

  // Network events
  'network:connection:update': (payload: IUser) => void;

  // Notification events
  'notification:update': (payload: INotification) => void;

  // Room events
  'room:created': (payload: ChatRoom) => void;
  'room:updated': (payload: ChatRoom) => void;
  'user:join': (payload: { room_id: string; user_id: string }) => void;

  // Message events
  'message:created': (payload: { message: ChatMessage }) => void;
  'message:updated': (payload: { message: ChatMessage }) => void;
  'message:deleted': (payload: { message_id: string; room_id: string; deleted_by?: string | null }) => void;
  'message:reaction': (payload: { message_id: string; room_id: string; reaction: any; user_id: string }) => void;

  //attendee check-in
  'attendee:check-in:update': (payload: EventAttendee) => void;
};

// Client to Server Events
export type ClientToServerEvents = {
  register: (userId: string) => void;
  joinRoom: (payload: { userId: string; roomId: string }) => void;
  leaveRoom: (payload: { userId: string; roomId: string }) => void;
};
