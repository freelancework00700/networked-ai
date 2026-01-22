import { IEvent } from "./event";
import { FeedPost } from "./IFeed";

export interface ChatRoomUser {
  id: string;
  name: string;
  username: string;
  email: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  mobile: string | null;
  unreadMessageCount: number;
  isDeleted: boolean;
  company_name: string | null;
  total_gamification_points: number;
  total_gamification_points_weekly: number;
}

export interface ChatRoomEvent {
  id: string;
  title: string;
  slug: string;
  address: string;
  end_date: string;
  image_url: string;
  start_date: string;
  is_public: boolean;
  description: string;
  thumbnail_url: string;
}

export interface ChatRoom {
  id: string;
  user_ids: string[];
  is_personal: boolean;
  name: string | null;
  event_id: string | null;
  event_image: string | null;
  profile_image: string | null;
  is_broadcast: boolean;
  broadcast_owner: string | null;
  deleted_users: string[];
  delete_history_by: string[];
  is_deleted: boolean;
  deleted_at: string | null;
  created_by: string;
  updated_by: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  users?: ChatRoomUser[];
  lastMessage?: string | null;
  lastMessageTime?: string | null;
  created_by_user?: ChatRoomUser;
  event?: ChatRoomEvent;
}

export interface ChatRoomsPagination {
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface ChatRoomsResponse {
  success: boolean;
  message: string;
  data: {
    data: ChatRoom[];
    pagination: ChatRoomsPagination;
  };
}

export interface ChatMessageUser {
  id: string;
  name: string;
  username: string;
  email: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  mobile: string | null;
}

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  message: string;
  type: string;
  media_url: string | null;
  posted_by_user_id: string;
  read_by_recipients: Array<{
    read_at: string;
    read_by_user_id: string;
  }>;
  reactions: any[];
  is_edited: boolean;
  deleted_by: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  posted_by_user: ChatMessageUser;
  is_deleted?: boolean;
  feed?: FeedPost,
  event?: IEvent
}

export interface MessagesResponse {
  success: boolean;
  message: string;
  data: {
    data: ChatMessage[];
    pagination: ChatRoomsPagination;
  };
}

