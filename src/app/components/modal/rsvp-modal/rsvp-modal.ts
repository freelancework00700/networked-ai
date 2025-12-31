import { Ticket } from '@/interfaces/event';
import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { Input, signal, inject, Component, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { IonHeader, IonFooter, IonToolbar, IonIcon, ModalController, IonContent } from '@ionic/angular/standalone';

export interface TicketDisplay extends Ticket {
  status: 'sale-ended' | 'available' | 'sold-out' | 'upcoming';
  remainingQuantity?: number;
  selectedQuantity?: number;
  startsIn?: string;
}

@Component({
  selector: 'rsvp-modal',
  styleUrl: './rsvp-modal.scss',
  templateUrl: './rsvp-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, IonFooter, IonToolbar, IonHeader, CommonModule, Button, IonIcon]
})
export class RsvpModal implements OnInit {
  @Input() tickets: TicketDisplay[] = [];
  @Input() eventTitle: string = 'Atlanta Makes Me Laugh';
  @Input() subscriptionId: string = '';
  @Input() questionnaire: any = null;
  @Input() promoCodes: any[] = [];
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

  isLoggedIn = computed(() => !!this.authService.currentUser());
  hasQuestionnaire = computed(() => {
    return this.questionnaire !== null && this.questionnaire !== undefined && Array.isArray(this.questionnaire) && this.questionnaire.length > 0;
  });

  hasSubscription = computed(() => {
    return this.subscriptionId !== '' && this.subscriptionId !== undefined;
  });

  hasPromoCodes = computed(() => {
    return this.promoCodes && this.promoCodes.length > 0;
  });

  isPromoCodeApplied = computed(() => {
    return this.appliedPromoCode() !== null;
  });

  subtotalPrice = computed(() => {
    return this.ticketsData().reduce((total, ticket) => {
      const quantity = ticket.selectedQuantity ?? 0;
      if (quantity > 0 && ticket.status === 'available') {
        const price = parseFloat(ticket.price) || 0;
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
    return this.totalPrice().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });

  hasSelectedTickets = computed(() => {
    return this.ticketsData().some((ticket) => (ticket.selectedQuantity ?? 0) > 0);
  });

  ngOnInit(): void {
    if (this.tickets && this.tickets.length > 0) {
      const initializedTickets = this.tickets.map((ticket) => ({
        ...ticket,
        selectedQuantity: ticket.selectedQuantity ?? 0
      }));
      this.ticketsData.set(initializedTickets);
    } else {
      this.ticketsData.set([]);
    }
  }

  getTicketChipImage(ticketType: string): string {
    switch (ticketType) {
      case 'early-bird':
        return 'assets/svg/ticket/early-bird-card-chip.svg';
      case 'sponsor':
        return 'assets/svg/ticket/sponsor-card-chip.svg';
      case 'free':
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
    switch (ticket.status) {
      case 'sale-ended':
        return 'Sale Ended';
      case 'sold-out':
        return 'Sold Out';
      case 'upcoming':
        return `Starts in ${ticket.startsIn || ''}`;
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
    if (ticket.status !== 'available') return false;
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
    this.promoCode.set(value);
    if (this.appliedPromoCode()) {
      this.appliedPromoCode.set(null);
      this.discountAmount.set(0);
    }
  }

  async applyPromoCode(): Promise<void> {
    const code = this.promoCode().trim().toUpperCase();
    if (!code) return;

    const foundPromo = this.promoCodes.find((promo) => promo.promoCode.toUpperCase() === code);

    if (!foundPromo) {
      console.error('Invalid promo code');
      return;
    }

    const subtotal = this.subtotalPrice();
    let discount = 0;

    if (foundPromo.promotion_type === 'percentage') {
      const percentage = parseFloat(foundPromo.promoPresent) || 0;
      discount = (subtotal * percentage) / 100;

      if (foundPromo.capped_amount) {
        const cap = parseFloat(foundPromo.capped_amount);
        discount = Math.min(discount, cap);
      }
    } else if (foundPromo.promotion_type === 'fixed') {
      discount = parseFloat(foundPromo.promoPresent) || 0;
    }

    this.appliedPromoCode.set(foundPromo);
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
