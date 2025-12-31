import {
  inject,
  signal,
  Inject,
  computed,
  DOCUMENT,
  Component,
  viewChild,
  OnDestroy,
  ElementRef,
  PLATFORM_ID,
  AfterViewInit,
  ChangeDetectionStrategy
} from '@angular/core';
import Swiper from 'swiper';
import { MenuModule } from 'primeng/menu';
import * as Maptiler from '@maptiler/sdk';
import { IUser } from '@/interfaces/IUser';
import { Ticket } from '@/interfaces/event';
import { Pagination } from 'swiper/modules';
import { FormsModule } from '@angular/forms';
import { Button } from '@/components/form/button';
import { isPlatformBrowser } from '@angular/common';
import { ModalService } from '@/services/modal.service';
import { MenuItem as PrimeMenuItem } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { ToasterService } from '@/services/toaster.service';
import { NavigationService } from '@/services/navigation.service';
import { MenuItem } from '@/components/modal/menu-modal/menu-modal';
import { AvatarGroupComponent } from '@/components/common/avatar-group';
import { RsvpDetailsModal } from '@/components/modal/rsvp-details-modal';
import { HostEventPromoCard } from '@/components/card/host-event-promo-card';
import { SegmentButton, SegmentButtonItem } from '@/components/common/segment-button';
import { IonContent, IonFooter, IonToolbar, IonHeader, IonIcon, NavController } from '@ionic/angular/standalone';

