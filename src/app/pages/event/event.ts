import {
  OnInit,
  inject,
  signal,
  Inject,
  computed,
  effect,
  DOCUMENT,
  Component,
  OnDestroy,
  PLATFORM_ID,
  ChangeDetectionStrategy
} from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { IUser } from '@/interfaces/IUser';
import { FormsModule } from '@angular/forms';
import { Button } from '@/components/form/button';
import { AuthService } from '@/services/auth.service';
import { EventService } from '@/services/event.service';
import { ModalService } from '@/services/modal.service';
import { MenuItem as PrimeMenuItem } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from '@/services/toaster.service';
import { EventDisplay } from '@/components/common/event-display';
import { NavigationService } from '@/services/navigation.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MenuItem } from '@/components/modal/menu-modal/menu-modal';
import { RsvpDetailsModal } from '@/components/modal/rsvp-details-modal';
import { IonContent, IonFooter, IonToolbar, IonHeader, IonIcon, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'event',
  styleUrl: './event.scss',
  templateUrl: './event.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonIcon, IonFooter, IonHeader, IonContent, IonToolbar, MenuModule, FormsModule, EventDisplay]
})
export class Event implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  navCtrl = inject(NavController);
  platformId = inject(PLATFORM_ID);
  sanitizer = inject(DomSanitizer);
  authService = inject(AuthService);
  modalService = inject(ModalService);
  eventService = inject(EventService);
  toasterService = inject(ToasterService);
  navigationService = inject(NavigationService);
  @Inject(DOCUMENT) private document = inject(DOCUMENT);

  // SIGNALS
  event = signal<any>(null);
  selectedDate = signal('');
  isScrolled = signal(false);
  eventId = signal<string>('');
  isLoading = signal<boolean>(true);
  subscriptionId = signal<string>('');
  isLoadingChildEvent = signal<boolean>(false);
  selectedChildEventId = signal<string | null>(null);
  childEventData = signal<Map<string, any>>(new Map());

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

  tickets = signal<any[]>([
    {
      id: '1',
      name: 'Standard Ticket',
      ticket_type: 'Standard',
      is_free_ticket: true,
      price: 0.0,
      quantity: 20,
      remainingQuantity: 20,
      selectedQuantity: 0,
      description: 'Insert one or two lines of the description here.',
      status: 'available'
    },
    {
      id: '2',
      name: 'Presale 1',
      ticket_type: 'Early Bird',
      is_free_ticket: false,
      price: 5.0,
      quantity: 0,
      description: 'Insert one or two lines of the description here.',
      status: 'sale-ended'
    },
    {
      id: '3',
      name: 'Presale 1',
      ticket_type: 'Early Bird',
      is_free_ticket: false,
      price: 5.0,
      quantity: 10,
      remainingQuantity: 10,
      selectedQuantity: 0,
      description: 'Insert one or two lines of the description here.',
      status: 'available'
    },
    {
      id: '4',
      name: 'Presale 3',
      ticket_type: 'Early Bird',
      is_free_ticket: false,
      price: 5.0,
      quantity: 0,
      description: 'Insert one or two lines of the description here.',
      status: 'sold-out'
    },
    {
      id: '5',
      name: 'Standard Ticket',
      ticket_type: 'Standard',
      is_free_ticket: false,
      price: 10.0,
      quantity: 0,
      description: 'Insert one or two lines of the description here.',
      status: 'sold-out'
    },
    {
      id: '6',
      name: 'Standard Ticket',
      ticket_type: 'Standard',
      is_free_ticket: false,
      price: 30.0,
      quantity: null,
      description: 'Insert one or two lines of the description here.',
      startsIn: '3d',
      status: 'upcoming'
    },
    {
      id: '7',
      name: 'VVIP Sponsorship',
      ticket_type: 'Sponsor',
      is_free_ticket: false,
      price: 1999.0,
      quantity: null,
      selectedQuantity: 0,
      description: 'Insert one or two lines of the description here.',
      status: 'available'
    },
    {
      id: '8',
      name: 'VVIP Sponsorship',
      ticket_type: 'Sponsor',
      is_free_ticket: false,
      price: 1999.0,
      quantity: null,
      description: 'Insert one or two lines of the description here.',
      startsIn: '3d',
      status: 'upcoming'
    }
  ]);

  menuItems: MenuItem[] = [
    { label: 'Edit', icon: 'assets/svg/manage-event/edit.svg', iconType: 'svg', action: 'editEvent' },
    { label: 'Analytics', icon: 'assets/svg/manage-event/analytics.svg', iconType: 'svg', action: 'viewEventAnalytics' },
    { label: 'Questionnaire Responses', icon: 'assets/svg/manage-event/questionnaire.svg', iconType: 'svg', action: 'viewQuestionnaireResponses' },
    { label: 'Manage Roles', icon: 'assets/svg/manage-event/settings.svg', iconType: 'svg', action: 'manageRoles' },
    { label: 'Guest List', icon: 'assets/svg/manage-event/users.svg', iconType: 'svg', action: 'viewGuestList' },
    { label: 'Event Page QR', icon: 'assets/svg/scanner.svg', iconType: 'svg', action: 'viewEventPageQr' },
    // { label: 'Tap to pay', icon: 'assets/svg/manage-event/tap-to-pay.svg', iconType: 'svg', action: 'viewTapToPay' },
    { label: 'Share Event', icon: 'pi pi-upload', iconType: 'pi', action: 'shareEvent' },
    { label: 'Cancel Event', icon: 'assets/svg/manage-event/calendar-x.svg', iconType: 'svg', danger: true, action: 'cancelEvent' }
  ];

  networkSuggestions = [
    { id: '1', name: 'Kathryn Murphy', role: 'Staff' },
    { id: '2', name: 'Esther Howard', role: 'CoHost' },
    { id: '3', name: 'Arlene McCoy' },
    { id: '4', name: 'Darlene Robertson', role: 'Speaker' },
    { id: '5', name: 'Ronald Richards', role: 'Sponsor' },
    { id: '6', name: 'Albert Flores', role: 'CoHost' }
  ];

  staticQuestionnaire = [
    {
      question: 'What is your name?',
      type: 'text',
      required: true,
      visibility: 'public'
    },
    {
      question: 'What is your age?',
      type: 'number',
      required: false,
      visibility: 'public'
    },
    {
      question: 'What is your phone number?',
      type: 'phone',
      required: true,
      visibility: 'private'
    },
    {
      question: 'What is your gender?',
      type: 'single',
      required: true,
      visibility: 'private',
      options: ['Male', 'Female', 'Other']
    },
    {
      question: 'What is your hobbies?',
      type: 'multiple',
      required: false,
      visibility: 'public',
      options: ['Reading', 'Writing', 'Other']
    },
    {
      question: 'What is your rating?',
      type: 'rating',
      required: true,
      visibility: 'public',
      scale: 5
    }
  ];

  staticPromoCodes = [
    {
      promoCode: 'SAVE20',
      promotion_type: 'percentage',
      promoPresent: '20',
      capped_amount: null,
      redemption_limit: 100,
      max_use_per_user: 1
    },
    {
      promoCode: 'FLAT10',
      promotion_type: 'fixed',
      promoPresent: '10',
      capped_amount: null,
      redemption_limit: 50,
      max_use_per_user: 1
    }
  ];
  eventMenuItems: PrimeMenuItem[] = [
    {
      label: 'Report',
      icon: 'pi pi-flag',
      command: () => this.reportEvent()
    }
  ];

  eventDisplayData = computed(() => {
    const eventData = this.currentEventData();
    if (!eventData) {
      return {
        thumbnail_url: '',
        title: '',
        description: '',
        images: [],
        displayMedias: [],
        views: '0',
        isPublic: true,
        location: '',
        hostName: 'Networked AI',
        mapCenter: null,
        admission: 'Free',
        formattedDateTime: '',
        userSections: [],
        isRepeatingEvent: false,
        dateItems: [],
        rsvpButtonLabel: 'RSVP Now - Free',
        isCurrentUserHost: false,
        tickets: [],
        questionnaire: [],
        promoCodes: [],
        subscriptionPlanType: null
      };
    }
    const parentEvent = this.event();
    const currentUser = this.currentUser();

    // Use the helper function from eventService for consistency
    const transformedData = this.eventService.transformEventDataForDisplay(eventData, parentEvent, currentUser);

    // Get date items for repeating events
    const dateItems = this.eventService.createDateItems(parentEvent || eventData);

    return {
      ...transformedData,
      dateItems,
      subscriptionPlanType: this.subscriptionPlanType()
    };
  });

  // Helper functions for date formatting
  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.eventId.set(eventId);
      this.loadEvent();
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

        this.updateTicketsAndParticipants(eventData);

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
      }
    } catch (error) {
      console.error('Error loading event:', error);
      this.toasterService.showError('Failed to load event');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onDateChange(date: string): Promise<void> {
    this.selectedDate.set(date);

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
          this.updateTicketsAndParticipants(eventData);
        }
      }
    } else {
      this.selectedChildEventId.set(null);
    }
  }

  async loadChildEvent(childEventId: string): Promise<void> {
    const childEventsMap = this.childEventData();
    if (childEventsMap.has(childEventId)) {
      this.updateTicketsAndParticipants(childEventsMap.get(childEventId));
      return;
    }

    try {
      this.isLoadingChildEvent.set(true);
      const childEventData = await this.eventService.getEventById(childEventId);
      if (childEventData) {
        const updatedMap = new Map(childEventsMap);
        updatedMap.set(childEventId, childEventData);
        this.childEventData.set(updatedMap);

        this.updateTicketsAndParticipants(childEventData);
      }
    } catch (error) {
      console.error('Error loading child event:', error);
      this.toasterService.showError('Failed to load event details');
    } finally {
      this.isLoadingChildEvent.set(false);
    }
  }

  private updateTicketsAndParticipants(eventData: any): void {}

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.isScrolled.set(scrollTop > 100);
  }

  openUserList(title: string, users: IUser[]): void {
    const eventId = this.eventId();
    const displayData = this.eventDisplayData();
    if (eventId && users && users.length > 0) {
      this.router.navigate([`/event/${eventId}/guests`], {
        state: {
          users: users,
          role: title,
          eventId: eventId,
          eventTitle: displayData.title
        }
      });
    }
  }

  async openRsvpModal(): Promise<void> {
    const result = await this.modalService.openRsvpModal(
      this.tickets(),
      'Atlanta Makes Me Laugh',
      this.staticQuestionnaire,
      this.staticPromoCodes,
      this.subscriptionId()
    );
    if (result) {
      await this.modalService.openRsvpConfirmModal(result as RsvpDetailsModal);
    }
  }

  goBack(): void {
    this.navCtrl.back();
  }

  async openMenu() {
    const result = await this.modalService.openMenuModal(this.menuItems);
    if (!result?.role) return;

    const actions: Record<string, () => void> = {
      editEvent: () => this.editEvent(),
      viewEventAnalytics: () => this.viewEventAnalytics(),
      viewQuestionnaireResponses: () => this.viewQuestionnaireResponses(),
      manageRoles: () => this.manageRoles(),
      viewGuestList: () => this.viewGuestList(),
      viewEventPageQr: () => this.viewEventPageQr(),
      viewTapToPay: () => this.viewTapToPay(),
      shareEvent: () => this.shareEvent(),
      cancelEvent: () => this.cancelEvent()
    };
    actions[result.role]?.();
  }

  viewEvent() {
    this.navCtrl.navigateForward(`/event/1111`);
  }

  editEvent() {
    const eventId = this.eventId();
    if (eventId) {
      this.navCtrl.navigateForward(`/event/edit/${eventId}`);
    }
  }

  viewEventAnalytics() {
    const eventId = this.eventId();
    if (eventId) {
      this.navCtrl.navigateForward(`/event/analytics/${eventId}`);
    }
  }

  viewQuestionnaireResponses() {
    const eventId = this.eventId();
    if (eventId) {
      this.navCtrl.navigateForward(`/event/questionnaire-response/${eventId}`);
    }
  }

  async manageRoles() {
    const eventId = this.eventId();
    if (eventId) {
      const result = await this.modalService.openManageRoleModal(this.networkSuggestions, eventId);
    }
  }

  viewGuestList() {
    const eventId = this.eventId();
    if (eventId) {
      this.navCtrl.navigateForward(`/event/guests/${eventId}`);
    }
  }

  viewEventPageQr() {
    const eventId = this.eventId();
    if (eventId) {
      this.navCtrl.navigateForward(`/event/qr/${eventId}`);
    }
  }

  viewTapToPay() {}

  async shareEvent() {
    const eventId = this.eventId();
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
      description: 'Are you sure you want to cancel this event? We’ll notify everyone that have registered, and issue automatic refunds.',
      confirmButtonLabel: 'Cancel Event',
      cancelButtonLabel: 'Cancel',
      confirmButtonColor: 'danger',
      iconPosition: 'left'
    });
    if (result && result.role === 'confirm') {
      this.toasterService.showSuccess('Event cancelled');
    }
  }

  likeEvent(): void {
    console.log('Like event');
  }

  async reportEvent() {
    const result = await this.modalService.openReportModal('Event');
    if (!result) return;
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
  }

  ngOnDestroy(): void {
    // Cleanup is handled by EventDisplay component
  }
}
