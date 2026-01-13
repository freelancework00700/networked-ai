import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { TicketDisplay } from '@/interfaces/event';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { IonHeader, IonFooter, IonToolbar, IonIcon, ModalController, IonContent } from '@ionic/angular/standalone';
import { Input, signal, inject, OnInit, effect, computed, Component, OnDestroy, untracked, ChangeDetectionStrategy } from '@angular/core';

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
  @Input() eventId: string = '';
  @Input() subscriptionId: string = '';
  @Input() questionnaire: any = null;
  @Input() promo_codes: any[] = [];
  @Input() eventDate: string = '';
  @Input() eventLocation: string = '';
  @Input() hostPaysFees: boolean = false;
  @Input() additionalFees: string | number | null = null;
  @Input() maxAttendeesPerUser: number = 0;
  @Input() hostName: string = 'Networked AI';
  @Input() planIds: string[] = [];

  modalCtrl = inject(ModalController);
  authService = inject(AuthService);
  modalService = inject(ModalService);

  promoCode = signal<string>('');
  promoInput = signal<string>('');
  discountAmount = signal<number>(0);
  appliedPromoCode = signal<any>(null);
  promoValidation = signal<{
    isValid: boolean;
    message: string;
    discountAmount: number;
    cappedAmount?: number;
    redemptionLimit?: number;
    maxUsePerUser?: number;
    currentRedemptions?: number;
    userRedemptions?: number;
    eligibleTicketCount?: number;
  }>({
    isValid: false,
    message: '',
    discountAmount: 0
  });
  ticketsData = signal<TicketDisplay[]>([]);
  questionnaireResult = signal<any>(null);
  currentTime = signal<Date>(new Date());
  countdownInterval?: any;
  attendees = signal<any[]>([]);

  // Tier-specific calculation signals (in cents)
  totalsByTier = signal<{ [key: string]: number }>({});
  platformFeesByTier = signal<{ [key: string]: number }>({});
  hostFeesByTier = signal<{ [key: string]: number }>({});
  ticketPricesByTier = signal<{ [key: string]: number }>({});
  actualPricesByTier = signal<{ [key: string]: number }>({});
  discountAmountsByTier = signal<{ [key: string]: number }>({});

  isLoggedIn = computed(() => !!this.authService.currentUser());
  hasQuestionnaire = computed(() => {
    return this.questionnaire !== null && this.questionnaire !== undefined && Array.isArray(this.questionnaire) && this.questionnaire.length > 0;
  });

  hasSubscription = computed(() => {
    const hasPlanIds = this.planIds && this.planIds.length > 0;
    return hasPlanIds;
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

  isApplyButtonDisabled = computed(() => {
    const input = this.promoInput();
    return !input || input.trim().length === 0;
  });

  isPromoCodeApplied = computed(() => {
    return this.appliedPromoCode() !== null;
  });

  subtotalPrice = computed(() => {
    const totalInCents = Object.values(this.ticketPricesByTier()).reduce((sum, tierPrice) => sum + tierPrice, 0);
    return totalInCents / 100;
  });

  hostFeesTotal = computed(() => {
    const totalInCents = Object.values(this.hostFeesByTier()).reduce((sum, fee) => sum + fee, 0);
    return totalInCents / 100;
  });

  subtotalAfterHostFees = computed(() => {
    return this.subtotalPrice() + this.hostFeesTotal();
  });

  calculationEffect = effect(() => {
    const tickets = this.ticketsData();
    if (!tickets || tickets.length === 0) {
      return;
    }

    this.hostPaysFees;
    this.additionalFees;
    this.calculateAmountsForAllTiers();

    untracked(() => {
      const selectedTickets = tickets.filter((t) => (t.selectedQuantity ?? 0) > 0);
      const currentAttendees = this.attendees();

      if (selectedTickets.length === 0) {
        this.attendees.set([]);
      } else if (currentAttendees.length === 0) {
        this.rebuildAttendees();
      } else {
        this.updateAttendeeFees();
      }

      const promoCodeValue = this.normalizedPromoCode();

      if (!promoCodeValue) return;

      const appliedPromo = this.appliedPromoCode();
      if (appliedPromo) {
        this.validatePromoCode(promoCodeValue, appliedPromo);
      } else if (this.promo_codes?.length > 0) {
        const foundPromo = this.promo_codes.find((promo) => {
          const code = promo.promo_code || promo.promoCode;
          return code?.toUpperCase() === promoCodeValue.toUpperCase();
        });
        if (foundPromo) {
          this.validatePromoCode(promoCodeValue, foundPromo);
        }
      }
    });
  });

  normalizedPromoCode = computed(() => {
    const promoCodeValue = this.promoCode();
    if (promoCodeValue) return promoCodeValue;

    const applied = this.appliedPromoCode();
    if (applied) {
      return applied.promoCode || applied.promo_code || '';
    }

    return '';
  });

  totalPrice = computed(() => {
    const totalInCents = Object.values(this.totalsByTier()).reduce((sum, tierTotal) => sum + tierTotal, 0);
    const totalInDollars = totalInCents / 100;
    const discount = this.discountAmount();
    return Math.max(0, totalInDollars - discount);
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

  totalSelectedTickets = computed(() => {
    return this.ticketsData().reduce((sum, ticket) => {
      return sum + (ticket.selectedQuantity ?? 0);
    }, 0);
  });

  maxAllowedTickets = computed(() => {
    return 1 + this.maxAttendeesPerUser;
  });

  ngOnInit(): void {
    if (this.tickets && this.tickets.length > 0) {
      const initializedTickets = this.tickets.map((ticket: any) => {
        const saleStartDate = ticket.sales_start_date || ticket.sale_start_date;
        const saleEndDate = ticket.sales_end_date || ticket.sale_end_date;
        const availableQuantity = ticket.available_quantity;

        const transformedTicket: TicketDisplay = {
          ...ticket,
          available_quantity: availableQuantity,
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

  calculateAmountsForAllTiers(): void {
    const tickets = this.ticketsData();
    if (!tickets || tickets.length === 0) return;

    const newTotalsByTier: { [key: string]: number } = {};
    const newPlatformFeesByTier: { [key: string]: number } = {};
    const newHostFeesByTier: { [key: string]: number } = {};
    const newTicketPricesByTier: { [key: string]: number } = {};
    const newActualPricesByTier: { [key: string]: number } = {};
    const newDiscountAmountsByTier: { [key: string]: number } = {};

    let totalPaidTicketCount = 0;
    let totalSubtotalForFees = 0;

    tickets.forEach((ticket) => {
      if (!ticket.id) return;
      const ticketQuantity = ticket.selectedQuantity ?? 0;
      if (ticketQuantity <= 0) return;

      const priceInCents = ticket.price * 100;
      if (priceInCents > 0) {
        totalPaidTicketCount += ticketQuantity;
        totalSubtotalForFees += priceInCents * ticketQuantity;
      }
    });

    tickets.forEach((ticket) => {
      if (!ticket.id) return;

      const ticketId = String(ticket.id);
      const ticketQuantity = ticket.selectedQuantity ?? 0;

      if (ticketQuantity <= 0) return;

      let priceInCents = ticket.price * 100;

      const originalPriceInCents = priceInCents;

      const ticketCount = ticketQuantity;

      let subTotal = priceInCents * ticketCount;

      let additionalCharge = 0;

      if (!this.hostPaysFees && this.additionalFees) {
        const hostChargePercent = Number(this.additionalFees);
        if (hostChargePercent > 0) {
          additionalCharge = Math.round(subTotal * (hostChargePercent / 100));
          subTotal += additionalCharge;
        }
      }

      const discountAmount = 0;

      let fees = 0;
      let total = 0;

      // Only calculate fees for paid tickets (price > 0)
      if (subTotal > 0 && originalPriceInCents > 0) {
        // Fixed fee (e.g., $1.00 per paid ticket) + 10% (7% + 3%) of subtotal
        // Stripe flat fee is added once per transaction (allocated to first paid tier)
        const fixedFeeInCents = 100 * ticketCount;
        const percentageFee = subTotal * 0.1;
        const stripeFlatFee = 30;

        fees = fixedFeeInCents + percentageFee + stripeFlatFee;
        total = this.hostPaysFees ? subTotal : subTotal + fees;
        subTotal = this.hostPaysFees ? subTotal - fees : subTotal;
      }

      newTotalsByTier[ticketId] = Math.trunc(total);
      newPlatformFeesByTier[ticketId] = fees;
      newHostFeesByTier[ticketId] = additionalCharge;
      newTicketPricesByTier[ticketId] = Math.trunc(subTotal);
      newActualPricesByTier[ticketId] = originalPriceInCents * ticketCount;
      newDiscountAmountsByTier[ticketId] = discountAmount;
    });

    this.totalsByTier.set(newTotalsByTier);
    this.platformFeesByTier.set(newPlatformFeesByTier);
    this.hostFeesByTier.set(newHostFeesByTier);
    this.ticketPricesByTier.set(newTicketPricesByTier);
    this.actualPricesByTier.set(newActualPricesByTier);
    this.discountAmountsByTier.set(newDiscountAmountsByTier);
  }

  startTimeUpdate(): void {
    this.countdownInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  getTicketStatus = (ticket: TicketDisplay): 'sale-ended' | 'available' | 'sold-out' | 'upcoming' => {
    this.currentTime();
    const now = this.currentTime();
    const saleStartDate = ticket.sale_start_date;
    const saleEndDate = ticket.sale_end_date;
    const availableQuantity = ticket.available_quantity;

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

  canDecrement(ticket: TicketDisplay): boolean {
    return (ticket.selectedQuantity ?? 0) > 0;
  }

  canIncrement(ticket: TicketDisplay): boolean {
    if (ticket.available_quantity !== undefined) {
      if ((ticket.selectedQuantity ?? 0) >= ticket.available_quantity) {
        return false;
      }
    }

    const currentTotal = this.totalSelectedTickets();
    const maxAllowed = this.maxAllowedTickets();

    if (currentTotal >= maxAllowed) {
      return false;
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
      this.removeAttendeeForTicket(String(ticket.id));
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
      this.addAttendeeForTicket(ticket);
    }
  }

  onPromoCodeChange(value: string): void {
    const upperValue = value.toUpperCase();
    this.promoInput.set(upperValue);
    this.promoCode.set('');
    this.appliedPromoCode.set(null);
    this.discountAmount.set(0);
    this.promoValidation.set({
      isValid: false,
      message: '',
      discountAmount: 0
    });
  }

  validatePromoCode(promoCodeValue: string, discountObj: any): void {
    const maxUsePerUser = discountObj.max_uses_per_user && discountObj.max_uses_per_user > 0 ? discountObj.max_uses_per_user : Infinity;

    const redemptionLimit =
      discountObj.available_quantity !== null && discountObj.available_quantity !== undefined ? discountObj.available_quantity : Infinity;

    const paidTickets: Array<{ priceInCents: number }> = [];

    this.ticketsData().forEach((ticket) => {
      const quantity = ticket.selectedQuantity ?? 0;
      if (quantity > 0) {
        const priceInCents = ticket.price * 100;
        if (priceInCents > 0) {
          for (let i = 0; i < quantity; i++) {
            paidTickets.push({ priceInCents });
          }
        }
      }
    });

    const totalPaidTickets = paidTickets.length;
    if (redemptionLimit <= 0) {
      this.discountAmount.set(0);

      const normalizedPromo = {
        ...discountObj,
        promoCode: discountObj.promo_code || discountObj.promoCode,
        promotion_type: discountObj.promotion_type || discountObj.type,
        value: discountObj.promoPresent || discountObj.value
      };

      this.appliedPromoCode.set(normalizedPromo);
      this.promoCode.set(promoCodeValue);
      this.promoInput.set(promoCodeValue);

      this.promoValidation.set({
        isValid: false,
        message: 'Promo code has reached its redemption limit',
        discountAmount: 0,
        redemptionLimit
      } as any);

      return;
    }

    const eligibleLimit = Math.min(maxUsePerUser, redemptionLimit);

    const eligibleTickets = paidTickets.slice(0, eligibleLimit);
    const eligibleTicketCount = eligibleTickets.length;

    const eligibleAmountInCents = eligibleTickets.reduce((sum, t) => sum + t.priceInCents, 0);

    const actualPrices = this.actualPricesByTier();
    const totalAmountInCents = Object.values(actualPrices).reduce((sum, amount) => sum + amount, 0);

    if (discountObj.capped_amount && discountObj.capped_amount.trim() !== '') {
      const minOrderAmount = discountObj.capped_amount * 100;

      if (totalAmountInCents < minOrderAmount) {
        this.discountAmount.set(0);

        const normalizedPromo = {
          ...discountObj,
          promoCode: discountObj.promo_code || discountObj.promoCode,
          promotion_type: discountObj.promotion_type || discountObj.type,
          value: discountObj.promoPresent || discountObj.value
        };

        this.appliedPromoCode.set(normalizedPromo);
        this.promoCode.set(promoCodeValue);
        this.promoInput.set(promoCodeValue);

        this.promoValidation.set({
          isValid: false,
          message: `Promo code not applied - minimum order of $${(minOrderAmount / 100).toFixed(2)} required`,
          discountAmount: 0,
          cappedAmount: minOrderAmount
        } as any);

        return;
      }
    }

    const promoType = discountObj.promotion_type || discountObj.type;
    const promoValue = discountObj.promoPresent || discountObj.value;

    let discountAmountInCents = 0;

    if (promoType === 'percentage' || promoType === 'Percentage') {
      const percentage = parseFloat(promoValue) || 0;
      discountAmountInCents = Math.round(eligibleAmountInCents * (percentage / 100));

      if (discountObj.capped_amount && discountObj.capped_amount.trim() !== '') {
        const maxDiscount = discountObj.capped_amount * 100;
        discountAmountInCents = Math.min(discountAmountInCents, maxDiscount);
      }
    } else if (promoType === 'fixed' || promoType === 'Fixed') {
      discountAmountInCents = promoValue * 100;
      discountAmountInCents = Math.min(discountAmountInCents, eligibleAmountInCents);
    }

    const discountInDollars = discountAmountInCents / 100;

    let message = 'Promo code applied';

    if (discountInDollars > 0) {
      if (eligibleTicketCount < totalPaidTickets) {
        message = `You saved $${discountInDollars.toFixed(2)} (applied on ${eligibleTicketCount} ticket${eligibleTicketCount > 1 ? 's' : ''})`;
      } else {
        message = `You saved $${discountInDollars.toFixed(2)}`;
      }
    }

    const normalizedPromo = {
      ...discountObj,
      promoCode: discountObj.promo_code || discountObj.promoCode,
      promotion_type: promoType,
      value: promoValue
    };

    this.promoValidation.set({
      isValid: true,
      message,
      discountAmount: discountInDollars,
      redemptionLimit,
      maxUsePerUser,
      eligibleTicketCount
    } as any);

    this.appliedPromoCode.set(normalizedPromo);
    this.discountAmount.set(discountInDollars);
    this.promoCode.set(promoCodeValue);
    this.promoInput.set(promoCodeValue);
  }

  onPromoButtonClick(): void {
    const isApplied = this.promoCode() && this.promoValidation().isValid && this.promoCode() === this.promoInput().trim().toUpperCase();

    if (isApplied) {
      this.clearPromoCode();
    } else {
      this.applyPromoCode();
    }
  }

  applyPromoCode(): void {
    const code = this.promoInput().trim().toUpperCase();

    const foundPromo = this.promo_codes?.find((promo) => {
      const promoCodeValue = promo.promo_code || promo.promoCode;
      return promoCodeValue?.toUpperCase() === code;
    });

    if (!foundPromo) {
      this.setPromoError(code, 'Invalid promo code');
      return;
    }

    this.calculateAmountsForAllTiers();
    this.validatePromoCode(code, foundPromo);
    this.updateAttendeeFees();
  }

  clearPromoCode(): void {
    this.promoCode.set('');
    this.promoInput.set('');
    this.appliedPromoCode.set(null);
    this.discountAmount.set(0);
    this.promoValidation.set({
      isValid: false,
      message: '',
      discountAmount: 0
    });
  }

  setPromoError(code: string, message: string): void {
    this.discountAmount.set(0);
    this.appliedPromoCode.set(null);
    this.promoCode.set(code);
    this.promoValidation.set({
      isValid: false,
      message,
      discountAmount: 0
    });
  }

  rebuildAttendees(): void {
    try {
      const selectedTickets = this.ticketsData().filter((t) => (t.selectedQuantity ?? 0) > 0);
      if (selectedTickets.length === 0) {
        this.attendees.set([]);
        return;
      }

      const attendees: any[] = [];
      const currentUser = this.authService.currentUser();
      const userId = currentUser?.id || null;

      selectedTickets.forEach((ticket) => {
        const quantity = ticket.selectedQuantity ?? 0;
        const ticketId = String(ticket.id);
        const priceInCents = ticket.price * 100;

        for (let i = 0; i < quantity; i++) {
          const isGuest = attendees.length > 0;

          if (priceInCents <= 0) {
            attendees.push({
              parent_user_id: isGuest ? userId : null,
              name: '',
              is_incognito: false,
              rsvp_status: 'Yes',
              event_ticket_id: ticketId,
              event_promo_code_id: null,
              platform_fee_amount: 0,
              amount_paid: 0,
              host_payout_amount: 0
            });
          } else {
            attendees.push({
              parent_user_id: isGuest ? userId : null,
              name: '',
              is_incognito: false,
              rsvp_status: 'Yes',
              event_ticket_id: ticketId,
              event_promo_code_id: null,
              platform_fee_amount: 0,
              amount_paid: 0,
              host_payout_amount: 0
            });
          }
        }
      });

      this.attendees.set(attendees);
      this.updateAttendeeFees();
    } catch (error) {
      console.error('Error rebuilding attendees:', error);
      this.attendees.set([]);
    }
  }

  addAttendeeForTicket(ticket: TicketDisplay): void {
    const currentUser = this.authService.currentUser();
    const userId = currentUser?.id || null;
    const ticketId = String(ticket.id);
    const priceInCents = ticket.price * 100;
    const currentAttendees = this.attendees();
    const isGuest = currentAttendees.length > 0;

    if (priceInCents <= 0) {
      const newAttendee = {
        parent_user_id: isGuest ? userId : null,
        name: '',
        is_incognito: false,
        rsvp_status: 'Yes',
        event_ticket_id: ticketId,
        event_promo_code_id: null,
        platform_fee_amount: 0,
        amount_paid: 0,
        host_payout_amount: 0
      };
      this.attendees.update((attendees) => [...attendees, newAttendee]);
      return;
    }

    const newAttendee = {
      parent_user_id: isGuest ? userId : null,
      name: '',
      is_incognito: false,
      rsvp_status: 'Yes',
      event_ticket_id: ticketId,
      event_promo_code_id: null,
      platform_fee_amount: 0,
      amount_paid: 0,
      host_payout_amount: 0
    };
    this.attendees.update((attendees) => [...attendees, newAttendee]);
  }

  removeAttendeeForTicket(ticketId: string): void {
    const currentAttendees = this.attendees();
    const ticketIdStr = String(ticketId);

    for (let i = currentAttendees.length - 1; i >= 0; i--) {
      if (currentAttendees[i].event_ticket_id === ticketIdStr) {
        const updatedAttendees = [...currentAttendees];
        updatedAttendees.splice(i, 1);
        this.attendees.set(updatedAttendees);
        break;
      }
    }
  }

  updateAttendeeFees(): void {
    try {
      const currentAttendees = this.attendees();
      if (currentAttendees.length === 0) {
        return;
      }

      const selectedTickets = this.ticketsData().filter((t) => (t.selectedQuantity ?? 0) > 0);
      const platformFeesByTier = this.platformFeesByTier();
      const ticketPricesByTier = this.ticketPricesByTier();
      const appliedPromoCode = this.appliedPromoCode();
      const promoCodeId = appliedPromoCode?.id || null;
      const discountAmount = this.discountAmount();
      const promoValidation = this.promoValidation();
      const eligibleTicketCount = promoValidation.eligibleTicketCount || 0;

      const discountPerEligibleTicket = eligibleTicketCount > 0 ? discountAmount / eligibleTicketCount : 0;

      let eligibleTicketIndex = 0;
      const ticketCounts: { [key: string]: number } = {};

      selectedTickets.forEach((ticket) => {
        ticketCounts[String(ticket.id)] = ticket.selectedQuantity ?? 0;
      });

      const updatedAttendees = currentAttendees.map((attendee) => {
        const ticketId = attendee.event_ticket_id;
        const priceInCents = (selectedTickets.find((t) => String(t.id) === ticketId)?.price || 0) * 100;

        if (priceInCents <= 0) {
          return {
            ...attendee,
            event_promo_code_id: null,
            platform_fee_amount: 0,
            amount_paid: 0,
            host_payout_amount: 0
          };
        }

        const quantity = ticketCounts[ticketId] || 0;
        const totalPlatformFeeInCents = platformFeesByTier[ticketId] || 0;
        const totalTicketPriceInCents = ticketPricesByTier[ticketId] || 0;

        const platformFeePerTicketInCents = quantity > 0 ? totalPlatformFeeInCents / quantity : 0;
        const ticketPricePerTicketInCents = quantity > 0 ? totalTicketPriceInCents / quantity : 0;

        const isEligibleForPromo = eligibleTicketIndex < eligibleTicketCount;
        const ticketDiscount = isEligibleForPromo ? discountPerEligibleTicket : 0;
        eligibleTicketIndex++;

        const ticketPriceInDollars = ticketPricePerTicketInCents / 100;
        const platformFeeInDollars = platformFeePerTicketInCents / 100;

        const ticketPriceAfterDiscount = Math.max(0, ticketPriceInDollars - ticketDiscount);

        let amountPaid = ticketPriceAfterDiscount;
        if (!this.hostPaysFees) {
          amountPaid += platformFeeInDollars;
        }

        const hostPayoutAmount = amountPaid - platformFeeInDollars;

        return {
          ...attendee,
          event_promo_code_id: isEligibleForPromo ? promoCodeId : null,
          platform_fee_amount: platformFeeInDollars,
          amount_paid: amountPaid,
          host_payout_amount: hostPayoutAmount
        };
      });

      this.attendees.set(updatedAttendees);
    } catch (error) {
      console.error('Error updating attendee fees:', error);
    }
  }

  updateAttendeeNames(rsvpConfirmData: any): void {
    const currentUser = this.authService.currentUser();
    const guestDetails = rsvpConfirmData?.guestDetails || [];
    const yourDetails = rsvpConfirmData?.yourDetails;

    let guestIndex = 0;
    const attendees = this.attendees().map((attendee) => {
      const isGuest = attendee.parent_user_id !== null;
      let attendeeName = '';
      let isIncognito = false;
      let rsvpStatus: 'Yes' | 'Maybe' = 'Yes';

      if (isGuest) {
        if (guestIndex < guestDetails.length) {
          const guest = guestDetails[guestIndex];
          attendeeName = `${guest.firstName || ''} ${guest.lastName || ''}`.trim();
          isIncognito = guest.isIncognito || false;
          rsvpStatus = guest.attendance === 'maybe' ? 'Maybe' : 'Yes';
        } else {
          attendeeName = `Guest ${guestIndex + 1}`;
          isIncognito = false;
          rsvpStatus = 'Yes';
        }
        guestIndex++;
      } else {
        if (yourDetails) {
          attendeeName = `${yourDetails.firstName || ''} ${yourDetails.lastName || ''}`.trim();
        } else if (currentUser?.name) {
          attendeeName = currentUser.name;
        }
        isIncognito = false;
        rsvpStatus = 'Yes';
      }

      return {
        ...attendee,
        name: attendeeName,
        is_incognito: isIncognito,
        rsvp_status: rsvpStatus
      };
    });

    this.attendees.set(attendees);
  }

  async dismiss(): Promise<void> {
    const selectedTickets = this.ticketsData().filter((t) => (t.selectedQuantity ?? 0) > 0);

    if (!this.isLoggedIn()) {
      await this.modalService.openSignupModal();
      return;
    }
    const totalPlatformFeesInCents = Object.values(this.platformFeesByTier()).reduce((sum, fee) => sum + fee, 0);
    const totalPlatformFees = totalPlatformFeesInCents / 100;

    const rsvpData = {
      tickets: selectedTickets,
      promo_code: this.normalizedPromoCode(),
      appliedPromoCode: this.appliedPromoCode(),
      discountAmount: this.discountAmount(),
      subtotal: this.subtotalPrice(),
      total: this.totalPrice(),
      platformFee: totalPlatformFees,
      hostFees: this.hostFeesTotal(),
      subtotalAfterHostFees: this.subtotalAfterHostFees(),
      promoCodeTicketCount: this.promoValidation().eligibleTicketCount || 0
    };

    if (this.hasQuestionnaire() && this.questionnaire && this.questionnaire.length > 0 && !this.questionnaireResult()) {
      const preEventQuestionnaire = this.questionnaire.filter((q: any) => !q.event_phase || q.event_phase === 'PreEvent');

      if (preEventQuestionnaire.length > 0) {
        this.questionnaireResult.set(
          await this.modalService.openQuestionnairePreviewModal(
            preEventQuestionnaire,
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
      }
    }

    const rsvpConfirmData = await this.modalService.openRsvpDetailsModal(
      this.eventTitle,
      this.eventDate,
      this.eventLocation,
      this.eventId,
      rsvpData,
      this.subscriptionId,
      this.hostPaysFees,
      this.additionalFees,
      this.hostName
    );

    if (!rsvpConfirmData) {
      return;
    }

    this.updateAttendeeNames(rsvpConfirmData);

    const result = {
      ...rsvpConfirmData,
      questionnaireResult: this.questionnaireResult(),
      event_id: this.eventId,
      attendees: this.attendees(),
      stripe_payment_intent_id: rsvpConfirmData?.stripePaymentIntentId || null
    };

    await this.modalCtrl.dismiss(result);
    this.modalService.close();
  }

  async close(): Promise<void> {
    await this.modalCtrl.dismiss();
    this.modalService.close();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
