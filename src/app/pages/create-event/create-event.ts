import {
  IonHeader,
  IonContent,
  IonFooter,
  IonToolbar,
  IonReorderGroup,
  IonToggle,
  IonLabel,
  IonCheckbox,
  ItemReorderEventDetail
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TextInput } from '@/components/form/text-input';
import { ModalInput } from '@/components/form/modal-input';
import { ModalController } from '@ionic/angular/standalone';
import { EditorInput } from '@/components/form/editor-input';
import { NumberInput } from '@/components/form/number-input';
import { ConfirmModal } from '@/components/modal/confirm-modal';
import { signal, computed, inject, Component } from '@angular/core';
import { TicketCard } from '@/pages/create-event/components/ticket-card';
import { SelectOption } from '@/components/modal/select-modal/select-modal';
import { AIPromptModal } from '@/pages/create-event/components/ai-prompt-modal';
import { PromoCodeCard } from '@/pages/create-event/components/promo-code-card';
import { TicketTypeItem } from '@/pages/create-event/components/ticket-type-item';
import { TicketTypeModal } from '@/pages/create-event/components/ticket-type-modal';
import { EventForm, Ticket, PromoCode, SubscriptionPlan } from '@/interfaces/event';
import { SubscriptionInput } from '@/pages/create-event/components/subscription-input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketForm, TicketFormData } from '@/pages/create-event/components/ticket-form';
import { NetworkTagModal, NetworkTag } from '@/pages/create-event/components/network-tag';
import { PromoCodeForm, PromoCodeFormData } from '@/pages/create-event/components/promo-code-form';

@Component({
  selector: 'create-event',
  templateUrl: './create-event.html',
  imports: [
    Button,
    IonLabel,
    TextInput,
    IonHeader,
    IonFooter,
    IonToggle,
    ModalInput,
    IonToolbar,
    IonContent,
    TicketCard,
    NumberInput,
    IonCheckbox,
    EditorInput,
    CommonModule,
    PromoCodeCard,
    TicketTypeItem,
    CheckboxModule,
    InputTextModule,
    IonReorderGroup,
    SubscriptionInput,
    ReactiveFormsModule
  ]
})
export class CreateEvent {
  // services
  fb = inject(FormBuilder);
  modalCtrl = inject(ModalController);

  atLeastOneTagValidator = (control: any) => {
    const value = control.value;
    if (!value || !Array.isArray(value) || value.length === 0) {
      return { required: true };
    }
    return null;
  };

  // signals
  eventForm = signal<FormGroup<EventForm>>(
    this.fb.group<EventForm>({
      images: this.fb.control<string | File[] | null>(null),
      until_finished: this.fb.control<boolean>(false),
      meta_tags: this.fb.control<string[]>([], [Validators.required, this.atLeastOneTagValidator]),
      tickets: this.fb.control<Ticket[] | null>([]),
      promo_codes: this.fb.control<PromoCode[] | null>([]),
      is_subscription: this.fb.control<boolean | null>(false),
      subscription_plan: this.fb.control<string | null>(null),
      host_pays_fees: this.fb.control<boolean | null>(false),
      guest_fee_enabled: this.fb.control<boolean | null>(false),
      additional_fees: this.fb.control<string | null>('')
    })
  );

