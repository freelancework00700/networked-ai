import {
  IEvent,
  MediaItem,
  UserSection,
  EventCategory,
  EventAttendee,
  EventResponse,
  EventsResponse,
  EventDisplayData,
  EventFeedbackPayload,
  EventCategoriesResponse,
} from '@/interfaces/event';
import { IUser } from '@/interfaces/IUser';
import { HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BaseApiService } from '@/services/base-api.service';
import { SegmentButtonItem } from '@/components/common/segment-button';

@Injectable({ providedIn: 'root' })
export class EventService extends BaseApiService {
  recommendedEvents = signal<IEvent[]>([]);
  publicEvents = signal<IEvent[]>([]);
  
  async createEvents(eventsPayload: any[]): Promise<EventResponse> {
    try {
      const response = await this.post<EventResponse>('/events', eventsPayload);
      return response;
    } catch (error) {
      console.error('Error creating events:', error);
      throw error;
    }
  }

  // get event categories
  async getEventCategories(): Promise<EventCategory[]> {
    try {
      const response = await this.get<EventCategoriesResponse>('/event-categories');
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching event categories:', error);
      throw error;
    }
  }

  // get event by id
  async getEventById(eventId: string): Promise<any> {
    try {
      const response = await this.get<any>(`/events/${eventId}?include_details=true`);
      return response?.data?.content || null;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  // update event
  async updateEvent(eventId: string, eventPayload: any): Promise<EventResponse> {
    try {
      const response = await this.put<EventResponse>(`/events/${eventId}`, eventPayload);
      return response;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  formatDateTime(startDateString: string, endDateString?: string): string {
    if (!startDateString) return '';
    const startDate = new Date(startDateString);
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = daysOfWeek[startDate.getDay()];
    const month = startDate.getMonth() + 1;
    const day = startDate.getDate();

    const startTime = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    let timeStr = startTime;

    if (endDateString) {
      const endDate = new Date(endDateString);
      const endTime = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      timeStr += ` - ${endTime}`;
    }

    return `${dayOfWeek} ${month}/${day}, ${timeStr}`;
  }

  formatDateKey(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  }

  formatLocation(address?: string, city?: string, state?: string, country?: string): string {
    const parts = [address, city, state, country].filter(Boolean);
    return parts.join(', ') || 'Location not specified';
  }

  formatAdmission(tickets: any[]): string {
    if (!tickets || tickets.length === 0) return 'Free';

    const availableTickets = tickets
      .filter((t: any) => t.available_quantity != null && t.available_quantity > 0)
      .map((t: any) => ({
        ...t,
        price: typeof t.price === 'string' ? parseFloat(t.price) : t.price || 0
      }));

    if (availableTickets.length === 0) return 'Free';

    const minPrice = Math.min(...availableTickets.map((t: any) => t.price || 0));
    if (minPrice > 0) {
      return `from $${minPrice.toFixed(2)}`;
    }
    return 'Free';
  }

  processMediaItems(medias: any[]): { displayMedias: MediaItem[]; allMedias: MediaItem[] } {
    const defaultImage: MediaItem = {
      url: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80',
      type: 'Image',
      order: 1
    };

    if (!Array.isArray(medias) || medias.length === 0) {
      return { displayMedias: [], allMedias: [defaultImage] };
    }

    const processedMedias: MediaItem[] = medias
      .filter((media: any) => {
        if (!media) return false;
        return media.url || media.media_url || (media.file && media.file instanceof File);
      })
      .map((media: any, index: number) => {
        let url = media.url || media.media_url || '';
        if (!url && media.file && media.file instanceof File) {
          try {
            url = URL.createObjectURL(media.file);
          } catch (e) {
            console.warn('Failed to create object URL for media file', e);
          }
        }

        let type = media.type || media.media_type || '';
        if (!type && media.file) {
          const fileType = media.file.type || '';
          if (fileType.startsWith('video/')) {
            type = 'Video';
          } else if (fileType.startsWith('image/') || fileType === 'gif') {
            type = 'Image';
          }
        }

        const normalizedType = type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : 'Image';
        const validType: 'Image' | 'Video' | 'image' | 'video' | 'gif' = (
          normalizedType === 'Image' || normalizedType === 'Video' || normalizedType === 'Gif'
            ? normalizedType
            : normalizedType.toLowerCase() === 'video'
              ? 'Video'
              : 'Image'
        ) as 'Image' | 'Video' | 'image' | 'video' | 'gif';

        return {
          id: media.id || `media-${index}`,
          url: url,
          type: validType,
          order: media.order ?? index + 1
        };
      })
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    const allMedias = processedMedias.length > 0 ? processedMedias : [defaultImage];
    const displayMedias = allMedias;

    return { displayMedias, allMedias };
  }

  formatMedias(medias: any[]): MediaItem[] {
    const { allMedias } = this.processMediaItems(medias);
    return allMedias;
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getCurrentTime(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes, 0, 0);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  isTimeAfter(time1: string, time2: string): boolean {
    const [hours1, mins1] = time1.split(':').map(Number);
    const [hours2, mins2] = time2.split(':').map(Number);
    const totalMinutes1 = hours1 * 60 + mins1;
    const totalMinutes2 = hours2 * 60 + mins2;
    return totalMinutes1 > totalMinutes2;
  }

  combineDateAndTime(dateStr: string | null, timeStr: string | null): string | null {
    if (!dateStr || !timeStr) {
      return null;
    }
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }

  parseDateTime(dateTimeStr: string): { date: string; time: string } | null {
    if (!dateTimeStr) return null;
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return null;

    const dateStr = date.toISOString().split('T')[0];
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    return { date: dateStr, time: timeStr };
  }

  getUserSections(participants: any[], attendees?: any[]): UserSection[] {
    const mapUser = (user: any): IUser => ({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      username: user.username,
      thumbnail_url: user.thumbnail_url || user.image_url,
      image_url: user.image_url || user.thumbnail_url
    });

    const getParticipantsByRole = (role: string): IUser[] => {
      if (!participants || !Array.isArray(participants)) return [];
      return participants
        .filter((p: any) => (p.role || '').toLowerCase() === role.toLowerCase())
        .map((p: any) => {
          const user = p.user || p;
          return user ? mapUser(user) : null;
        })
        .filter((user): user is IUser => user !== null);
    };
    const sections: UserSection[] = [];
    const hosts = getParticipantsByRole('Host');
    const coHosts = getParticipantsByRole('CoHost');
    const sponsors = getParticipantsByRole('Sponsor');
    const speakers = getParticipantsByRole('Speaker');

    if (hosts.length > 0) {
      sections.push({ title: 'Host(s)', users: hosts });
    }
    if (coHosts.length > 0) {
      sections.push({ title: 'Co-Host(s)', users: coHosts });
    }
    if (sponsors.length > 0) {
      sections.push({ title: 'Sponsors', users: sponsors, overflowLabelClass: '!bg-neutral-02 !text-neutral-07' });
    }
    if (speakers.length > 0) {
      sections.push({ title: 'Speaker(s)', users: speakers });
    }

    return sections;
  }

  createDateItems(parentEvent: any): SegmentButtonItem[] {
    const dateItems: SegmentButtonItem[] = [];

    if (parentEvent?.start_date) {
      const parentDateKey = this.formatDateKey(parentEvent.start_date);
      dateItems.push({
        value: parentDateKey,
        label: parentDateKey,
        icon: 'assets/svg/calendar.svg',
        activeIcon: 'assets/svg/calendar-selected.svg'
      });
    }

    if (parentEvent?.child_events && parentEvent.child_events.length > 0) {
      parentEvent.child_events.forEach((childEvt: any) => {
        if (childEvt.start_date) {
          const childDateKey = this.formatDateKey(childEvt.start_date);
          if (!dateItems.some((item) => item.value === childDateKey)) {
            dateItems.push({
              value: childDateKey,
              label: childDateKey,
              icon: 'assets/svg/calendar.svg',
              activeIcon: 'assets/svg/calendar-selected.svg'
            });
          }
        }
      });
    }

    return dateItems;
  }

  transformEventDataToForm(eventData: any): any {
    const parseDateTime = (dateTimeStr: string): { date: string; time: string } | null => {
      if (!dateTimeStr) return null;
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return null;
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      return { date: dateStr, time: timeStr };
    };

    const transformTicketFromApi = (ticket: any, index: number): any => {
      const transformedTicket: any = {
        id: ticket.id,
        name: ticket.name,
        price: ticket.price,
        available_quantity: ticket.available_quantity,
        description: ticket.description || null,
        ticket_type: ticket.ticket_type,
        end_at_event_start: ticket.end_at_event_start ?? true,
        order: ticket.order ?? index + 1
      };

      if (ticket.sales_start_date) {
        const startDateTime = parseDateTime(ticket.sales_start_date);
        if (startDateTime) {
          transformedTicket.sale_start_date = startDateTime.date;
          transformedTicket.sale_start_time = startDateTime.time;
        }
      }

      if (!ticket.end_at_event_start && ticket.sales_end_date) {
        const endDateTime = parseDateTime(ticket.sales_end_date);
        if (endDateTime) {
          transformedTicket.sale_end_date = endDateTime.date;
          transformedTicket.sale_end_time = endDateTime.time;
        }
      }

      return transformedTicket;
    };

    const transformQuestionnaireData = (questions: any[]): any[] | null => {
      if (!questions?.length) return null;
      return this.formatQuestionnaire(questions);
    };

    const formData: any = {
      title: eventData.title || null,
      description: eventData.description || null,
      address: eventData.address || null,
      latitude: eventData.latitude || null,
      longitude: eventData.longitude || null,
      city: eventData.city || null,
      state: eventData.state || null,
      country: eventData.country || null,
      category_id: eventData.category_id || null,
      is_public: eventData.is_public ?? true,
      medias:
        eventData.medias
          ?.map((media: any) => ({
            id: media.id,
            type: media.media_type?.toLowerCase() === 'image' ? 'image' : 'video',
            url: media.media_url,
            file: undefined,
            order: media.order || 0
          }))
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) || [],
      tickets:
        eventData.tickets
          ?.map((ticket: any, index: number) => transformTicketFromApi(ticket, index))
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) || [],
      promo_codes: eventData.promo_codes || [],
      participants:
        eventData.participants?.map((p: any) => ({
          user_id: p.user_id,
          role: p.role,
          name: p.user?.name || null,
          thumbnail_url: p.user?.thumbnail_url || null
        })) || [],
      vibes: eventData.vibes?.map((vibe: any) => vibe.id || vibe) || [],
      questionnaire: transformQuestionnaireData(eventData.questions || eventData.questionnaire || [])
    };

    if (eventData.start_date) {
      const startDateTime = parseDateTime(eventData.start_date);
      if (startDateTime) {
        formData.date = startDateTime.date;
        formData.start_time = startDateTime.time;
      }
    }

    if (eventData.end_date) {
      const endDateTime = parseDateTime(eventData.end_date);
      if (endDateTime) {
        formData.end_time = endDateTime.time;
        formData.until_finished = false;
      } else {
        formData.until_finished = true;
      }
    } else {
      formData.until_finished = true;
    }

    if (eventData.settings) {
      const settings = eventData.settings;
      formData.is_repeating_event = settings.is_repeating_event ?? false;
      formData.repeating_frequency = settings.repeating_frequency?.toLowerCase() || null;
      formData.is_rsvp_approval_required = settings.is_rsvp_approval_required ?? false;
      formData.is_show_timer = settings.is_show_timer ?? false;
      formData.max_attendees_per_user = settings.max_attendees_per_user || null;
      formData.allow_plus_ones = (settings.max_attendees_per_user && settings.max_attendees_per_user > 0) || false;
      formData.host_pays_platform_fee = settings.host_pays_platform_fee ?? false;
      formData.additional_fees = settings.additional_fees ? String(settings.additional_fees) : '';
    }
    return formData;
  }

  formatFormDateTime(date: string | null, startTime: string | null, endTime: string | null, untilFinished: boolean): string {
    if (!date || !startTime) return '';

    const dateObj = new Date(date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[dateObj.getDay()];
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();

    const formattedStartTime = this.formatTime(startTime);
    const formattedEndTime = untilFinished ? '' : endTime ? this.formatTime(endTime) : '';

    if (formattedEndTime) {
      return `${dayName} ${month}/${day}, ${formattedStartTime} - ${formattedEndTime}`;
    }
    return `${dayName} ${month}/${day}, ${formattedStartTime}`;
  }

  createDateItemsFromForm(repeatingEvents: any[], baseDate: string | null, isRepeating: boolean): SegmentButtonItem[] {
    if (!isRepeating || !repeatingEvents || repeatingEvents.length === 0) {
      if (baseDate) {
        const formatted = this.formatDateKey(baseDate);
        return [
          {
            value: formatted,
            label: formatted,
            icon: 'assets/svg/calendar.svg',
            activeIcon: 'assets/svg/calendar-selected.svg'
          }
        ];
      }
      return [];
    }

    const items: SegmentButtonItem[] = [];

    if (baseDate) {
      const baseFormatted = this.formatDateKey(baseDate);
      items.push({
        value: baseFormatted,
        label: baseFormatted,
        icon: 'assets/svg/calendar.svg',
        activeIcon: 'assets/svg/calendar-selected.svg'
      });
    }

    repeatingEvents.forEach((event: any) => {
      const dateStr = event.date || baseDate;
      if (dateStr) {
        const formatted = this.formatDateKey(dateStr);
        if (!items.some((item) => item.value === formatted)) {
          items.push({
            value: formatted,
            label: formatted,
            icon: 'assets/svg/calendar.svg',
            activeIcon: 'assets/svg/calendar-selected.svg'
          });
        }
      }
    });

    return items;
  }

  transformEventDataForDisplay(
    eventData: any,
    parentEvent?: any,
    currentUser?: any,
    options?: {
      userSections?: UserSection[];
      dateItems?: SegmentButtonItem[];
      isRepeatingEvent?: boolean;
      formattedLocation?: string;
    }
  ): Partial<EventDisplayData> {
    const participants = eventData?.participants || [];
    const attendees = eventData?.attendees || [];
    const userSections = options?.userSections || this.getUserSections(participants, attendees);
    const hosts = userSections.find((s) => s.title === 'Host(s)')?.users || [];

    const { displayMedias, allMedias } = this.processMediaItems(eventData?.medias || []);
    const thumbnailMedia = allMedias.find((m: any) => m.order === 1) || allMedias[0];
    const thumbnailUrl = thumbnailMedia?.url || '';

    const views = Array.isArray(eventData?.viewers) ? eventData.viewers.length.toString() : eventData?.views?.toString() || '0';

    const location = options?.formattedLocation || this.formatLocation(eventData?.address, eventData?.city, eventData?.state, eventData?.country);

    let mapCenter: [number, number] | null = null;
    if (eventData?.latitude != null && eventData?.longitude != null) {
      const lat = typeof eventData.latitude === 'string' ? parseFloat(eventData.latitude) : eventData.latitude;
      const lng = typeof eventData.longitude === 'string' ? parseFloat(eventData.longitude) : eventData.longitude;
      if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
        mapCenter = [lng, lat];
      }
    }

    const admission = this.formatAdmission(eventData?.tickets || []);

    let formattedDateTime = '';
    if (eventData?.start_date) {
      formattedDateTime = this.formatDateTime(eventData.start_date, eventData.end_date);
    } else if (eventData?.date && eventData?.start_time) {
      const dateTimeStr = this.combineDateAndTime(eventData.date, eventData.start_time);
      if (dateTimeStr) {
        const untilFinished = eventData?.until_finished ?? false;
        const endDateTimeStr = untilFinished ? null : eventData?.end_time ? this.combineDateAndTime(eventData.date, eventData.end_time) : null;
        formattedDateTime = this.formatDateTime(dateTimeStr, endDateTimeStr || undefined);
      }
    }

    const rsvpButtonLabel = admission === 'Free' ? 'RSVP Now - Free' : `RSVP Now ${admission}`;

    const isCurrentUserHost = participants.some((p: any) => {
      const userId = p.user_id || p.user?.id;
      const role = (p.role || '').toLowerCase();
      return userId === currentUser?.id && role === 'host';
    });

    const isRepeatingEvent = options?.isRepeatingEvent ?? parentEvent?.settings?.is_repeating_event === true;
    const dateItems = options?.dateItems ?? (isRepeatingEvent ? this.createDateItems(parentEvent || eventData) : []);

    let hostName = hosts[0]?.name || 'Networked AI';
    if (!hostName || hostName === 'Networked AI') {
      const host = Array.isArray(participants) ? participants.find((p: any) => (p.role || '').toLowerCase() === 'host') : null;
      hostName = host?.name || host?.user?.name || hostName;
    }

    const isRsvpApprovalRequired = eventData?.settings?.is_rsvp_approval_required ?? false;

    return {
      thumbnail_url: eventData?.thumbnail_url || thumbnailUrl,
      title: eventData?.title || '',
      description: eventData?.description || '',
      displayMedias,
      views,
      hostName,
      isPublic: eventData?.is_public !== false,
      location,
      mapCenter,
      admission,
      formattedDateTime,
      userSections,
      isRepeatingEvent,
      dateItems,
      rsvpButtonLabel,
      isCurrentUserHost,
      isRsvpApprovalRequired,
      tickets: eventData?.tickets || [],
      questionnaire: eventData?.questionnaire || eventData?.questions || [],
      promo_codes: eventData?.promo_codes || []
    };
  }

  formatQuestionnaire(questions: any[]): any[] {
    if (!questions?.length) return [];

    const byPhase = questions.reduce(
      (acc, q) => {
        const phase = (q.event_phase || 'PreEvent') as 'PreEvent' | 'PostEvent';
        if (!acc[phase]) acc[phase] = [];
        acc[phase].push(q);
        return acc;
      },
      {} as Record<'PreEvent' | 'PostEvent', any[]>
    );

    const formatQuestions = (phaseQuestions: any[], phase: 'PreEvent' | 'PostEvent') => {
      const sorted = phaseQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));
      return sorted.map((q, index) => this.formatQuestion(q, phase, index + 1));
    };

    return [...formatQuestions(byPhase.PreEvent || [], 'PreEvent'), ...formatQuestions(byPhase.PostEvent || [], 'PostEvent')];
  }

  private formatQuestion(q: any, phase: 'PreEvent' | 'PostEvent', order: number): any {
    const formatted: any = {
      question: q.question,
      event_phase: phase,
      question_type: q.question_type || q.type,
      is_required: q.is_required ?? q.required ?? false,
      is_public: q.is_public ?? q.visibility === 'public',
      order
    };

    if (q.min != null) formatted.min = q.min;
    if (q.max != null) formatted.max = q.max;
    if (q.rating_scale || q.rating) formatted.rating_scale = q.rating_scale || q.rating;

    if (Array.isArray(q.options) && q.options.length > 0) {
      formatted.options = this.formatQuestionOptions(q.options);
    }

    return formatted;
  }

  private formatQuestionOptions(options: any[]): any[] {
    const sorted = [...options].sort((a, b) => {
      const orderA = typeof a === 'object' && a.order != null ? a.order : 0;
      const orderB = typeof b === 'object' && b.order != null ? b.order : 0;
      return orderA - orderB;
    });

    return sorted.map((opt, index) => {
      if (typeof opt === 'string') {
        return { option: opt, order: index + 1 };
      }
      if (typeof opt === 'object' && opt.option) {
        return { option: opt.option, order: opt.order ?? index + 1 };
      }
      return { option: String(opt), order: index + 1 };
    });
  }

  formatTickets(tickets: any[], eventDate: string | null, eventStartTime: string | null): any[] {
    return tickets.map((ticket, index) => {
      const formattedTicket: any = {
        name: ticket.name,
        price: Number(ticket.price),
        available_quantity: ticket.available_quantity,
        description: ticket.description || '',
        ticket_type: ticket.ticket_type,
        end_at_event_start: ticket.end_at_event_start ?? false,
        order: ticket.order ?? index + 1
      };

      if (ticket.sale_start_date) {
        const startTime = ticket.sale_start_time || '00:00';
        formattedTicket.sales_start_date = this.combineDateAndTime(ticket.sale_start_date, startTime);
      }

      if (ticket.end_at_event_start && eventDate && eventStartTime) {
        formattedTicket.sales_end_date = this.combineDateAndTime(eventDate, eventStartTime);
      } else if (ticket.sale_end_date) {
        const endTime = ticket.sale_end_time || '23:59';
        formattedTicket.sales_end_date = this.combineDateAndTime(ticket.sale_end_date, endTime);
      }

      return formattedTicket;
    });
  }

  formatPromoCodes(promoCodes: any[]): any[] {
    return promoCodes.map((promo) => ({
      promo_code: promo.promo_code,
      type: promo.type,
      value: Number(promo.value),
      capped_amount: promo.capped_amount != null ? Number(promo.capped_amount) : null,
      redemption_limit: promo.redemption_limit != null ? Math.floor(Number(promo.redemption_limit)) : null,
      max_uses_per_user: promo.max_uses_per_user != null ? Math.floor(Number(promo.max_uses_per_user)) : null
    }));
  }

  buildEventSettings(formData: any): any {
    const settings: any = {
      is_repeating_event: formData.is_repeating_event ?? false,
      is_rsvp_approval_required: formData.is_rsvp_approval_required ?? false,
      is_show_timer: formData.is_show_timer ?? false,
      host_pays_platform_fee: formData.host_pays_platform_fee ?? false
    };

    if (formData.repeating_frequency && formData.repeating_frequency !== 'custom') {
      settings.repeating_frequency = formData.repeating_frequency.charAt(0).toUpperCase() + formData.repeating_frequency.slice(1);
    }

    if (formData.max_attendees_per_user != null) {
      settings.max_attendees_per_user = formData.max_attendees_per_user;
    }

    if (formData.additional_fees) {
      const fees = parseFloat(formData.additional_fees);
      if (!isNaN(fees)) {
        settings.additional_fees = fees;
      }
    }

    return settings;
  }

  cleanupEventPayload(payload: any, settings: any): any {
    const fieldsToDelete = [
      'repeating_events',
      'date',
      'start_time',
      'end_time',
      'until_finished',
      'is_repeating_event',
      'repeating_frequency',
      'is_rsvp_approval_required',
      'is_show_timer',
      'max_attendees_per_user',
      'host_pays_platform_fee',
      'additional_fees',
      'is_subscription',
      'guest_fee_enabled',
      'allow_plus_ones',
      'category',
      'subscription_plan',
      'repeat_count',
      'custom_repeat_count',
      'subscription_id'
    ];

    fieldsToDelete.forEach((field) => delete payload[field]);

    if (payload.participants && Array.isArray(payload.participants)) {
      payload.participants = payload.participants.map((p: any) => ({
        user_id: p.user_id,
        role: p.role
      }));
    }

    if (Object.keys(settings).length > 0) {
      payload.settings = settings;
    }

    return payload;
  }

  async getRecommendedEvents(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      start_date?: string;
      append?: boolean; // If true, append to existing events instead of replacing
    } = {}
  ): Promise<EventsResponse> {
    try {
      let httpParams = new HttpParams();

      if (params.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }
      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
      if (params.start_date) {
        httpParams = httpParams.set('start_date', params.start_date);
      }

      const response = await this.get<EventsResponse>('/events/recommended', { params: httpParams });
      const events = response?.data?.data || [];

      // Store events
      if (params.append) {
        this.recommendedEvents.update((current) => [...current, ...events]);
      } else {
        this.recommendedEvents.set(events);
      }

      return response;
    } catch (error) {
      console.error('Error fetching recommended events:', error);
      throw error;
    }
  }

