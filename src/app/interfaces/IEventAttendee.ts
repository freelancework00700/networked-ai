import { IUser } from './IUser';

export type RSVPStatus = 'Yes' | 'Maybe' | 'No' | (string & {});

export interface IEventAttendeesPagination {
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface IEventAttendeeTicket {
  id?: string;
  name?: string;
  ticket_type?: string;
}

export interface IEventAttendee {
  id: string;
  event_id?: string;
  user_id?: string;
  parent_user_id?: string | null;

  name?: string;
  is_incognito?: boolean;
  rsvp_status?: RSVPStatus;
  is_checked_in?: boolean;

  event_ticket_id?: string;
  amount_paid?: number;
  platform_fee_amount?: number;
  host_payout_amount?: number;
  created_at?: string;

  user?: IUser;
  event_ticket?: IEventAttendeeTicket;
}

export interface IGetEventAttendeesParams {
  page?: number;
  limit?: number;
  search?: string;
  rsvp_status?: string;
  is_checked_in?: boolean;
  ticket_type?: string;
  is_connected?: boolean;
}

export interface IEventAttendeesCounts {
  total_guest: number;
  total_attending_guest: number;
  total_maybe_guest: number;
  total_no_guest: number;
  total_checkedin_guest: number;
}

export interface IGetEventAttendeesResult {
  data: IEventAttendee[];
  pagination: IEventAttendeesPagination;
  counts?: IEventAttendeesCounts;
}