  maxDescriptionLength = 2500;
  tickets = signal<Ticket[]>([]);
  currentStep = signal<number>(1);
  hostCharge = signal<string>('');
  conversation = signal<any[]>([]);
  discount = signal<PromoCode[]>([]);
  ticketType = signal<string>('free');
  isCustomize = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);
  descriptionLength = signal<number>(0);
  steps = signal<number[]>([1, 2, 3, 4]);
  isSubscription = signal<boolean>(false);
  storedPlans = signal<SubscriptionPlan[]>([]);
  subscriptionId = signal<string | null>(null);
  promoCodeSectionOpen = signal<boolean>(false);
  advancedSettingsOpen = signal<boolean>(false);
  isStripeAccountSetup = signal<boolean>(false);
  editingPromoIndex = signal<number | null>(null);
  editingTicketIndex = signal<number | null>(null);
  selectedMetaTags = signal<Set<string>>(new Set());

  step1Fields = ['title', 'date', 'address', 'category', 'description', 'meta_tags', 'start_time', 'end_time', 'until_finished'];
  step2Fields = ['tickets', 'promo_codes', 'is_subscription', 'subscription_plan', 'host_pays_fees', 'additional_fees'];
  step3Fields: string[] = [];
  step4Fields: string[] = [];
  stepHeading = computed(() => {
    const step = this.currentStep();
    switch (step) {
      case 1:
        return 'Event Details';
      case 2:
        return 'Event Tickets';
      case 3:
        return 'Event Settings';
      case 4:
        return 'Event Preview';
      default:
        return 'Event Details';
    }
  });

  buttonLabel = computed(() => {
    const step = this.currentStep();
    switch (step) {
      case 1:
        return 'Setup Tickets';
      case 2:
        return 'Event Settings';
      case 3:
        return 'Preview Before Publishing';
      case 4:
        return 'Publish Event';
      default:
        return 'Next';
    }
  });

  buttonIcon = computed(() => {
    const step = this.currentStep();
    switch (step) {
      case 1:
      case 2:
      case 3:
        return 'pi-arrow-right';
      case 4:
        return 'pi-check';
      default:
        return 'pi-arrow-right';
    }
  });

  iconPos = computed(() => {
    const step = this.currentStep();
    return step === 4 ? 'left' : 'right';
  });

  isButtonDisabled = computed(() => {
    const step = this.currentStep();
    if (step === 2) {
      return this.tickets().length === 0;
    }
    return false;
  });

  categoryOptions: SelectOption[] = [
    { value: 'business', label: 'Business' },
    { value: 'networking', label: 'Networking' },
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'social', label: 'Social' },
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' },
    { value: 'arts', label: 'Arts' },
    { value: 'other', label: 'Other' }
  ];

  metaTagOptions: NetworkTag[] = [
    { name: 'Agriculture', icon: '🌿', value: 'agriculture' },
    { name: 'Art & Entertainment', icon: '🎨', value: 'art_entertainment' },
    { name: 'Business & Finance', icon: '📈', value: 'business_finance' },
    { name: 'Education', icon: '📚', value: 'education' },
    { name: 'Engineering', icon: '⚙️', value: 'engineering' },
    { name: 'Health & Medicine', icon: '🏥', value: 'health_medicine' },
    { name: 'Software & IT', icon: '💻', value: 'software_it' },
    { name: 'Hospitality & Tourism', icon: '✈️', value: 'hospitality_tourism' },
    { name: 'Law & Public Policy', icon: '⚖�️', value: 'law_policy' },
    { name: 'Manufacturing', icon: '🏭', value: 'manufacturing' },
    { name: 'Retail & Sales', icon: '🏪', value: 'retail_sales' },
    { name: 'Student', icon: '🎓', value: 'student' },
    { name: 'Service & Freelancing', icon: '🤝', value: 'service_freelancing' },
    { name: 'Others', icon: '🎲', value: 'others' }
  ];

  constructor() {
    this.eventForm()
      .get('until_finished')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.eventForm().get('end_time')?.disable();
        } else {
          this.eventForm().get('end_time')?.enable();
        }
      });
  }

  async openNetworkTagModal() {
    const form = this.eventForm();
    const metaTagsControl = form.get('meta_tags');
    const currentSelected = metaTagsControl?.value || [];

    const modal = await this.modalCtrl.create({
      component: NetworkTagModal,
      backdropDismiss: true,
      cssClass: 'auto-hight-modal',
      componentProps: {
        title: 'Networked Meta Tags',
        subtitle: 'Select up to 5',
        tags: this.metaTagOptions,
        initialSelectedTags: currentSelected,
        maxSelections: 5
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && Array.isArray(data)) {
      const selectedSet = new Set(data);
      this.selectedMetaTags.set(selectedSet);

      if (metaTagsControl) {
        metaTagsControl.setValue(data);
      }
    }
  }

  getSelectedTagValues(): string[] {
    return Array.from(this.selectedMetaTags());
  }

  getTagByName(value: string): NetworkTag | undefined {
    return this.metaTagOptions.find((tag) => tag.value === value);
  }

  get isMetaTagsInvalid(): boolean {
    const form = this.eventForm();
    const metaTagsControl = form.get('meta_tags');
    return !!(metaTagsControl?.invalid && (metaTagsControl?.touched || this.isSubmitted()));
  }

  generateDescription(): void {
    const form = this.eventForm();
    const descriptionControl = form.get('description');

    if (descriptionControl) {
      const generatedDescription =
        '<p>This is a generated event description. You can customize this content to better match your event details and requirements.</p>';
      descriptionControl.setValue(generatedDescription);
      descriptionControl.markAsTouched();

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generatedDescription;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      this.descriptionLength.set(plainText.trim().length);

      this.isCustomize.set(true);
    }
  }

  handleGenerateClick = (): void => {
    if (this.isCustomize()) {
      this.openAIPromptModal();
    } else {
      this.generateDescription();
    }
  };

  async openAIPromptModal() {
    const modal = await this.modalCtrl.create({
      component: AIPromptModal,
      initialBreakpoint: 1,
      handle: true,
      componentProps: {
        conversation: this.conversation(),
        isEvent: true
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      if (data.type === 'value' && data.data) {
        this.eventForm().get('description')?.setValue(data.data);
      } else if (data.type === 'data' && data.data) {
        this.conversation.set(data.data);
      }
    }
  }

  openNetworkedGallery(): void {
    // TODO: Implement Networked Gallery modal
  }

  openNetworkedGIFs(): void {
    // TODO: Implement Networked GIFs modal
  }

  handleTicketReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const reorderedTickets = event.detail.complete([...this.tickets()]);
    this.tickets.set(reorderedTickets);
    this.eventForm().get('tickets')?.setValue(reorderedTickets);
    event.detail.complete();
  }

  async openTicketModal(ticketType: 'free' | 'paid' | 'early-bird' | 'sponsor' | 'standard', initialData?: Partial<TicketFormData>) {
    const modal = await this.modalCtrl.create({
      component: TicketForm,
      cssClass: 'auto-hight-modal',
      backdropDismiss: false,
      componentProps: {
        ticketType,
        initialData
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      const ticketData: Ticket = {
        id: initialData ? (initialData as any).id : `ticket-${Date.now()}`,
        name: data.name,
        ticket_type: data.ticket_type,
        is_free_ticket: data.ticket_type === 'free',
        price: data.ticket_type === 'free' ? '$0.00' : `$${parseFloat(data.price).toFixed(2)}`,
        quantity: data.quantity,
        description: data.description || null,
        sales_start_date: data.sales_start_date || null,
        sales_end_date: null,
        end_sale_on_event_start: data.end_sale_on_event_start
      };

      if (this.editingTicketIndex() !== null) {
        const currentTickets = [...this.tickets()];
        currentTickets[this.editingTicketIndex()!] = ticketData;
        this.tickets.set(currentTickets);
        this.editingTicketIndex.set(null);
      } else {
        const currentTickets = [...this.tickets()];
        currentTickets.push(ticketData);
        this.tickets.set(currentTickets);
      }
      this.eventForm().get('tickets')?.setValue(this.tickets());
      this.editingTicketIndex.set(null);
    }
  }

  async editTicket(index: number) {
    this.editingTicketIndex.set(index);
    const ticket = this.tickets()[index];
    if (ticket) {
      const ticketData: Partial<TicketFormData> = {
        name: ticket.name,
        price: ticket.price.replace('$', ''),
        quantity: ticket.quantity || null,
        description: (ticket as any).description,
        sales_start_date: ticket.sales_start_date || null,
        end_sale_on_event_start: ticket.end_sale_on_event_start ?? true,
        ticket_type: ticket.ticket_type
      };
      await this.openTicketModal(ticket.ticket_type, ticketData);
    }
  }

  deleteTicket(index: number): void {
    const currentTickets = [...this.tickets()];
    currentTickets.splice(index, 1);
    this.tickets.set(currentTickets);
    this.eventForm().get('tickets')?.setValue(currentTickets);
  }

  async createFreeTicket() {
    this.ticketType.set('free');
    await this.openTicketModal('free');
  }

  async createPaidTicket() {
    // if (!this.isStripeAccountSetup()) {
    //   this.promptStripeSignup();
    //   return;
    // }

    const typeModal = await this.modalCtrl.create({
      component: TicketTypeModal,
      cssClass: 'auto-hight-modal',
      backdropDismiss: true
    });

    await typeModal.present();

    const { data, role } = await typeModal.onWillDismiss();

    if (role === 'select' && data) {
      const ticketType = data as 'standard' | 'early-bird' | 'sponsor';
      this.ticketType.set(ticketType);
      await this.openTicketModal(ticketType);
    }
  }

  async openPromoCodeModal(initialData?: Partial<PromoCodeFormData>) {
    const modal = await this.modalCtrl.create({
      component: PromoCodeForm,
      cssClass: 'auto-hight-modal',
      backdropDismiss: false,
      componentProps: {
        initialData
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      const promoData: PromoCode = {
        promoCode: data.promoCode,
        promotion_type: data.promotion_type,
        promoPresent: data.promoPresent,
        capped_amount: data.capped_amount || null,
        redemption_limit: data.redemption_limit || null,
        max_use_per_user: data.max_use_per_user || 1
      };

      if (this.editingPromoIndex() !== null) {
        const currentDiscounts = [...this.discount()];
        currentDiscounts[this.editingPromoIndex()!] = promoData;
        this.discount.set(currentDiscounts);
        this.editingPromoIndex.set(null);
      } else {
        const currentDiscounts = [...this.discount()];
        currentDiscounts.push(promoData);
        this.discount.set(currentDiscounts);
      }
      this.eventForm().get('promo_codes')?.setValue(this.discount());
    }
  }

  async editPromoCode(index: number) {
    this.editingPromoIndex.set(index);
    const promo = this.discount()[index];
    if (promo) {
      const initialData: Partial<PromoCodeFormData> = {
        promoCode: promo.promoCode,
        promotion_type: promo.promotion_type,
        promoPresent: promo.promoPresent,
        capped_amount: promo.capped_amount || null,
        redemption_limit: promo.redemption_limit || null,
        max_use_per_user: promo.max_use_per_user || 1
      };
      await this.openPromoCodeModal(initialData);
    }
  }

  deletePromoCode(index: number): void {
    const currentDiscounts = [...this.discount()];
    currentDiscounts.splice(index, 1);
    this.discount.set(currentDiscounts);
    this.eventForm().get('promo_codes')?.setValue(this.discount());
  }

  async resetPromoForm() {
    this.editingPromoIndex.set(null);
    await this.openPromoCodeModal();
  }

  async promptStripeSignup() {
    const modal = await this.modalCtrl.create({
      component: ConfirmModal,
      backdropDismiss: true,
      cssClass: 'auto-hight-modal',
      componentProps: {
        icon: 'assets/svg/stripeSetup.svg',
        title: 'Add Payout Details',
        description: 'To accept ticket sales in app, you must setup your payout details with Stripe.',
        confirmButtonLabel: 'Connect Payment',
        cancelButtonLabel: 'Maybe Later',
        primaryButtonColor: 'primary',
        secondaryButtonColor: 'secondary'
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      console.log('User wants to connect Stripe');
    }
  }

  isEventCompletelyFree(): boolean {
    return this.tickets().every((ticket) => ticket.is_free_ticket);
  }
  navigateToSubscriptionPlans(): void {
    console.log('Navigate to subscription plans');
  }

  hasFreeTicket(): boolean {
    return this.tickets().some((t) => t.ticket_type === 'free');
  }

  getPromoCodeOriginalIndex(promo: PromoCode): number {
    return this.discount().findIndex((p) => p === promo);
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  handleButtonClick(): void {
    const step = this.currentStep();
    if (step === 4) {
      this.createEvent();
    } else {
      this.nextStep();
    }
  }

  private validateFields(fieldNames: string[]): boolean {
    const form = this.eventForm();
    const isValid = fieldNames.every((field) => {
      const control = form.get(field);
      if (!control) return false;

      if (control.disabled) {
        return true;
      }

      return control.valid;
    });

    if (!isValid) {
      fieldNames.forEach((field) => {
        const control = form.get(field);
        if (control && !control.disabled) {
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      });
    }

    return isValid;
  }

  nextStep(): void {
    if (this.currentStep() === 1) {
      const form = this.eventForm();
      const untilFinished = form.get('until_finished')?.value;

      const fieldsToValidate = untilFinished ? this.step1Fields.filter((field) => field !== 'end_time') : this.step1Fields;

      if (!this.validateFields(fieldsToValidate)) {
        return;
      }
      this.currentStep.set(2);
    } else if (this.currentStep() === 2) {
      if (this.tickets().length === 0) {
        return;
      }
      this.currentStep.set(3);
    } else if (this.currentStep() === 3) {
      this.currentStep.set(4);
    }
  }

  async createEvent() {
    this.isSubmitted.set(true);
    console.log(':::::::::::::::::::::::::::::::::', this.eventForm().value);
  }
}