export interface TicketDisplay extends Ticket {
  status: 'sale-ended' | 'available' | 'sold-out' | 'upcoming';
  remainingQuantity?: number;
  selectedQuantity?: number;
  startsIn?: string;
}

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
    MenuModule,
    FormsModule,
    SegmentButton,
    HostEventPromoCard,
    AvatarGroupComponent
  ]
})
export class Event implements AfterViewInit, OnDestroy {
  isScrolled = signal(false);
  selectedDate = signal('10/01');
  mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private toasterService = inject(ToasterService);
  private platformId = inject(PLATFORM_ID);
  @Inject(DOCUMENT) private document = inject(DOCUMENT);
  navCtrl = inject(NavController);
  modalService = inject(ModalService);
  navigationService = inject(NavigationService);
  private map: Maptiler.Map | null = null;
  private marker: Maptiler.Marker | null = null;
  subscriptionId = signal<string>('test_id');
  subscriptionPlanType = signal<'event' | 'sponsor'>('event');
  private readonly DEFAULT_ZOOM = 14;
  private readonly DEFAULT_CENTER: [number, number] = [-84.390648, 33.748533]; // Atlanta, GA coordinates
  hosts = signal<IUser[]>([
    { id: '1', name: 'Amy Elsner', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
    { id: '2', name: 'Asiya Javayant', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png' },
    { id: '3', name: 'Onyama Limba', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png' }
  ]);
  sponsors = signal<IUser[]>([
    { id: '1', name: 'Ioni Bowcher', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png' },
    { id: '2', name: 'Xuxue Feng', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/xuxuefeng.png' },
    { id: '3', name: 'Amy Elsner', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
    { id: '4', name: 'Asiya Javayant', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png' },
    { id: '5', name: 'Onyama Limba', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png' }
  ]);
  speakers = signal<IUser[]>([
    { id: '11', name: 'Amy Elsner', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
    { id: '12', name: 'Asiya Javayant', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png' },
    { id: '13', name: 'Onyama Limba', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png' },
    { id: '14', name: 'Ioni Bowcher', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png' },
    { id: '15', name: 'Xuxue Feng', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/xuxuefeng.png' },
    { id: '16', name: 'Amy Elsner', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
    { id: '17', name: 'Asiya Javayant', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png' }
  ]);
  going = signal<IUser[]>([
    { id: '1', name: 'Onyama Limba', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png' },
    { id: '2', name: 'Ioni Bowcher', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png' },
    { id: '3', name: 'Xuxue Feng', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/xuxuefeng.png' },
    { id: '4', name: 'Amy Elsner', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
    { id: '5', name: 'Asiya Javayant', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png' },
    { id: '6', name: 'Onyama Limba', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png' },
    { id: '7', name: 'Onyama Limba', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png' },
    { id: '8', name: 'Ioni Bowcher', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png' },
    { id: '9', name: 'Xuxue Feng', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/xuxuefeng.png' }
  ]);
  maybe = signal<IUser[]>([
    { id: '1', name: 'Ioni Bowcher', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png' },
    { id: '2', name: 'Xuxue Feng', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/xuxuefeng.png' },
    { id: '3', name: 'Amy Elsner', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
    { id: '4', name: 'Asiya Javayant', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png' },
    { id: '5', name: 'Onyama Limba', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png' },
    { id: '6', name: 'Ioni Bowcher', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png' },
    { id: '7', name: 'Xuxue Feng', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/xuxuefeng.png' },
    { id: '8', name: 'Amy Elsner', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
    { id: '9', name: 'Asiya Javayant', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png' },
    { id: '10', name: 'Onyama Limba', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png' },
    { id: '11', name: 'Asiya Javayant', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png' },
    { id: '12', name: 'Onyama Limba', image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png' }
  ]);

  userSections = computed(() => [
    { title: 'Host(s)', users: this.hosts(), overflowLabelClass: '' },
    { title: 'Sponsors', users: this.sponsors(), overflowLabelClass: '!bg-neutral-02 !text-neutral-07' },
    { title: 'Speaker(s)', users: this.speakers(), overflowLabelClass: '' },
    { title: 'Going', users: this.going(), overflowLabelClass: '' },
    { title: 'Maybe', users: this.maybe(), overflowLabelClass: '' }
  ]);

  dateItems = computed<SegmentButtonItem[]>(() => [
    { value: '09/24', label: '09/24', icon: 'assets/svg/calendar.svg', activeIcon: 'assets/svg/calendar-selected.svg' },
    { value: '10/01', label: '10/01', icon: 'assets/svg/calendar.svg', activeIcon: 'assets/svg/calendar-selected.svg' },
    { value: '10/08', label: '10/08', icon: 'assets/svg/calendar.svg', activeIcon: 'assets/svg/calendar-selected.svg' },
    { value: '10/15', label: '10/15', icon: 'assets/svg/calendar.svg', activeIcon: 'assets/svg/calendar-selected.svg' }
  ]);

  tickets = signal<TicketDisplay[]>([
    {
      id: '1',
      name: 'Standard Ticket',
      ticket_type: 'standard',
      is_free_ticket: true,
      price: '0.00',
      quantity: 20,
      remainingQuantity: 20,
      selectedQuantity: 0,
      description: 'Insert one or two lines of the description here.',
      status: 'available'
    },
    {
      id: '2',
      name: 'Presale 1',
      ticket_type: 'early-bird',
      is_free_ticket: false,
      price: '5.00',
      quantity: 0,
      description: 'Insert one or two lines of the description here.',
      status: 'sale-ended'
    },
    {
      id: '3',
      name: 'Presale 1',
      ticket_type: 'early-bird',
      is_free_ticket: false,
      price: '5.00',
      quantity: 10,
      remainingQuantity: 10,
      selectedQuantity: 0,
      description: 'Insert one or two lines of the description here.',
      status: 'available'
    },
    {
      id: '4',
      name: 'Presale 3',
      ticket_type: 'early-bird',
      is_free_ticket: false,
      price: '5.00',
      quantity: 0,
      description: 'Insert one or two lines of the description here.',
      status: 'sold-out'
    },
    {
      id: '5',
      name: 'Standard Ticket',
      ticket_type: 'standard',
      is_free_ticket: false,
      price: '10.00',
      quantity: 0,
      description: 'Insert one or two lines of the description here.',
      status: 'sold-out'
    },
    {
      id: '6',
      name: 'Standard Ticket',
      ticket_type: 'standard',
      is_free_ticket: false,
      price: '30.00',
      quantity: null,
      description: 'Insert one or two lines of the description here.',
      startsIn: '3d',
      status: 'upcoming'
    },
    {
      id: '7',
      name: 'VVIP Sponsorship',
      ticket_type: 'sponsor',
      is_free_ticket: false,
      price: '1999.00',
      quantity: null,
      selectedQuantity: 0,
      description: 'Insert one or two lines of the description here.',
      status: 'available'
    },
    {
      id: '8',
      name: 'VVIP Sponsorship',
      ticket_type: 'sponsor',
      is_free_ticket: false,
      price: '1999.00',
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
    { id: '1', name: 'Kathryn Murphy', role: 'staff' },
    { id: '2', name: 'Esther Howard' },
    { id: '3', name: 'Arlene McCoy' },
    { id: '4', name: 'Darlene Robertson', role: 'speaker' },
    { id: '5', name: 'Ronald Richards', role: 'sponsor' },
    { id: '6', name: 'Albert Flores' }
  ];

  eventMenuItems: PrimeMenuItem[] = [
    {
      label: 'Report',
      icon: 'pi pi-flag',
      command: () => this.reportEvent()
    }
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

  onDateChange(date: string): void {
    this.selectedDate.set(date);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      new Swiper('.swiper-event-detail', {
        modules: [Pagination],
        slidesPerView: 1,
        spaceBetween: 0,
        allowTouchMove: true,
        pagination: {
          el: '.swiper-event-detail .swiper-pagination',
          clickable: true
        }
      });

      this.initMap();
    }
  }

  initMap(): void {
    if (!this.DEFAULT_CENTER) return;

    Maptiler.config.apiKey = environment.maptilerApiKey;

    const map = new Maptiler.Map({
      container: this.mapContainer().nativeElement,
      style: Maptiler.MapStyle.STREETS,
      center: this.DEFAULT_CENTER,
      zoom: 15
    });

    map.on('load', () => {
      map.resize();
      new Maptiler.Marker({ color: '#D33' }).setLngLat(this.DEFAULT_CENTER).addTo(map);
    });
  }

  private cleanup(): void {
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.isScrolled.set(scrollTop > 100);
  }

  openUserList(title: string, users: IUser[]): void {
    this.navigationService.navigateForward(`/event/1111/guests`, true);
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
    this.navCtrl.navigateForward(`/event/edit`);
  }

  viewEventAnalytics() {
    this.navCtrl.navigateForward(`/event/analytics/1111`);
  }

  viewQuestionnaireResponses() {
    this.navCtrl.navigateForward(`/event/questionnaire-response/1111`);
  }

  async manageRoles() {
    const result = await this.modalService.openManageRoleModal(this.networkSuggestions, '1111');
  }

  viewGuestList() {
    this.navCtrl.navigateForward(`/event/guests/1111`);
  }

  viewEventPageQr() {
    this.navCtrl.navigateForward(`/event/qr/1111`);
  }

  viewTapToPay() {}

  async shareEvent() {
    const result = await this.modalService.openShareModal('1111', 'Event');
    if (result) {
      this.toasterService.showSuccess('Event shared');
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
    this.cleanup();
  }
}