  async getEvents(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      include_participant_events?: boolean;
      order_by?: string;
      order_direction?: 'ASC' | 'DESC';
      is_my_events?: boolean;
      is_included_me_event?: boolean;
      city?: string;
      state?: string;
      is_public?: boolean;
      start_date?: string;
      append?: boolean; // If true, append to existing events instead of replacing
    } = {}
  ): Promise<EventsResponse> {
    try {
      let httpParams = new HttpParams();

      if (params.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }
      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
      if (params.include_participant_events !== undefined) {
        httpParams = httpParams.set('include_participant_events', params.include_participant_events.toString());
      }
      if (params.order_by) {
        httpParams = httpParams.set('order_by', params.order_by);
      }
      if (params.order_direction) {
        httpParams = httpParams.set('order_direction', params.order_direction);
      }
      if (params.is_my_events !== undefined) {
        httpParams = httpParams.set('is_my_events', params.is_my_events.toString());
      }
      if (params.is_included_me_event !== undefined) {
        httpParams = httpParams.set('is_included_me_event', params.is_included_me_event.toString());
      }
      if (params.city) {
        httpParams = httpParams.set('city', params.city);
      }
      if (params.state) {
        httpParams = httpParams.set('state', params.state);
      }
      if (params.is_public !== undefined) {
        httpParams = httpParams.set('is_public', params.is_public.toString());
      }
      if (params.start_date) {
        httpParams = httpParams.set('start_date', params.start_date);
      }

      const response = await this.get<EventsResponse>('/events', { params: httpParams });
      const events = response?.data?.data || [];

      // Store public events if is_public is true
      if (params.is_public === true) {
        if (params.append) {
          this.publicEvents.update((current) => [...current, ...events]);
        } else {
          this.publicEvents.set(events);
        }
      }

      return response;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  // like/unlike event
  async likeEvent(eventId: string): Promise<{ data: { content: boolean } }> {
    try {
      const response = await this.post<{ data: { content: boolean } }>(`/events/${eventId}/like`, {});
      return response;
    } catch (error) {
      console.error('Error toggling event like:', error);
      throw error;
    }
  }

  // delete event
  async deleteEvent(eventId: string): Promise<EventResponse> {
    try {
      const response = await this.delete<EventResponse>(`/events/${eventId}`);
      return response;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // report event
  async reportEvent(eventId: string, reportData: { report_reason_id: string; reason?: string }): Promise<any> {
    try {
      const response = await this.post<any>(`/events/${eventId}/report`, reportData);
      return response;
    } catch (error) {
      console.error('Error reporting event:', error);
      throw error;
    }
  }

  // Save event attendee (RSVP) - sends single attendee object
  async saveEventAttendee(eventId: string, attendee: EventAttendee): Promise<any> {
    try {
      const response = await this.post<any>(`/events/${eventId}/attendees`, attendee);
      return response;
    } catch (error) {
      console.error('Error saving event attendee:', error);
      throw error;
    }
  }

  // Save event feedback (questionnaire responses)
  async saveEventFeedback(eventId: string, feedbackPayload: EventFeedbackPayload): Promise<any> {
    try {
      const response = await this.post<any>(`/events/${eventId}/feedback`, feedbackPayload);
      return response;
    } catch (error) {
      console.error('Error saving event feedback:', error);
      throw error;
    }
  }

  // Send RSVP request (when approval is required)
  async sendRsvpRequest(eventId: string): Promise<any> {
    try {
      const response = await this.post<any>(`/rsvp-requests/${eventId}`, {});
      return response;
    } catch (error) {
      console.error('Error sending RSVP request:', error);
      throw error;
    }
  }

  // Approve or reject RSVP request
  async approveOrRejectRsvpRequest(eventId: string, requestId: string, action: 'Approved' | 'Rejected'): Promise<any> {
    try {
      const response = await this.put<any>(`/rsvp-requests/${eventId}/approve-or-reject/${requestId}`, { action });
      return response;
    } catch (error) {
      console.error('Error approving/rejecting RSVP request:', error);
      throw error;
    }
  }

  // Reset all events (similar to resetAllFeeds in FeedService)
  resetAllEvents(): void {
    this.recommendedEvents.set([]);
    this.publicEvents.set([]);
  }
}
