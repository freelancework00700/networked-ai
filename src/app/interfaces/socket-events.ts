import { FeedPost, FeedComment } from './IFeed';

// Network Connection Update Payload
export interface NetworkConnectionUpdate {
  connection_status: string;
  id: string;
  username: string;
}

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
  'network:connection:update': (payload: NetworkConnectionUpdate) => void;
};

// Client to Server Events
export type ClientToServerEvents = {
  'register': (userId: string) => void;
};