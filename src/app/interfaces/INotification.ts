import { ConnectionStatus } from '@/enums/connection-status.enum';
import { NotificationType, RSVPRequestStatus } from '@/enums/enums';

export interface INotificationPagination {
  limit: number;
  totalPages: number;
  totalCount: number;
  currentPage: number;
}

export interface INotificationUser {
  id: string;
  name: string;
  email?: string;
  username?: string;
  image_url?: string | null;
  thumbnail_url?: string | null;
  connection_status: ConnectionStatus;
}

export interface IRsvpRequest {
  id: string;
  user_id?: string;
  event_id?: string;
  created_at?: string;
  status: RSVPRequestStatus;
  updated_at?: string | null;
}

export interface INotificationEvent {
  id: string;
  slug: string;
  title: string;
  address?: string | null;
  end_date?: string | null;
  image_url?: string | null;
  start_date?: string | null;
  thumbnail_url?: string | null;
  rsvp_requests?: IRsvpRequest[];
  feedbacks?: unknown[];
}

export interface INotificationPost {
  [key: string]: any;
}

export interface INotificationComment {
  [key: string]: any;
}

export interface INotification {
  id: string;
  body: string;
  title: string;
  user_id: string;
  is_read: boolean;
  created_at: string;
  is_deleted?: boolean;
  type: NotificationType;
  post_id?: string | null;
  read_at?: string | null;
  event_id?: string | null;
  comment_id?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_by?: string | null;
  deleted_at?: string | null;
  updated_at?: string | null;
  related_user_id?: string | null;
  post?: INotificationPost | null;
  event?: INotificationEvent | null;
  comment?: INotificationComment | null;
  related_user?: INotificationUser | null;
}

export interface INotificationsResponse {
  message: string;
  success: boolean;
  data: {
    data: INotification[];
    pagination: INotificationPagination;
  };
}
