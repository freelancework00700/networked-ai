import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { TicketDisplay } from '@/interfaces/event';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { IonHeader, IonFooter, IonToolbar, IonIcon, ModalController, IonContent } from '@ionic/angular/standalone';
import { Input, signal, inject, Component, computed, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'rsvp-modal',
  styleUrl: './rsvp-modal.scss',
  templateUrl: './rsvp-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, IonFooter, IonToolbar, IonHeader, CommonModule, Button, IonIcon]
})
export class RsvpModal implements OnInit, OnDestroy {
  @Input() tickets: TicketDisplay[] = [];
  @Input() eventTitle: string = 'Atlanta Makes Me Laugh';
  @Input() subscriptionId: string = '';
  @Input() questionnaire: any = null;
  @Input() promo_codes: any[] = [];
  @Input() eventDate: string = '';
  @Input() eventLocation: string = '';

  modalCtrl = inject(ModalController);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);

  promoCode = signal<string>('');
  discountAmount = signal<number>(0);
  appliedPromoCode = signal<any>(null);
  ticketsData = signal<TicketDisplay[]>([]);
  questionnaireResult = signal<any>(null);
  currentTime = signal<Date>(new Date());
  private countdownInterval?: any;

  isLoggedIn = computed(() => !!this.authService.currentUser());
  hasQuestionnaire = computed(() => {
    return this.questionnaire !== null && this.questionnaire !== undefined && Array.isArray(this.questionnaire) && this.questionnaire.length > 0;
  });

  hasSubscription = computed(() => {
    return this.subscriptionId !== '' && this.subscriptionId !== undefined;
  });

  hasPaidTickets = computed(() => {
    return this.ticketsData().some((ticket) => {
      const quantity = ticket.selectedQuantity ?? 0;
      const price = parseFloat(String(ticket.price)) || 0;
      const status = this.getTicketStatus(ticket);
      return quantity > 0 && price > 0 && status === 'available';
    });
  });

  hasPromoCodes = computed(() => {
    return this.promo_codes && this.promo_codes.length > 0 && this.hasPaidTickets();
  });

  isPromoCodeApplied = computed(() => {
    return this.appliedPromoCode() !== null;
  });

  subtotalPrice = computed(() => {
    this.currentTime();
    return this.ticketsData().reduce((total, ticket) => {
      const quantity = ticket.selectedQuantity ?? 0;
      const status = this.getTicketStatus(ticket);
      if (quantity > 0 && status === 'available') {
        const price = parseFloat(String(ticket.price)) || 0;
        return total + price * quantity;
      }
      return total;
    }, 0);
  });

  totalPrice = computed(() => {
    const subtotal = this.subtotalPrice();
    const discount = this.discountAmount();
    return Math.max(0, subtotal - discount);
  });

  formattedTotal = computed(() => {
    const total = this.totalPrice();
    if (!total || total === 0) {
      return '';
    }

    return total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  });

  hasSelectedTickets = computed(() => {
    return this.ticketsData().some((ticket) => (ticket.selectedQuantity ?? 0) > 0);
  });

  ngOnInit(): void {
    if (this.tickets && this.tickets.length > 0) {
      const initializedTickets = this.tickets.map((ticket: any) => {
        const saleStartDate = ticket.sales_start_date || ticket.sale_start_date;
        const saleEndDate = ticket.sales_end_date || ticket.sale_end_date;
        const availableQuantity = ticket.available_quantity ?? ticket.remainingQuantity;

        const transformedTicket: TicketDisplay = {
          ...ticket,
          remainingQuantity: availableQuantity,
          selectedQuantity: ticket.selectedQuantity ?? 0,
          sale_start_date: saleStartDate,
          sale_end_date: saleEndDate,
          status: 'available'
        };
        return transformedTicket;
      });
      this.ticketsData.set(initializedTickets);
    } else {
      this.ticketsData.set([]);
    }
    this.startTimeUpdate();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startTimeUpdate(): void {
    this.countdownInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  getTicketStatus = (ticket: TicketDisplay): 'sale-ended' | 'available' | 'sold-out' | 'upcoming' => {
    this.currentTime();
    const now = this.currentTime();
    const saleStartDate = ticket.sale_start_date;
    const saleEndDate = ticket.sale_end_date;
    const availableQuantity = ticket.remainingQuantity;

    if (availableQuantity !== null && availableQuantity !== undefined && availableQuantity <= 0) {
      return 'sold-out';
    }

    if (saleEndDate) {
      const endDate = new Date(saleEndDate);
      if (now > endDate) {
        return 'sale-ended';
      }
    }

    if (saleStartDate) {
      const startDate = new Date(saleStartDate);
      if (now < startDate) {
        return 'upcoming';
      }
    }

    return 'available';
  };

  getTicketCountdown = (ticket: TicketDisplay): string => {
    this.currentTime();
    const saleStartDate = ticket.sale_start_date;
    if (!saleStartDate) return '';

    const now = this.currentTime();
    const startDate = new Date(saleStartDate);
    const diff = startDate.getTime() - now.getTime();

    if (diff <= 0) return '';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const parts: string[] = [];
    if (days > 0) {
      parts.push(`${days}d`);
    }
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0 && days === 0) {
      parts.push(`${minutes} min`);
    }
    if (seconds > 0 && days === 0 && hours === 0) {
      parts.push(`${seconds} sec`);
    }

    return parts.length > 0 ? parts.join(' ') : '0 sec';
  };

  getTicketChipImage(ticketType: string): string {
    switch (ticketType) {
      case 'Early Bird':
        return 'assets/svg/ticket/early-bird-card-chip.svg';
      case 'Sponsor':
        return 'assets/svg/ticket/sponsor-card-chip.svg';
      case 'Free':
        return 'assets/svg/ticket/free-card-chip.svg';
      default:
        return 'assets/svg/ticket/standard-card-chip.svg';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'sale-ended':
        return 'border border-surface-300 ';
      case 'sold-out':
        return 'border accent-red ';
      case 'upcoming':
        return 'border border-surface-300 ';
      default:
        return '';
    }
  }

  getStatusIconClass(status: string): string {
    switch (status) {
      case 'sale-ended':
        return 'neutral-02';
      case 'sold-out':
        return 'accent-red';
      case 'upcoming':
        return 'neutral-02';
      default:
        return 'neutral-02';
    }
  }

  getStatusText(ticket: TicketDisplay): string {
    const status = this.getTicketStatus(ticket);
    switch (status) {
      case 'sale-ended':
        return 'Sale Ended';
      case 'sold-out':
        return 'Sold Out';
      case 'upcoming':
        const countdown = this.getTicketCountdown(ticket);
        return countdown ? `Starts in ${countdown}` : 'Upcoming';
      default:
        return '';
    }
  }

  formatPrice(price: string): string {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;
    return numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  canDecrement(ticket: TicketDisplay): boolean {
    return (ticket.selectedQuantity ?? 0) > 0;
  }

  canIncrement(ticket: TicketDisplay): boolean {
    const status = this.getTicketStatus(ticket);
    if (status !== 'available') return false;
    if (ticket.remainingQuantity !== undefined) {
      return (ticket.selectedQuantity ?? 0) < ticket.remainingQuantity;
    }
    return true;
  }

  decrementQuantity(ticket: TicketDisplay): void {
    if (!this.canDecrement(ticket)) return;
    const tickets = this.ticketsData();
    const index = tickets.findIndex((t) => t.id === ticket.id);
    if (index !== -1) {
      const updatedTickets = [...tickets];
      updatedTickets[index] = {
        ...updatedTickets[index],
        selectedQuantity: (updatedTickets[index].selectedQuantity ?? 0) - 1
      };
      this.ticketsData.set(updatedTickets);
    }
  }

  incrementQuantity(ticket: TicketDisplay): void {
    if (!this.canIncrement(ticket)) return;
    const tickets = this.ticketsData();
    const index = tickets.findIndex((t) => t.id === ticket.id);
    if (index !== -1) {
      const updatedTickets = [...tickets];
      updatedTickets[index] = {
        ...updatedTickets[index],
        selectedQuantity: (updatedTickets[index].selectedQuantity ?? 0) + 1
      };
      this.ticketsData.set(updatedTickets);
    }
  }

  onPromoCodeChange(value: string): void {
    const upperValue = value.toUpperCase();
    this.promoCode.set(upperValue);
    if (this.appliedPromoCode()) {
      this.appliedPromoCode.set(null);
      this.discountAmount.set(0);
    }
  }

  async applyPromoCode(): Promise<void> {
    const code = this.promoCode().trim().toUpperCase();
    if (!code) return;

    const foundPromo = this.promo_codes.find((promo) => {
      const promoCodeValue = promo.promo_code || promo.promoCode;
      return promoCodeValue?.toUpperCase() === code;
    });

    if (!foundPromo) {
      console.error('Invalid promo code');
      return;
    }

    const subtotal = this.subtotalPrice();
    let discount = 0;

    const promoType = foundPromo.type || foundPromo.promotion_type;
    const promoValue = foundPromo.value || foundPromo.promoPresent;

    if (promoType === 'Percentage' || promoType === 'percentage') {
      const percentage = Number(promoValue) || 0;
      discount = (subtotal * percentage) / 100;

      if (foundPromo.capped_amount) {
        const cap = parseFloat(String(foundPromo.capped_amount));
        discount = Math.min(discount, cap);
      }
    } else if (promoType === 'Fixed' || promoType === 'fixed') {
      discount = Number(promoValue) || 0;
    }

    const normalizedPromo = {
      ...foundPromo,
      promoCode: foundPromo.promo_code || foundPromo.promoCode,
      promotion_type: promoType,
      value: promoValue
    };

    this.appliedPromoCode.set(normalizedPromo);
    this.discountAmount.set(discount);
  }

  async dismiss(): Promise<void> {
    const selectedTickets = this.ticketsData().filter((t) => (t.selectedQuantity ?? 0) > 0);

    if (!this.isLoggedIn()) {
      await this.modalService.openSignupModal();
      return;
    }
    const rsvpData = {
      tickets: selectedTickets,
      promoCode: this.appliedPromoCode()?.promoCode || this.promoCode(),
      appliedPromoCode: this.appliedPromoCode(),
      discountAmount: this.discountAmount(),
      subtotal: this.subtotalPrice(),
      total: this.totalPrice()
    };

    let rsvpConfirmData: unknown = null;
    if (this.hasQuestionnaire() && this.questionnaire && this.questionnaire.length > 0 && !this.questionnaireResult()) {
      this.questionnaireResult.set(
        await this.modalService.openQuestionnairePreviewModal(
          this.questionnaire,
          false,
          rsvpData,
          this.eventTitle,
          this.eventDate,
          this.eventLocation,
          this.subscriptionId
        )
      );

      if (!this.questionnaireResult()) {
        return;
      }

      rsvpConfirmData = await this.modalService.openRsvpDetailsModal(
        this.eventTitle,
        this.eventDate,
        this.eventLocation,
        rsvpData,
        this.subscriptionId
      );
    } else {
      rsvpConfirmData = await this.modalService.openRsvpDetailsModal(
        this.eventTitle,
        this.eventDate,
        this.eventLocation,
        rsvpData,
        this.subscriptionId
      );
    }

    if (!rsvpConfirmData) {
      return;
    }
    await this.modalCtrl.dismiss(rsvpConfirmData);
  }

  close(): void {
    this.modalCtrl.dismiss();
    this.modalService.close();
  }
}
