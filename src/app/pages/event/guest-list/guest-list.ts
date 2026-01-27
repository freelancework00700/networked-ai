import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { EventService } from '@/services/event.service';
import { SocketService } from '@/services/socket.service';
import { Searchbar } from '@/components/common/searchbar';
import { NetworkService } from '@/services/network.service';
import { PopoverService } from '@/services/popover.service';
import { ToasterService } from '@/services/toaster.service';
import { EmptyState } from '@/components/common/empty-state';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { NavigationService } from '@/services/navigation.service';
import { NetworkConnectionUpdate } from '@/interfaces/socket-events';
import { NavController, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { IonContent, IonToolbar, IonHeader } from '@ionic/angular/standalone';
import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';

@Component({
  selector: 'guest-list',
  styleUrl: './guest-list.scss',
  templateUrl: './guest-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonSpinner, IonHeader, IonToolbar, IonContent, Searchbar, IonIcon, ButtonModule, EmptyState, NgOptimizedImage]
})
export class GuestList implements OnInit {
  private popoverService = inject(PopoverService);

  navCtrl = inject(NavController);
  modalService = inject(ModalService);
  route = inject(ActivatedRoute);
  eventService = inject(EventService);
  authService = inject(AuthService);
  toasterService = inject(ToasterService);
  networkService = inject(NetworkService);
  navigationService = inject(NavigationService);
  private socketService = inject(SocketService);

  selectedGuestId = signal<string>('');
  selectedGuest = signal<any>('');
  searchQuery = signal('');
  isDownloading = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isChecking = signal<boolean>(false);
  eventId = signal<string | null>(null);
  eventData = signal<any>(null);

  filter = signal<any>({
    attending: false,
    maybe: false,
    notAttending: true,
    checkedIn: true,
    notCheckedIn: true,
    myNetwork: false,
    notMyNetwork: true,
    inApp: true,
    onTheSpot: false,
    earlyBird: false,
    standard: false,
    premium: true,
    sponsor: true
  });

  attendees = signal<any[]>([]);
  menuItems: MenuItem[] = [];

  stats = computed(() => {
    const allAttendees = this.attendees();
    const total = allAttendees.length;
    const attending = allAttendees.filter((a: any) => a.rsvp_status === 'Yes').length;
    const maybe = allAttendees.filter((a: any) => a.rsvp_status === 'Maybe').length;
    const notAttending = allAttendees.filter((a: any) => a.rsvp_status === 'No').length;

    return [
      {
        key: 'total',
        label: 'Total',
        value: total,
        class: 'stat-total'
      },
      {
        key: 'attending',
        label: 'Attending',
        value: attending,
        class: 'stat-attending'
      },
      {
        key: 'maybe',
        label: 'Maybe',
        value: maybe,
        class: 'stat-maybe'
      },
      {
        key: 'not',
        label: 'Not',
        value: notAttending,
        class: 'stat-not'
      }
    ];
  });

  checkedInCount = computed(() => {
    return this.attendees().filter((a: any) => a.is_checked_in === true).length;
  });

  getMenuItems(guest: any): MenuItem[] {
    const items: MenuItem[] = [];
    // Only show for guests without parent_user_id
    if (guest?.parent_user_id == null) {
      // Add as Network → only if not connected
      if (guest.user?.connection_status === 'NotConnected') {
        items.push({
          label: 'Add as Network',
          command: () => this.addAsNetwork(),
          iconPath: 'assets/svg/guest-list/add-network.svg'
        });
      }

      // Send Message → only if connected
      if (guest.user?.connection_status === 'Connected') {
        items.push({
          label: 'Send Message',
          command: () => this.sendMessage(),
          iconPath: 'assets/svg/guest-list/send-message.svg'
        });
      }
    }

    // Uncheck-in → only if checked in
    if (guest.is_checked_in) {
      items.push({
        label: 'Uncheck-in',
        command: () => this.uncheckIn(),
        iconPath: 'assets/svg/guest-list/uncheck-in.svg'
      });
    }

    // Remove Guest → always available
    items.push({
      label: 'Remove Guest',
      command: () => this.removeGuest(),
      iconPath: 'assets/svg/deleteIcon.svg'
    });

    return items;
  }

  issueRefund() {
    console.log('Refund');
  }

  checkInGuest() {
    console.log('Check-in Guest');
  }

  openPopover(event: Event, user: any): void {
    this.popoverService.openCommonPopover(event, this.getMenuItems(user));
    this.selectedGuest.set(user);
    this.selectedGuestId.set(user.id);
  }

  async addAsNetwork(): Promise<void> {
    this.closePopover();
    this.isChecking.set(true);
    const guestId = this.selectedGuest().user.id;
    if (!guestId) return;

    try {
      await this.networkService.sendNetworkRequest(guestId);
      this.toasterService.showSuccess('Network request sent successfully');
    } catch (error) {
      console.error('Error sending network request:', error);
      this.toasterService.showError('Failed to send network request');
    } finally {
      this.isChecking.set(false);
    }
  }

  sendMessage() {
    this.closePopover();

    const guestId = this.selectedGuest().user.id;
    if (!guestId) return;
    const currentUserId = this.authService.currentUser()?.id;
    if (currentUserId && guestId) {
      this.navCtrl.navigateForward('/chat-room', {
        state: {
          user_ids: [currentUserId, guestId],
          is_personal: true
        }
      });
    }
  }

  async removeGuest() {
    this.closePopover();

    this.isChecking.set(true);
    const guestId = this.selectedGuestId();
    if (!guestId) return;

    try {
      await this.eventService.deleteAttendees(guestId);
      this.attendees.update((list) => list.filter((a) => a.id !== guestId));
      this.toasterService.showSuccess('guest remove successfully.');
    } catch (error) {
      console.error(error);
      this.toasterService.showError('Failed to remove guest.');
    } finally {
      this.isChecking.set(false);
    }
  }

  filteredGuestList = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    const guests = this.attendees();
    if (!search) return guests;
    return guests.filter((s) => s.name.toLowerCase().includes(search));
  });

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.eventId.set(eventId);
      this.loadAttendees();
    }
    this.setupNetworkConnectionListener();
  }

  async loadAttendees(): Promise<void> {
    const eventId = this.eventId();
    if (!eventId) return;

    try {
      this.isLoading.set(true);
      const eventData = await this.eventService.getEventById(eventId);
      if (eventData) {
        this.eventData.set(eventData);
        if (eventData.attendees) {
          this.attendees.set(eventData.attendees);
        }
      }
    } catch (error) {
      console.error('Error loading attendees:', error);
      this.toasterService.showError('Failed to load guest list.');
    } finally {
      this.isLoading.set(false);
    }
  }

  getImageUrl(imageUrl?: string): string {
    return getImageUrlOrDefault(imageUrl || '');
  }

  onImageError(event: Event): void {
    onImageError(event);
  }

  getDiamondPath(points: number) {
    if (points >= 50000) {
      return '/assets/svg/gamification/diamond-50k.svg';
    } else if (points >= 40000) {
      return '/assets/svg/gamification/diamond-40k.svg';
    } else if (points >= 30000) {
      return '/assets/svg/gamification/diamond-30k.svg';
    } else if (points >= 20000) {
      return '/assets/svg/gamification/diamond-20k.svg';
    } else if (points >= 10000) {
      return '/assets/svg/gamification/diamond-10k.svg';
    } else if (points >= 5000) {
      return '/assets/svg/gamification/diamond-5k.svg';
    } else {
      return '/assets/svg/gamification/diamond-1k.svg';
    }
  }

  back() {
    this.navCtrl.back();
  }

  downloadGuestList() {
    this.isDownloading.set(true);
    setTimeout(() => {
      this.isDownloading.set(false);
    }, 2000);
  }

  async openFilterModal() {
    const result = await this.modalService.openGuestFilterModal(this.filter());
    if (result) this.filter.set(result);
  }

  async checkIn(id: string) {
    try {
      this.selectedGuestId.set(id);
      this.isChecking.set(true);
      let payload = {
        event_id: this.eventData().id,
        attendee_id: id,
        is_checked_in: true
      };
      await this.eventService.changeCheckInStatus(payload);
      this.attendees.update((list) => list.map((a) => (a.id === id ? { ...a, is_checked_in: true } : a)));
      this.toasterService.showSuccess('Check-in successfully');
    } catch (error) {
      console.error(error);
      this.toasterService.showError('Failed to check in');
    } finally {
      this.isChecking.set(false);
    }
  }

  async uncheckIn() {
    this.closePopover();

    this.isChecking.set(true);
    const guestId = this.selectedGuestId();
    if (!guestId) return;
    try {
      this.selectedGuestId.set(guestId);
      this.isChecking.set(true);
      let payload = {
        event_id: this.eventData().id,
        attendee_id: guestId,
        is_checked_in: false
      };
      await this.eventService.changeCheckInStatus(payload);
      this.attendees.update((list) => list.map((a) => (a.id === guestId ? { ...a, is_checked_in: false } : a)));
      this.toasterService.showSuccess('Check-in successfully');
    } catch (error) {
      console.error(error);
      this.toasterService.showError('Failed to check in');
    } finally {
      this.isChecking.set(false);
    }
  }

  onCardClick(user: any) {
    if (user?.parent_user_id) {
      return;
    }
    const username = user?.user?.username;
    if (username) {
      this.navigationService.navigateForward(`/${username}`);
    }
  }

  private setupNetworkConnectionListener(): void {
    this.socketService.onAfterRegistration(() => {
      this.socketService.on('network:connection:update', this.networkConnectionHandler);
    });
  }

  private networkConnectionHandler = (payload: NetworkConnectionUpdate) => {
    if (!payload?.id) return;

    const userId = payload.id;
    const newStatus = payload.connection_status;

    this.attendees.update((users) =>
      users.map((attendee) =>
        attendee.user?.id === userId
          ? {
              ...attendee,
              user: {
                ...attendee.user,
                connection_status: newStatus
              }
            }
          : attendee
      )
    );
  };

  ngOnDestroy(): void {
    this.socketService.off('network:connection:update', this.networkConnectionHandler);
  }

  closePopover(): void {
    this.popoverService.close();
  }
}
