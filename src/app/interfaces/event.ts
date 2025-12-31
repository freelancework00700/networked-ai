import { FormControl } from '@angular/forms';

export interface EventForm {
  medias?: FormControl<any>;
  title?: FormControl<string | null>;
  date?: FormControl<string | null>;
  start_time?: FormControl<string | null>;
  end_time?: FormControl<string | null>;
  until_finished?: FormControl<boolean | null>;
  address?: FormControl<string | null>;
  category?: FormControl<string | null>;
  meta_tags?: FormControl<string[] | null>;
  description?: FormControl<string | null>;
  tickets?: FormControl<Ticket[] | null>;
  promo_codes?: FormControl<PromoCode[] | null>;
  subscribers_exclusive?: FormControl<boolean | null>;
  is_subscription?: FormControl<boolean | null>;
  subscription_plan?: FormControl<string | null>;
  host_pays_fees?: FormControl<boolean | null>;
  additional_fees?: FormControl<string | null>;
  guest_fee_enabled?: FormControl<boolean | null>;
  co_hosts?: FormControl<string[] | null>;
  sponsors?: FormControl<string[] | null>;
  speakers?: FormControl<string[] | null>;
  visibility?: FormControl<'public' | 'invite-only' | null>;
  plus?: FormControl<number | null>;
  repeat_frequency?: FormControl<'weekly' | 'monthly' | 'custom' | null>;
  repeat_count?: FormControl<number | 'custom' | null>;
  repeating_events?: FormControl<any[] | null>;
  frequency_date?: FormControl<string | null>;
  custom_repeat_count?: FormControl<number | null>;
  questionnaire?: FormControl<any | null>;
}

export interface Ticket {
  id?: string;
  name: string;
  ticket_type: 'free' | 'paid' | 'early-bird' | 'sponsor' | 'standard';
  is_free_ticket: boolean;
  price: string;
  quantity?: number | null;
  description?: string | null;
  sale_start_date?: string | null;
  sale_end_date?: string | null;
  end_sale_on_event_start?: boolean;
}

export interface PromoCode {
  promoCode: string;
  promotion_type: 'percentage' | 'fixed';
  promoPresent: string;
  capped_amount?: string | null;
  redemption_limit?: number | null;
  max_use_per_user?: number;
}

export interface SubscriptionPlan {
  productId: string;
  name: string;
}

export interface EventData {
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
}
