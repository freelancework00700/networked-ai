import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { Button } from '@/components/form/button';
import { ActivatedRoute } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ModalService } from '@/services/modal.service';
import { EventService } from '@/services/event.service';
import { Searchbar } from '@/components/common/searchbar';
import { ToasterService } from '@/services/toaster.service';
import { EmptyState } from '@/components/common/empty-state';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { NavController, IonIcon } from '@ionic/angular/standalone';
import { IonContent, IonToolbar, IonHeader } from '@ionic/angular/standalone';
import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
@Component({
  selector: 'guest-list',
  styleUrl: './guest-list.scss',
  templateUrl: './guest-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonContent, Button, Searchbar, IonIcon, MenuModule, ButtonModule, EmptyState, NgOptimizedImage]
})
export class GuestList implements OnInit {
  navCtrl = inject(NavController);
  modalService = inject(ModalService);
  route = inject(ActivatedRoute);
  eventService = inject(EventService);
  toasterService = inject(ToasterService);
  
  searchQuery = signal('');
  isDownloading = signal<boolean>(false);
  isLoading = signal<boolean>(true);
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
  
  guestList = computed(() => {
    const event = this.eventData();
    const tickets = event?.tickets || [];
    
    return this.attendees().map((attendee: any) => {
      const name = attendee.parent_user_id ? attendee.name : (attendee.user?.name || attendee.name);
      const imageUrl = attendee.parent_user_id ? undefined : (attendee.user?.thumbnail_url || attendee.user?.image_url);
      
      let ticketType = 'Standard';
      if (attendee.event_ticket_id && tickets.length > 0) {
        const ticket = tickets.find((t: any) => t.id === attendee.event_ticket_id);
        ticketType = ticket?.name || ticket?.ticket_type || 'Standard';
      }
      
      const amountPaid = parseFloat(attendee.amount_paid || '0');
      const paymentStatus = amountPaid > 0 ? 'paid' : 'unpaid';
      
      const paymentMode = attendee.stripe_payment_intent_id ? 'in-app' : 'ots';
      
      const points = attendee.user?.total_gamification_points || 0;
      
      return {
        id: attendee.id,
        name: name,
        value: points,
        ticketType: ticketType,
        paymentStatus: paymentStatus,
        paymentMode: paymentMode,
        checkedIn: attendee.is_checked_in || false,
        imageUrl: imageUrl,
        parent_user_id: attendee.parent_user_id,
        user: attendee.user,
        connection_status: attendee.user?.connection_status
      };
    });
  });

  stats = computed(() => {
    const allAttendees = this.attendees();
    const total = allAttendees.length;
    const attending = allAttendees.filter((a: any) => a.rsvp_status === 'Yes').length;
    const maybe = allAttendees.filter((a: any) => a.rsvp_status === 'Maybe').length;
    const notAttending = allAttendees.filter((a: any) => a.rsvp_status === 'No').length;
    const checkedIn = allAttendees.filter((a: any) => a.is_checked_in === true).length;

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

  items: MenuItem[] = [
    {
      label: 'Check-in Guest',
      command: () => this.checkInGuest(),
      iconPath: 'assets/svg/guest-list/check-in.svg'
    },
    {
      label: 'Issue Refund',
      command: () => this.issueRefund(),
      iconPath: 'assets/svg/guest-list/refund-issue.svg'
    },
    {
      label: 'Add as Network',
      command: () => this.addAsNetwork(),
      iconPath: 'assets/svg/guest-list/add-network.svg'
    },
    {
      label: 'Send Message',
      command: () => this.sendMessage(),
      iconPath: 'assets/svg/guest-list/send-message.svg'
    },
    {
      label: 'Uncheck-in',
      command: () => this.uncheckIn(),
      iconPath: 'assets/svg/guest-list/uncheck-in.svg'
    },
    {
      label: 'Remove Guest',
      command: () => this.removeGuest(),
      iconPath: 'assets/svg/deleteIcon.svg'
    }
  ];

  issueRefund() {
    console.log('Refund');
  }
  checkInGuest() {
    console.log('Check-in Guest');
  }
  addAsNetwork() {
    console.log('Add Network');
  }
  sendMessage() {
    console.log('Message');
  }
  uncheckIn() {
    console.log('Uncheck-in');
  }
  removeGuest() {
    console.log('Remove Guest');
  }

  filteredGuestList = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    const guests = this.guestList();
    if (!search) return guests;

    return guests.filter((s) => s.name.toLowerCase().includes(search));
  });

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.eventId.set(eventId);
      this.loadAttendees();
    }
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
      this.toasterService.showError('Failed to load guest list');
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
}
