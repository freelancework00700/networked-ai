import { IUser } from './IUser';
import { FormControl } from '@angular/forms';
import { SegmentButtonItem } from '@/components/common/segment-button';

export interface EventForm {
  medias?: FormControl<any>;
  title?: FormControl<string | null>;
  date?: FormControl<string | null>;
  start_time?: FormControl<string | null>;
  end_time?: FormControl<string | null>;
  until_finished?: FormControl<boolean | null>;
  address?: FormControl<string | null>;
  latitude?: FormControl<string | null>;
  longitude?: FormControl<string | null>;
  city?: FormControl<string | null>;
  state?: FormControl<string | null>;
  country?: FormControl<string | null>;
  category_id?: FormControl<string | null>;
  category?: FormControl<string | null>;
  vibes?: FormControl<string[] | null>;
  description?: FormControl<string | null>;
  tickets?: FormControl<Ticket[] | null>;
  promo_codes?: FormControl<PromoCode[] | null>;
  subscribers_exclusive?: FormControl<boolean | null>;
  is_subscription?: FormControl<boolean | null>;
  subscription_plan?: FormControl<string | null>;
  host_pays_platform_fee?: FormControl<boolean | null>;
  additional_fees?: FormControl<string | null>;
  guest_fee_enabled?: FormControl<boolean | null>;
  participants?: FormControl<Array<{ user_id: string; role: string; thumbnail_url?: string; name?: string }> | null>;
  is_public?: FormControl<boolean | null>;
  repeating_frequency?: FormControl<RepeatingFrequencyType | null>;
  repeat_count?: FormControl<number | 'custom' | null>;
  repeating_events?: FormControl<any[] | null>;
  frequency_date?: FormControl<string | null>;
  custom_repeat_count?: FormControl<number | null>;
  questionnaire?: FormControl<any | null>;
  is_rsvp_approval_required?: FormControl<boolean | null>;
  is_show_timer?: FormControl<boolean | null>;
  max_attendees_per_user?: FormControl<number | null>;
  allow_plus_ones?: FormControl<boolean | null>;
  is_repeating_event?: FormControl<boolean | null>;
}

export interface TicketFormData {
  name: string;
  price: number;
  quantity: number | null;
  description?: string;
  sale_start_date?: string | null;
  sale_start_time?: string | null;
  sale_end_date?: string | null;
  sale_end_time?: string | null;
  end_at_event_start: boolean;
  free_for_subscribers?: boolean;
  ticket_type: TicketType;
}

export interface PromoCodeFormModalData {
  promo_code: string;
  value: number;
  max_uses_per_user?: number;
  capped_amount?: number | null;
  redemption_limit?: number | null;
  type: 'Percentage' | 'Fixed';
}

export interface Ticket {
  id?: string;
  name: string;
  ticket_type: TicketType;
  price: number; 
  available_quantity?: number | null;   
  description?: string | null;
  sale_start_date?: string | null;
  sale_start_time?: string | null;
  sale_end_date?: string | null;
  sale_end_time?: string | null;
  end_at_event_start?: boolean;
  order?: number;
}

export interface TicketDisplay extends Ticket {
  status: 'sale-ended' | 'available' | 'sold-out' | 'upcoming';
  remainingQuantity?: number;
  selectedQuantity?: number;
  startsIn?: string;
}

export interface PromoCode {
  promo_code: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  capped_amount?: number | null;
  redemption_limit?: number | null;
  max_uses_per_user?: number;
}

export interface SubscriptionPlan {
  productId: string;
  name: string;
}

// Media item interface for event media arrays
export interface MediaItem {
  id?: string;
  url: string;
  type: 'Image' | 'Video' | 'image' | 'video' | 'gif';
  order?: number;
  file?: File;
  media_url?: string;
}

export interface UserSection {
  title: string;
  users: IUser[];
  overflowLabelClass?: string;
}

export interface EventDisplayData {
  thumbnail_url: string;
  title: string;
  description: string;
  displayMedias: MediaItem[];
  views: string;
  isPublic: boolean;
  location: string;
  hostName: string;
  mapCenter: [number, number] | null;
  admission: string;
  formattedDateTime: string;
  userSections: UserSection[];
  isRepeatingEvent: boolean;
  dateItems: SegmentButtonItem[];
  rsvpButtonLabel: string;
  isCurrentUserHost: boolean;
  tickets: Ticket[];
  questionnaire: any[];
  promo_codes: PromoCode[];
  subscriptionPlanType?: 'event' | 'sponsor' | null;
}

export interface IEvent {
  id?: string;
  slug?: string;
  title?: string;
  thumbnail_url?: string;
  start_date?: string;
  end_date?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  viewers?: any[];
  views?: string | number;
  participants?: Array<{
    role?: string;
    user?: {
      name?: string;
    };
  }>;
  medias?: Array<{
    media_url?: string;
    url?: string;
  }>;
  is_like?: boolean;
  // Legacy fields for backward compatibility
  date?: string;
  day?: string;
  image?: string;
  location?: string;
  dayOfWeek?: string;
  organization?: string;
}

export interface QuestionnaireQuestion {
  question: string;
  type: QuestionType;
  required: boolean;
  visibility: 'public' | 'private';
  options?: string[];
  min?: number;
  max?: number;
  rating?: number;
  order?: number;
  event_phase?: 'PreEvent' | 'PostEvent';
}

export interface EventCategory {
  id: string;
  name: string;
  icon?: string;
  value?: string;
  description?: string | null;
}

export interface Vibe {
  id: string;
  name: string;
  icon?: string;
  description?: string | null;
}

export interface VibesResponse {
  message?: string;
  success?: boolean;
  data?: Vibe[];
}

// Analytics interfaces for questionnaire analytics
export interface AnalyticsOption {
  label: string;
  value: number;
}

export interface AnalyticsScale {
  scale: number;
  value: number;
}

export interface AnalyticsQuestion {
  flag: 'pre' | 'post';
  visibility: 'public' | 'private';
  type: 'options' | 'scale';
  question: string;
  options?: AnalyticsOption[];
  scaleData?: AnalyticsScale[];
}

export interface EventResponse {
  message?: string;
  success?: boolean;
  data?: any;
}

export interface EventCategoriesResponse {
  message?: string;
  success?: boolean;
  data?: EventCategory[];
}

export type TicketType = 'Free' | 'Paid' | 'Early Bird' | 'Sponsor' | 'Standard';

export type RepeatingFrequencyType = 'weekly' | 'monthly' | 'custom';

export enum RepeatingFrequency {
  Weekly = 'Weekly',
  Monthly = 'Monthly'
}

export type QuestionType = 'Text' | 'Number' | 'SingleChoice' | 'MultipleChoice' | 'PhoneNumber' | 'Rating';

export interface EventSettingsPayload {
  is_repeating_event: boolean;
  is_rsvp_approval_required: boolean;
  is_show_timer: boolean;
  host_pays_platform_fee: boolean;
  repeating_frequency?: RepeatingFrequency;
  max_attendees_per_user?: number;
  additional_fees?: number;
}

export interface EventsResponse {
  message?: string;
  success?: boolean;
  data?: any;
}

export interface EventData {
  id?: string;
  title: string;
  location: string;
  latLng: {
    lat: number;
    lng: number;
  };
  address: string;
  public: boolean;
  dates: {
    [id: string]: {
      start: number;
      end: number;
    };
  };
  img?: string[];
  description?: string;
  promoCodes?: PromoCode[];
  tickets?: Ticket[];
  guestFeeEnabled?: boolean;
  iap?: boolean;
  start_date?: string;
  medias?: MediaItem[];
}