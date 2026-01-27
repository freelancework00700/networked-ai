import { Subscription } from 'rxjs';
import { MenuModule } from 'primeng/menu';
import { IUser } from '@/interfaces/IUser';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';
import { ActivatedRoute } from '@angular/router';
import { Button } from '@/components/form/button';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '@/services/auth.service';
import { EventService } from '@/services/event.service';
import { ModalService } from '@/services/modal.service';
import { MenuItem as PrimeMenuItem } from 'primeng/api';
import { ToasterService } from '@/services/toaster.service';
import { EventDisplay } from '@/components/common/event-display';
import { EmptyState } from '@/components/common/empty-state';
import { NavigationService } from '@/services/navigation.service';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { MenuItem } from '@/components/modal/menu-modal/menu-modal';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { RsvpDetailsModal } from '@/components/modal/rsvp-details-modal';
import {
  IonContent,
  IonFooter,
  IonToolbar,
  IonHeader,
  IonIcon,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent
} from '@ionic/angular/standalone';
import { OnInit, inject, signal, computed, effect, Component, OnDestroy, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'event',
  styleUrl: './event.scss',
  templateUrl: './event.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    IonIcon,
    IonFooter,
    IonHeader,
    IonContent,
    IonToolbar,
    IonSkeletonText,
    IonRefresher,
    IonRefresherContent,
    MenuModule,
    EventDisplay,
    NgOptimizedImage,
    EmptyState
  ]
})
export class Event implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  authService = inject(AuthService);
  modalService = inject(ModalService);
  eventService = inject(EventService);
  toasterService = inject(ToasterService);
  navigationService = inject(NavigationService);
  platformId = inject(PLATFORM_ID);

  // subscriptions
  routeParamsSubscription?: Subscription;
  timerInterval?: any;

  // SIGNALS
  timerTrigger = signal(0);
  event = signal<any>(null);
  selectedDate = signal('');
  eventId = signal<string>('');
  isLoading = signal<boolean>(true);
  subscriptionId = signal<string>('');
  isLoadingChildEvent = signal<boolean>(false);
  isSendingRsvpRequest = signal<boolean>(false);
  selectedChildEventId = signal<string | null>(null);
  childEventData = signal<Map<string, any>>(new Map());
  isNativePlatform = computed(() => Capacitor.isNativePlatform());

  eventIdFromData = computed(() => {
    // If a child event is selected, return its ID, otherwise return parent event ID
    const selectedChildId = this.selectedChildEventId();
    if (selectedChildId) {
      return selectedChildId;
    }
    const eventData = this.event();
    return eventData?.id || null;
  });

  currentUser = computed(() => this.authService.currentUser());
  subscriptionPlanType = computed<'event' | 'sponsor' | null>(() => {
    const eventData = this.currentEventData();
    if (!eventData) return null;
    if (eventData.is_subscription && eventData.subscription_plan === 'event') return 'event';
    if (eventData.is_subscription && eventData.subscription_plan === 'sponsor') return 'sponsor';
    return null;
  });

  currentEventData = computed(() => {
    const parentEvent = this.event();
    if (!parentEvent) return null;

    const selectedChildId = this.selectedChildEventId();
    if (!selectedChildId || !parentEvent.child_events || parentEvent.child_events.length === 0) {
      return parentEvent;
    }

    const childEventsMap = this.childEventData();
    const fetchedChildData = childEventsMap.get(selectedChildId);

    if (fetchedChildData) {
      return {
        ...parentEvent,
        ...fetchedChildData,
        child_events: parentEvent.child_events
      };
    }

    const selectedChild = parentEvent.child_events.find((child: any) => child.id === selectedChildId);
    if (!selectedChild) return parentEvent;

    return {
      ...parentEvent,
      start_date: selectedChild.start_date || parentEvent.start_date,
      end_date: selectedChild.end_date || parentEvent.end_date,
      latitude: selectedChild.latitude || parentEvent.latitude,
      longitude: selectedChild.longitude || parentEvent.longitude,
      address: selectedChild.address || parentEvent.address,
      city: selectedChild.city || parentEvent.city,
      state: selectedChild.state || parentEvent.state,
      country: selectedChild.country || parentEvent.country,
      child_events: parentEvent.child_events
    };
  });

  menuItems = computed<MenuItem[]>(() => {
    const isCompleted = this.isEventCompleted();
    const displayData = this.eventDisplayData();

    const isHost = displayData.isCurrentUserHost;
    const isCoHost = displayData.isCurrentUserCoHost;
    const hasQuestionnaire = displayData.questionnaire && displayData.questionnaire.length > 0;

    let baseItems: MenuItem[] = [
      { label: 'Edit', icon: 'assets/svg/manage-event/edit.svg', iconType: 'svg', action: 'editEvent' },
      { label: 'Analytics', icon: 'assets/svg/manage-event/analytics.svg', iconType: 'svg', action: 'viewEventAnalytics' },
      { label: 'Questionnaire Responses', icon: 'assets/svg/manage-event/questionnaire.svg', iconType: 'svg', action: 'viewQuestionnaireResponses' },
      { label: 'Manage Roles', icon: 'assets/svg/manage-event/settings.svg', iconType: 'svg', action: 'manageRoles' },
      { label: 'Guest List', icon: 'assets/svg/manage-event/users.svg', iconType: 'svg', action: 'viewGuestList' },
      { label: 'Event Page QR', icon: 'assets/svg/scanner.svg', iconType: 'svg', action: 'viewEventPageQr' },
      { label: 'Share Event', icon: 'pi pi-upload', iconType: 'pi', action: 'shareEvent' },
      { label: 'Cancel Event', icon: 'assets/svg/manage-event/calendar-x.svg', iconType: 'svg', danger: true, action: 'cancelEvent' }
    ];

    // 👉 NEW: questionnaire condition
    if (!hasQuestionnaire) {
      baseItems = baseItems.filter((item) => item.action !== 'viewQuestionnaireResponses');
    }

    if (isCoHost && !isHost) {
      const allowedActions = ['viewEventAnalytics', 'viewGuestList', 'viewEventPageQr', 'shareEvent'];

      return baseItems.filter((item) => allowedActions.includes(item.action || ''));
    }

    if (isCompleted) {
      baseItems = baseItems.filter((item) => !['editEvent', 'manageRoles'].includes(item.action || ''));
    }

    // RSVP Approval
    if (displayData.isRsvpApprovalRequired) {
      const rsvpApprovalItem: MenuItem = {
        label: 'RSVP Approval',
        icon: 'pi pi-check-circle',
        iconType: 'pi',
        action: 'viewRsvpApproval'
      };

      const qrIndex = baseItems.findIndex((i) => i.action === 'viewEventPageQr');
      if (qrIndex !== -1) {
        baseItems.splice(qrIndex + 1, 0, rsvpApprovalItem);
      }
    }

    // Ticket Scanner
    if (isHost && this.isNativePlatform()) {
      const scannerItem: MenuItem = {
        label: 'Ticket Scanner',
        icon: 'assets/svg/scanner.svg',
        iconType: 'svg',
        action: 'scanQRCode'
      };

      const qrIndex = baseItems.findIndex((i) => i.action === 'viewEventPageQr');
      if (qrIndex !== -1) {
        baseItems.splice(qrIndex + 1, 0, scannerItem);
      }
    }

    return baseItems;
  });

  networkSuggestions = [
    { id: '1', name: 'Kathryn Murphy', role: 'Staff' },
    { id: '2', name: 'Esther Howard', role: 'CoHost' },
    { id: '3', name: 'Arlene McCoy' },
    { id: '4', name: 'Darlene Robertson', role: 'Speaker' },
    { id: '5', name: 'Ronald Richards', role: 'Sponsor' },
    { id: '6', name: 'Albert Flores', role: 'CoHost' }
  ];

  eventMenuItems: PrimeMenuItem[] = [
    {
      label: 'Report',
      icon: 'pi pi-flag',
      command: () => this.reportEvent()
    }
  ];

  isShowTimer = computed(() => {
    const eventData = this.currentEventData();
    return eventData?.settings?.is_show_timer === true;
  });

  isEventCompleted = computed(() => {
    const eventData = this.currentEventData();
    const now = Date.now();
    const eventStart = new Date(eventData.start_date).getTime();

    // Event is completed if start date is in the past
    return eventStart < now;
  });

  countdownTimer = computed(() => {
    this.timerTrigger();
    const eventData = this.currentEventData();
    if (!eventData?.start_date) return null;

    const now = new Date().getTime();
    const eventStart = new Date(eventData.start_date).getTime();
    const difference = eventStart - now;

    if (difference <= 0) return null;

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    const isLessThan24Hours = difference < 24 * 60 * 60 * 1000;

    if (isLessThan24Hours) {
      return {
        formatted: `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`,
        isLessThan24Hours: true
      };
    } else {
      return {
        formatted: `${days} d ${hours} h ${minutes.toString().padStart(2, '0')} m`,
        isLessThan24Hours: false
      };
    }
  });

  mainImageUrl = computed(() => {
    const displayData = this.eventDisplayData();
    if (displayData.displayMedias && displayData.displayMedias.length > 0) {
      const firstMedia = displayData.displayMedias[0];
      return firstMedia?.url || firstMedia?.media_url || displayData.thumbnail_url;
    }
    return displayData.thumbnail_url;
  });

  formatTimerDisplay(formatted: string, isLessThan24Hours: boolean): string {
    if (isLessThan24Hours) {
      const parts = formatted.split(' : ');
      return parts
        .map((part, index) => {
          if (index < parts.length - 1) {
            return `<span>${part}</span><span class="timer-colon"> : </span>`;
          }
          return `<span>${part}</span>`;
        })
        .join('');
    } else {
      return formatted.replace(/(\d+)\s*([dhm])/g, '<span>$1</span><span class="timer-unit">$2</span>');
    }
  }

  isEventLiked = computed(() => {
    const eventData = this.currentEventData();
    return eventData?.is_like || false;
  });

  eventDisplayData = computed(() => {
    const eventData = this.currentEventData();
    if (!eventData) {
      return {
        thumbnail_url: '',
        title: '',
        description: '',
        images: [],
        displayMedias: [],
        total_views: '0',
        isPublic: true,
        location: '',
        hostName: 'Networked AI',
        mapCenter: null,
        admission: 'Free',
        formattedDateTime: '',
        userSections: [],
        isRepeatingEvent: false,
        dateItems: [],
        rsvpButtonLabel: 'RSVP Now for Free',
        isCurrentUserHost: false,
        isCurrentUserCoHost: false,
        isCurrentUserAttendee: false,
        isRsvpApprovalRequired: false,
        hasCurrentUserRsvpRequest: false,
        isCurrentUserRequestApproved: false,
        isCurrentUserRequestPending: false,
        isCurrentUserRequestRejected: false,
        tickets: [],
        questionnaire: [],
        promo_codes: [],
        subscriptionPlanType: null,
        has_plans: false,
        is_subscriber_exclusive: false,
        has_subscribed: false
      };
    }
    const parentEvent = this.event();
    const currentUser = this.currentUser();

    const transformedData = this.eventService.transformEventDataForDisplay(eventData, parentEvent, currentUser);

    const dateItems = this.eventService.createDateItems(parentEvent || eventData);

    // Check if current user is an attendee
    const attendees = eventData?.attendees || [];
    const isCurrentUserAttendee = currentUser?.id ? attendees.some((attendee: any) => attendee.user?.id === currentUser.id) : false;
    // const isCurrentUserAttendee = currentUser?.id ? attendees.some((attendee: any) => attendee.id === currentUser.id) : false;

    // Check if current user has sent an RSVP request and its status
    const rsvpRequests = eventData?.rsvp_requests || [];
    const currentUserRequest = currentUser?.id ? rsvpRequests.find((request: any) => request.user_id === currentUser.id) : null;

    const hasCurrentUserRsvpRequest = !!currentUserRequest;
    const isCurrentUserRequestApproved = currentUserRequest?.status === 'Approved' || currentUserRequest?.status === 'approved';
    const isCurrentUserRequestPending = currentUserRequest?.status === 'Pending' || currentUserRequest?.status === 'pending';
    const isCurrentUserRequestRejected = currentUserRequest?.status === 'Rejected' || currentUserRequest?.status === 'rejected';

    return {
      ...transformedData,
      dateItems,
      subscriptionPlanType: this.subscriptionPlanType(),
      isCurrentUserAttendee,
      hasCurrentUserRsvpRequest,
      isCurrentUserRequestApproved,
      isCurrentUserRequestPending,
      isCurrentUserRequestRejected,
      has_plans: eventData?.has_plans || false,
      is_subscriber_exclusive: eventData?.settings?.is_subscriber_exclusive ?? false,
      has_subscribed: eventData?.has_subscribed || false
    };
  });

  ngOnInit(): void {
    this.routeParamsSubscription = this.route.paramMap.subscribe((params) => {
      const eventSlug = params.get('slug');
      if (eventSlug) {
        this.eventId.set(eventSlug);
        this.loadEvent();
      }
    });

    this.timerInterval = setInterval(() => {
      if (this.isShowTimer() && this.countdownTimer()) {
        this.timerTrigger.update((v) => v + 1);
      }
    }, 1000);
  }

  async trackEventView(eventId: string): Promise<void> {
    try {
      const deviceInfo = await Device.getId();
      if (deviceInfo?.identifier) {
        await this.eventService.addView(eventId, deviceInfo.identifier);
      }
    } catch (deviceError) {
      console.error('Error tracking event view:', deviceError);
    }
  }

  async loadEvent(): Promise<void> {
    const eventId = this.eventId();
    if (!eventId) return;

    try {
      this.isLoading.set(true);

      const eventData = await this.eventService.getEventById(eventId);
      if (eventData) {
        this.event.set(eventData);

        if (eventData.subscription_id) {
          this.subscriptionId.set(eventData.subscription_id);
        }

        this.selectedChildEventId.set(null);
        this.childEventData.set(new Map());
        if (eventData.start_date) {
          this.selectedDate.set(this.eventService.formatDateKey(eventData.start_date));
        } else if (this.eventDisplayData().dateItems.length > 0) {
          this.selectedDate.set(this.eventDisplayData().dateItems[0].value);
        }
        await this.trackEventView(eventData.id);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      this.toasterService.showError('Failed to load event');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      await this.loadEvent();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      event.target.complete();
    }
  }

  async onDateChange(date: string): Promise<void> {
    this.selectedDate.set(date);
    this.handleDateChange(date);
  }

  async handleDateChange(date: string): Promise<void> {
    const eventData = this.event();
    if (!eventData) return;

    if (eventData.child_events && eventData.child_events.length > 0) {
      const matchingChild = eventData.child_events.find((child: any) => {
        if (!child.start_date) return false;
        const childDateKey = this.eventService.formatDateKey(child.start_date);
        return childDateKey === date;
      });

      if (matchingChild) {
        this.selectedChildEventId.set(matchingChild.id);
        await this.loadChildEvent(matchingChild.id);
      } else {
        const parentDateKey = this.eventService.formatDateKey(eventData.start_date);
        if (parentDateKey === date) {
          this.selectedChildEventId.set(null);
        }
      }
    } else {
      this.selectedChildEventId.set(null);
    }
  }

  async loadChildEvent(childEventId: string): Promise<void> {
    const childEventsMap = this.childEventData();
    if (childEventsMap.has(childEventId)) {
      return;
    }

    try {
      this.isLoadingChildEvent.set(true);
      const childEventData = await this.eventService.getEventById(childEventId);
      if (childEventData) {
        const updatedMap = new Map(childEventsMap);
        updatedMap.set(childEventId, childEventData);
        this.childEventData.set(updatedMap);
        await this.trackEventView(childEventData.id);
      }
    } catch (error) {
      console.error('Error loading child event:', error);
      this.toasterService.showError('Failed to load event details');
    } finally {
      this.isLoadingChildEvent.set(false);
    }
  }

  openUserList(title: string, users: IUser[]): void {
    const eventId = this.eventIdFromData();
    const displayData = this.eventDisplayData();
    if (eventId && users && users.length > 0) {
      const sectionParam = encodeURIComponent(title);
      const route = `/event/guests/${eventId}/${sectionParam.toLowerCase()}`;

      const state = {
        users: users,
        role: title,
        eventId: eventId,
        eventTitle: displayData.title
      };

      this.navigationService.navigateForward(route, false, state);
    }
  }

  async openRsvpModal(): Promise<void> {
    const displayData = this.eventDisplayData();
    const eventData = this.currentEventData();
    const hostPaysFees = eventData?.settings?.host_pays_platform_fee ?? false;
    const additionalFees = eventData?.settings?.additional_fees ?? null;
    const maxAttendeesPerUser = eventData?.settings?.max_attendees_per_user ?? 0;
    const hostName = eventData?.participants?.find((p: any) => p.role === 'Host')?.user?.name || 'Networked AI';
    const hasPlans = eventData?.has_plans || false;
    const hasSubscribed = eventData?.has_subscribed || false;
    const isSubscriberExclusive = eventData?.settings?.is_subscriber_exclusive ?? false;

    const result = await this.modalService.openRsvpModal(
      displayData.tickets || [],
      displayData.title || '',
      displayData.questionnaire || [],
      displayData.promo_codes || [],
      this.subscriptionId(),
      hostPaysFees,
      additionalFees,
      maxAttendeesPerUser,
      hostName,
      this.eventIdFromData() || '',
      hasPlans,
      hasSubscribed,
      isSubscriberExclusive
    );
    if (result) {
      const loadingModal = await this.modalService.openLoadingModal('Processing your RSVP...');

      try {
        const feedbackSaved = await this.saveEventFeedback(result);
        if (feedbackSaved) {
          try {
            await this.saveRsvpAttendees(result, result?.stripe_payment_intent_id || '');
            await loadingModal.dismiss();
            await this.modalService.openRsvpConfirmModal(result as RsvpDetailsModal);
            await this.loadEvent();
          } catch (attendeeError) {
            await loadingModal.dismiss();
            console.error('Error saving RSVP attendees:', attendeeError);
            this.toasterService.showError('Failed to save RSVP. Please try again.');
            return;
          }
        } else {
          await loadingModal.dismiss();
        }
      } catch (error) {
        await loadingModal.dismiss();
        console.error('Error processing RSVP:', error);
        this.toasterService.showError('Failed to process RSVP. Please try again.');
      }
    }
  }

  async sendRsvpRequest(): Promise<void> {
    const eventId = this.eventIdFromData();
    if (!eventId) {
      console.error('Event ID not found');
      return;
    }

    this.isSendingRsvpRequest.set(true);

    try {
      await this.eventService.sendRsvpRequest(eventId);
      this.toasterService.showSuccess('RSVP request sent successfully');
      await this.loadEvent();
    } catch (error) {
      console.error('Error sending RSVP request:', error);
      this.toasterService.showError('Failed to send RSVP request. Please try again.');
    } finally {
      this.isSendingRsvpRequest.set(false);
    }
  }

  async saveEventFeedback(rsvpResult: any): Promise<boolean> {
    try {
      const eventId = this.eventIdFromData();
      if (!eventId) {
        console.error('Event ID not found');
        return false;
      }

      const questionnaireResult = rsvpResult?.questionnaireResult;
      if (!questionnaireResult || !questionnaireResult.responses || questionnaireResult.responses.length === 0) {
        return true;
      }

      const feedback: any[] = [];

      questionnaireResult.responses.forEach((response: any) => {
        if (!response.question_id) {
          return;
        }

        const questionType = response.type || '';
        let answer: string | number | string[] = '';

        if (questionType === 'SingleChoice') {
          let answerValue: string = '';
          let optionId: string | undefined = undefined;

          if (typeof response.answer === 'object' && response.answer !== null) {
            answerValue = response.answer.option || '';
            optionId = response.answer.id || undefined;
          } else {
            answerValue = response.answer || '';
            const selectedOption = response.options?.find((opt: any) => {
              const optionText = typeof opt === 'object' ? opt.option : opt;
              return optionText === answerValue;
            });
            optionId = selectedOption?.id || undefined;
          }

          feedback.push({
            question_id: response.question_id,
            answer_option_id: optionId,
            answer: answerValue
          });
        } else if (questionType === 'MultipleChoice') {
          const selectedOptions = Array.isArray(response.answer) ? response.answer : [response.answer];
          selectedOptions.forEach((selectedAnswer: any) => {
            let answerValue: string = '';
            let optionId: string | undefined = undefined;

            if (typeof selectedAnswer === 'object' && selectedAnswer !== null) {
              answerValue = selectedAnswer.option || '';
              optionId = selectedAnswer.id || undefined;
            } else {
              answerValue = selectedAnswer || '';
              const selectedOption = response.options?.find((opt: any) => {
                const optionText = typeof opt === 'object' ? opt.option : opt;
                return optionText === answerValue;
              });
              optionId = selectedOption?.id || undefined;
            }

            feedback.push({
              question_id: response.question_id,
              answer_option_id: optionId,
              answer: answerValue
            });
          });
        } else {
          answer = response.answer || '';
          feedback.push({
            question_id: response.question_id,
            answer_option_id: undefined,
            answer: String(answer)
          });
        }
      });

      if (feedback.length > 0) {
        const payload = {
          feedback: feedback
        };

        await this.eventService.saveEventFeedback(eventId, payload);
        return true;
      }
      return true;
    } catch (error) {
      console.error('Error saving event feedback:', error);
      this.toasterService.showError('Failed to save questionnaire responses. Please try again.');
      return false;
    }
  }

  async saveRsvpAttendees(rsvpResult: any, stripe_payment_intent_id: string): Promise<void> {
    const eventId = rsvpResult?.event_id || this.eventIdFromData();
    if (!eventId) {
      throw new Error('Event ID not found');
    }

    const attendees = rsvpResult?.attendees || [];

    if (attendees.length === 0) {
      console.warn('No attendees to save');
      return;
    }

    const payload: any = {
      event_id: eventId,
      attendees: attendees
    };

    if (stripe_payment_intent_id) {
      payload.stripe_payment_intent_id = stripe_payment_intent_id;
    }

    await this.eventService.saveEventAttendees(payload);
  }

  goBack(): void {
    this.navigationService.back();
  }

  async openMenu() {
    const result = await this.modalService.openMenuModal(this.menuItems());
    if (!result?.role) return;

    const actions: Record<string, () => void> = {
      editEvent: () => this.editEvent(),
      viewEventAnalytics: () => this.viewEventAnalytics(),
      viewQuestionnaireResponses: () => this.viewQuestionnaireResponses(),
      manageRoles: () => this.manageRoles(),
      viewGuestList: () => this.viewGuestList(),
      viewEventPageQr: () => this.viewEventPageQr(),
      viewRsvpApproval: () => this.viewRsvpApproval(),
      viewTapToPay: () => this.viewTapToPay(),
      shareEvent: () => this.shareEvent(),
      cancelEvent: () => this.cancelEvent(),
      scanQRCode: () => this.scanQRCode()
    };
    actions[result.role]?.();
  }

  openEventChat(): void {
    const eventId = this.eventIdFromData();
    const currentUserId = this.authService.currentUser()?.id;
    const eventData = this.currentEventData();

    if (eventId && currentUserId) {
      this.navigationService.navigateForward('/chat-room', false, {
        event_id: eventId,
        is_personal: false,
        name: eventData?.title || null,
        event_image: eventData?.image_url?.[0] || null,
        user_ids: []
      });
    }
  }

  async openTicketsModal(): Promise<void> {
    const currentEventData = this.currentEventData();
    if (currentEventData) {
      const result = await this.modalService.openMyTicketsModal(currentEventData);
    }
  }

  editEvent() {
    const eventId = this.eventIdFromData();
    if (eventId) {
      this.navigationService.navigateForward(`/event/edit/${eventId}`);
    }
  }

  viewEventAnalytics() {
    const eventId = this.eventIdFromData();
    if (eventId) {
      this.navigationService.navigateForward(`/event/analytics/${eventId}`);
    }
  }

  viewQuestionnaireResponses() {
    const eventId = this.eventIdFromData();
    if (eventId) {
      this.navigationService.navigateForward(`/event/questionnaire-response/${eventId}`);
    }
  }

  async manageRoles() {
    const eventId = this.eventIdFromData();
    if (eventId) {
      const participants = this.currentEventData()?.participants || [];
      const result = await this.modalService.openManageRoleModal(participants, eventId);
      this.loadEvent();
    }
  }

  viewGuestList() {
    const eventId = this.eventIdFromData();
    if (eventId) {
      this.navigationService.navigateForward(`/event/guests/${eventId}`);
    }
  }

  async viewEventPageQr() {
    const currentEventData = this.currentEventData();
    if (currentEventData) {
      const result = await this.modalService.openEventQrModal(currentEventData);
    }
  }

  viewRsvpApproval() {
    const eventId = this.eventIdFromData();
    if (!eventId) return;

    this.navigationService.navigateForward(`/event/rsvp-approval/${eventId}`, true);
  }

  viewTapToPay() {}

  async shareEvent() {
    const eventId = this.eventIdFromData();
    if (eventId) {
      const result = await this.modalService.openShareModal(eventId, 'Event');
      if (result) {
        this.toasterService.showSuccess('Event shared');
      }
    }
  }

  async cancelEvent() {
    const result = await this.modalService.openConfirmModal({
      icon: 'assets/svg/deleteWhiteIcon.svg',
      iconBgColor: '#C73838',
      title: 'Cancel This Event',
      description: "Are you sure you want to cancel this event? We'll notify everyone that have registered, and issue automatic refunds.",
      confirmButtonLabel: 'Cancel Event',
      cancelButtonLabel: 'Cancel',
      confirmButtonColor: 'danger',
      iconPosition: 'left'
    });
    if (result && result.role === 'confirm') {
      const eventId = this.eventIdFromData();
      if (!eventId) return;

      try {
        await this.eventService.deleteEvent(eventId);
        this.toasterService.showSuccess('Event cancelled');
        this.navigationService.navigateForward('/', true);
      } catch (error) {
        console.error('Error cancelling event:', error);
        this.toasterService.showError('Failed to cancel event. Please try again.');
      }
    }
  }

  async likeEvent(): Promise<void> {
    const eventId = this.eventIdFromData();
    const currentEventData = this.currentEventData();
    if (!eventId || !currentEventData) return;

    const currentIsLiked = currentEventData.is_like || false;
    const newIsLiked = !currentIsLiked;

    // Check if we're dealing with a child event
    const selectedChildId = this.selectedChildEventId();
    if (selectedChildId) {
      // Update child event data
      const childEventsMap = this.childEventData();
      const childEvent = childEventsMap.get(selectedChildId);

      if (childEvent) {
        const updatedChildEvent = {
          ...childEvent,
          is_like: newIsLiked,
          total_likes: newIsLiked ? (childEvent.total_likes || 0) + 1 : Math.max((childEvent.total_likes || 0) - 1, 0)
        };

        const updatedMap = new Map(childEventsMap);
        updatedMap.set(selectedChildId, updatedChildEvent);
        this.childEventData.set(updatedMap);
      }
    } else {
      // Update parent event
      this.event.update((e) => ({
        ...e,
        is_like: newIsLiked,
        total_likes: newIsLiked ? (e.total_likes || 0) + 1 : Math.max((e.total_likes || 0) - 1, 0)
      }));
    }

    try {
      await this.eventService.likeEvent(eventId);
    } catch (error) {
      console.error('Error toggling event like:', error);
      this.toasterService.showError('Failed to like event. Please try again.');
    }
  }

  async reportEvent() {
    const result = await this.modalService.openReportModal('Event');
    if (!result || !result.reason_id) return;

    const eventId = this.eventIdFromData();
    if (!eventId) return;

    try {
      const reasonText = result.reason || 'Inappropriate content';

      await this.eventService.reportEvent(eventId, {
        report_reason_id: result.reason_id,
        reason: reasonText
      });

      const resultModal = await this.modalService.openConfirmModal({
        iconName: 'pi pi-check',
        iconBgColor: '#F5BC61',
        title: 'Report Submitted',
        description: 'We use these reports to show you less of this kind of content in the future.',
        confirmButtonLabel: 'Done'
      });

      if (resultModal && resultModal.role === 'confirm') {
        this.toasterService.showSuccess('Event reported');
      }
    } catch (error) {
      console.error('Error reporting event:', error);
      this.toasterService.showError('Failed to report event. Please try again.');
    }
  }

  navigateToSubscriptionPlans(): void {
    const eventData = this.currentEventData();
    const planIds = eventData?.plan_ids;

    if (planIds && planIds.length > 0) {
      const planId = planIds[0];
      this.navigationService.navigateForward(`/subscription/${planId}`);
    }
  }

  ngOnDestroy(): void {
    this.routeParamsSubscription?.unsubscribe();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }

  onImageError(event: any): void {
    onImageError(event);
  }

  async scanQRCode(): Promise<void> {
    try {
      const result = await BarcodeScanner.scan();

      if (result.barcodes && result.barcodes.length > 0) {
        const barcode = result.barcodes[0];
        const scannedValue = barcode.displayValue || barcode.rawValue || '';

        if (scannedValue) {
          await this.handleQRCodeScanned(scannedValue);
        } else {
          this.toasterService.showError('No QR code data found');
        }
      } else {
        this.toasterService.showError('No QR code detected');
      }
    } catch (error: any) {
      if (error.message && (error.message.includes('cancel') || error.message.includes('dismiss'))) {
        // User cancelled, no need to show error
        return;
      }
      console.error('Error scanning QR code:', error);
      this.toasterService.showError('Failed to scan QR code');
    }
  }

  private async handleQRCodeScanned(decodedText: string): Promise<void> {
    try {
      let payload = {
        event_id: this.currentEventData().id,
        attendee_id: decodedText,
        is_checked_in: true
      };
      if (decodedText) {
        await this.eventService.changeCheckInStatus(payload);
        this.toasterService.showSuccess('Check in successfully');
      } else {
        this.toasterService.showError('Invalid QR code. Please scan a valid profile QR code.');
      }
    } catch (error) {
      console.error('Error parsing QR code:', error);
      this.toasterService.showError('Invalid QR code format.');
    }
  }
}
