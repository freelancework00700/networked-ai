import { IUser } from '@/interfaces/IUser';
import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { UserService } from '@/services/user.service';
import { ModalService } from '@/services/modal.service';
import { TextInput } from '@/components/form/text-input';
import { EmailInput } from '@/components/form/email-input';
import { BaseApiService } from '@/services/base-api.service';
import { MobileInput } from '@/components/form/mobile-input';
import { ToggleInput } from '@/components/form/toggle-input';
import { StripePaymentComponent } from '@/components/common/stripe-payment';
import { StripePaymentSuccessEvent, StripePaymentErrorEvent } from '@/services/stripe.service';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Input, signal, inject, Component, OnInit, ChangeDetectionStrategy, computed, effect, ViewChild } from '@angular/core';
import { IonHeader, IonFooter, IonToolbar, IonIcon, ModalController, IonContent } from '@ionic/angular/standalone';

export interface RsvpDetailsData {
  tickets: any[];
  questionnaireResponses?: any[];
  promo_code?: string;
  appliedPromoCode?: any;
  discountAmount?: number;
  subtotal?: number;
  total?: number;
  platformFee?: number;
  promoCodeTicketCount?: number;
  hostFees?: number;
  subtotalAfterHostFees?: number;
}

@Component({
  selector: 'rsvp-details-modal',
  styleUrl: './rsvp-details-modal.scss',
  templateUrl: './rsvp-details-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    IonIcon,
    IonHeader,
    IonFooter,
    TextInput,
    IonContent,
    IonToolbar,
    EmailInput,
    MobileInput,
    ToggleInput,
    CommonModule,
    ReactiveFormsModule,
    StripePaymentComponent
  ]
})
export class RsvpDetailsModal extends BaseApiService implements OnInit {
  @ViewChild(StripePaymentComponent) paymentComponent!: StripePaymentComponent;
  @Input() eventTitle: string = '';
  @Input() eventDate: string = '';
  @Input() eventLocation: string = '';
  @Input() eventId: string = '';
  @Input() rsvpData: RsvpDetailsData | null = null;
  @Input() subscriptionId: string = '';
  @Input() hostPaysFees: boolean = false;
  @Input() additionalFees: string | number | null = null;
  @Input() hostName: string = 'Networked AI';

  modalCtrl = inject(ModalController);
  rsvpDataSignal = signal<RsvpDetailsData | null>(null);

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private modalService = inject(ModalService);

  form: FormGroup;
  guestForms: FormArray;

  currentUser = signal<IUser | null>(null);
  guestAttendances = signal<Map<number, 'going' | 'maybe'>>(new Map());
  guestIncognitos = signal<Map<number, boolean>>(new Map());

  // Stripe payment properties
  isLoadingPayment = signal<boolean>(false);
  paymentErrorMessage = signal<string>('');

  constructor() {
    super();
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required]]
    });

    this.guestForms = this.fb.array([]);

    effect(() => {
      const guestCount = this.totalGuestCount();
      const currentFormCount = this.guestForms.length;

      if (guestCount !== currentFormCount && guestCount > 0) {
        this.initializeGuestForms();
      }
    });
  }

  subtotal = computed(() => this.rsvpDataSignal()?.subtotal ?? 0);

  hostFees = computed(() => this.rsvpDataSignal()?.hostFees ?? 0);

  subtotalAfterHostFees = computed(() => this.rsvpDataSignal()?.subtotalAfterHostFees ?? 0);

  platformFee = computed(() => this.rsvpDataSignal()?.platformFee ?? 0);

  subscriberPerk = computed(() => {
    if (!this.subscriptionId) return 0;
    return 10.0;
  });

  promoCodeTicketCount = computed(() => {
    const rsvpData = this.rsvpDataSignal();
    
    if (rsvpData?.promoCodeTicketCount !== undefined && rsvpData.promoCodeTicketCount > 0) {
      return rsvpData.promoCodeTicketCount;
    }
    
    const tickets = rsvpData?.tickets || [];
    if (tickets.length === 0) return 0;

    return tickets.reduce((sum, ticket) => {
      const quantity = ticket.selectedQuantity || 0;
      const price = ticket.price;
      return sum + (price > 0 ? quantity : 0);
    }, 0);
  });

  promoCodeDisplayName = computed(() => {
    const rsvpData = this.rsvpDataSignal();
    const promoCode = rsvpData?.promo_code || 
                      rsvpData?.appliedPromoCode?.promoCode || 
                      rsvpData?.appliedPromoCode?.promo_code || 
                      '';
    const ticketCount = this.promoCodeTicketCount();
    
    if (!promoCode) return '';
    
    return ticketCount > 0 ? `${promoCode} x${ticketCount}` : promoCode;
  });

  totalPrice = computed(() => {
    const baseTotal = this.rsvpDataSignal()?.total || 0;
    const perk = this.subscriberPerk();
    
    return Math.max(0, baseTotal - perk);
  });

  formattedTotal = computed(() => {
    return this.totalPrice()?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';
  });

  confirmButtonLabel = computed(() => {
    if (this.isLoadingPayment()) {
      return 'Processing Payment...';
    }
    if (this.totalPrice() > 0) {
      return `Pay $${this.formattedTotal()} and Confirm`;
    }
    return 'Confirm RSVP';
  });

  totalTicketCount = computed(() => {
    const tickets = this.rsvpDataSignal()?.tickets || [];
    return tickets.reduce((sum, ticket) => sum + (ticket.selectedQuantity || 0), 0);
  });

  totalGuestCount = computed(() => {
    return Math.max(0, this.totalTicketCount() - 1);
  });

  selectedTickets = computed(() => {
    const tickets = this.rsvpDataSignal()?.tickets || [];
    const result: Array<{ ticket: any; guestIndex: number }> = [];
    let guestIndex = 0;

    tickets.forEach((ticket) => {
      const quantity = ticket.selectedQuantity || 0;
      for (let i = 0; i < quantity; i++) {
        result.push({ ticket, guestIndex: guestIndex++ });
      }
    });

    return result;
  });

  getTicketPrice(ticket: any): string {
    if (ticket.ticket_type === 'Free') {
      return '0.00';
    }
    const price = ticket.price;
    const quantity = ticket.selectedQuantity || 0;
    return (price * quantity).toFixed(2);
  }

  formatCurrency(amount: number): string {
    return amount.toFixed(2);
  }

  async ngOnInit(): Promise<void> {
    this.rsvpDataSignal.set(this.rsvpData);

    try {
      const user = await this.userService.getCurrentUser();
      this.currentUser.set(user);
      this.populateFormsWithUserData();
    } catch (error) {
      console.warn('No active user account found, forms will remain empty', error );
    }

  }

  populateFormsWithUserData(): void {
    const user = this.currentUser();
    if (!user) return;

    const nameParts = user.name?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    this.form.patchValue({
      firstName,
      lastName,
      email: user.email || '',
      mobile: user.mobile || ''
    });
  }

  initializeGuestForms(): void {
    const totalGuests = this.totalGuestCount();

    while (this.guestForms.length > 0) {
      this.guestForms.removeAt(0);
    }

    this.guestAttendances.set(new Map());
    this.guestIncognitos.set(new Map());

    for (let i = 0; i < totalGuests; i++) {
      const guestForm = this.fb.group({
        guestFirstName: ['', [Validators.required]],
        guestLastName: ['', [Validators.required]],
        isIncognito: [false]
      });

      this.guestForms.push(guestForm);

      const attendances = this.guestAttendances();
      const incognitos = this.guestIncognitos();
      attendances.set(i, 'going');
      incognitos.set(i, false);
      this.guestAttendances.set(new Map(attendances));
      this.guestIncognitos.set(new Map(incognitos));
    }
  }

  getGuestForm(index: number): FormGroup {
    return this.guestForms.at(index) as FormGroup;
  }

  setGuestAttendance(index: number, attendance: 'going' | 'maybe'): void {
    const attendances = this.guestAttendances();
    attendances.set(index, attendance);
    this.guestAttendances.set(new Map(attendances));
  }

  getGuestAttendance(index: number): 'going' | 'maybe' {
    return this.guestAttendances().get(index) || 'going';
  }

  async dismiss(): Promise<void> {
    const isGuestFormsValid = Array.from({ length: this.guestForms.length }, (_, i) => {
      return this.guestForms.at(i)?.valid ?? true;
    }).every((valid) => valid);

    if (!this.form.valid || !isGuestFormsValid) {
      Object.keys(this.form.controls).forEach((key) => {
        this.form.get(key)?.markAsTouched();
      });
      for (let i = 0; i < this.guestForms.length; i++) {
        const guestForm = this.guestForms.at(i) as FormGroup;
        Object.keys(guestForm.controls).forEach((key) => {
          guestForm.get(key)?.markAsTouched();
        });
      }
      return;
    }

    // If there's a payment amount, process payment first
    let stripePaymentIntentId: string | null = null;
    if (this.totalPrice() > 0) {
      const formValue = this.form.getRawValue();
      const { firstName, lastName, email } = formValue;
      const paymentSuccess = await this.paymentComponent.processPayment({
        name: `${firstName} ${lastName}`.trim(),
        email: email as string
      });
      if (!paymentSuccess) {
        return;
      }
      // Get the stripe_payment_intent_id after successful payment
      stripePaymentIntentId = this.paymentComponent.getPaymentIntentId();
    }

    const guestDetails = Array.from({ length: this.guestForms.length }, (_, i) => {
      const guestForm = this.guestForms.at(i) as FormGroup;
      return {
        firstName: guestForm.get('guestFirstName')?.value,
        lastName: guestForm.get('guestLastName')?.value,
        attendance: this.getGuestAttendance(i),
        isIncognito: guestForm.get('isIncognito')?.value || false
      };
    });

    const formData = {
      yourDetails: {
        firstName: this.form.get('firstName')?.value,
        lastName: this.form.get('lastName')?.value,
        email: this.form.get('email')?.value,
        mobile: this.form.get('mobile')?.value
      },
      guestDetails: guestDetails.length > 0 ? guestDetails : null,
      rsvpData: this.rsvpDataSignal(),
      stripePaymentIntentId: stripePaymentIntentId
    };
    await this.modalCtrl.dismiss(formData);
  }

  onPaymentSuccess(event: StripePaymentSuccessEvent): void {
    // Payment succeeded, can be handled here if needed
    console.log('Payment succeeded:', event);
  }

  onPaymentError(event: StripePaymentErrorEvent): void {
    this.paymentErrorMessage.set(event.error);
  }

  onPaymentProcessing(isProcessing: boolean): void {
    this.isLoadingPayment.set(isProcessing);
  }

  close(): void {
    this.modalService.close();
  }
}
