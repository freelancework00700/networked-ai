import {
  IonLabel,
  IonHeader,
  IonToggle,
  IonFooter,
  IonContent,
  IonToolbar,
  IonCheckbox,
  ModalController,
  IonReorderGroup,
  ItemReorderEventDetail
} from '@ionic/angular/standalone';
import { Swiper } from 'swiper';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Chip } from '@/components/common/chip';
import { Button } from '@/components/form/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ModalService } from '@/services/modal.service';
import { TextInput } from '@/components/form/text-input';
import { EditorInput } from '@/components/form/editor-input';
import { NumberInput } from '@/components/form/number-input';
import { ToggleInput } from '@/components/form/toggle-input';
import { TicketCard } from '@/pages/create-event/components/ticket-card';
import { NetworkTag } from '@/pages/create-event/components/network-tag';
import { TicketFormData } from '@/pages/create-event/components/ticket-form';
import { PromoCodeCard } from '@/pages/create-event/components/promo-code-card';
import { TicketTypeItem } from '@/pages/create-event/components/ticket-type-item';
import { EventForm, Ticket, PromoCode, SubscriptionPlan } from '@/interfaces/event';
import { PromoCodeFormData } from '@/pages/create-event/components/promo-code-form';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { SubscriptionInput } from '@/pages/create-event/components/subscription-input';
import { RepeatingEventItem } from '@/pages/create-event/components/repeating-event-item';
import { ParticipantInput, User } from '@/pages/create-event/components/participant-input';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Input, signal, Inject, inject, DOCUMENT, computed, Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'create-event',
  styleUrl: './create-event.scss',
  templateUrl: './create-event.html',
  imports: [
    Chip,
    Button,
    IonLabel,
    TextInput,
    IonHeader,
    IonFooter,
    IonToggle,
    IonToolbar,
    IonContent,
    TicketCard,
    ToggleInput,
    NumberInput,
    IonCheckbox,
    EditorInput,
    CommonModule,
    PromoCodeCard,
    TicketTypeItem,
    DragDropModule,
    CheckboxModule,
    InputTextModule,
    IonReorderGroup,
    ParticipantInput,
    SubscriptionInput,
    RepeatingEventItem,
    ReactiveFormsModule
  ]
})
export class CreateEvent {
  // swiper instance
  swiper?: Swiper;
  currentSlide = signal(0);
  @ViewChild('swiperEl', { static: false }) swiperEl!: ElementRef<HTMLDivElement>;

  // services
  fb = inject(FormBuilder);
  cd = inject(ChangeDetectorRef);
  navCtrl = inject(NavController);
  modalService = inject(ModalService);
  modalCtrl = inject(ModalController);
  @Inject(DOCUMENT) document = inject(DOCUMENT);

  // validators
  atLeastOneTagValidator = (control: any) => {
    const value = control.value;
    if (!value || !Array.isArray(value) || value.length === 0) {
      return { required: true };
    }
    return null;
  };

  // inputs
  @Input() isModalMode: boolean = false;
  @Input() eventData: any | null = null;

  // signals & static properties
  metaTagOptions = signal<{ name: string; icon: string; value: string }[]>([
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
  ]);

  repeatOptions = signal<{ label: string; value: 'weekly' | 'monthly' | 'custom' }[]>([
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Custom', value: 'custom' }
  ]);

  repeatCountOptions = signal<{ label: string; value: number | 'custom' }[]>([
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: 'Custom', value: 'custom' }
  ]);

  sections = signal<{ type: 'pre_event' | 'post_event'; label: string; placeholder: string }[]>([
    { type: 'pre_event', label: 'Pre-Event', placeholder: 'Displayed when user signs up for the event.' },
    { type: 'post_event', label: 'Post-Event', placeholder: 'A feedback survey after the event has concluded.' }
  ]);

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
      additional_fees: this.fb.control<string | null>(''),
      co_hosts: this.fb.control<string[] | null>([]),
      sponsors: this.fb.control<string[] | null>([]),
      speakers: this.fb.control<string[] | null>([]),
      visibility: this.fb.control('public') as FormControl<'public' | 'invite-only' | null>,
      plus: this.fb.control<number | null>(null),
      repeat_frequency: this.fb.control<'weekly' | 'monthly' | 'custom' | null>('weekly'),
      repeat_count: this.fb.control<number | 'custom' | null>(null),
      repeating_events: this.fb.control<any[] | null>([]),
      custom_repeat_count: this.fb.control<number | null>(null),
      questionnaire: this.fb.control<any | null>(null)
    })
  );

  maxDescriptionLength = 2500;
  co_hosts = signal<User[]>([]);
  sponsors = signal<User[]>([]);
  speakers = signal<User[]>([]);
  mediaItems = signal<any[]>([]);
  tickets = signal<Ticket[]>([]);
  currentStep = signal<number>(1);
  conversation = signal<any[]>([]);
  repeatingEvents = signal<any[]>([]);
  promoCodes = signal<PromoCode[]>([]);
  isCustomize = signal<boolean>(false);
  descriptionLength = signal<number>(0);
  steps = signal<number[]>([1, 2, 3, 4]);
  storedPlans = signal<SubscriptionPlan[]>([]);
  promoCodeSectionOpen = signal<boolean>(false);
  advancedSettingsOpen = signal<boolean>(false);
  isStripeAccountSetup = signal<boolean>(false);
  customRepeatCount = signal<number | null>(null);
  editingPromoIndex = signal<number | null>(null);
  editingTicketIndex = signal<number | null>(null);
  selectedMetaTags = signal<Set<string>>(new Set());
  visibility = signal<'public' | 'invite-only'>('public');
  editingRepeatingEventId = signal<string | null>(null);

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
  ngAfterViewChecked() {
    if (this.swiper) return;
    if (!this.swiperEl?.nativeElement) return;
    if (!this.mediaItems().length) return;

    this.swiper = new Swiper(this.swiperEl.nativeElement, {
      slidesPerView: 1,
      spaceBetween: 0,
      allowTouchMove: true,
      observer: true,
      on: {
        slideChange: (swiper) => {
          this.currentSlide.set(swiper.activeIndex);
        }
      }
    });
  }

  private refreshSwiper(targetIndex?: number) {
    if (!this.swiper) return;

    requestAnimationFrame(() => {
      this.swiper!.update();

      if (targetIndex !== undefined) {
        const safeIndex = Math.min(targetIndex, this.swiper!.slides.length - 1);

        this.currentSlide.set(safeIndex);
        this.swiper!.slideTo(safeIndex, 0);
      }
    });
  }

  private refreshSwiperAndGoToLast() {
    if (!this.swiper) return;

    requestAnimationFrame(() => {
      this.swiper!.update();

      const lastIndex = this.swiper!.slides.length - 1;
      if (lastIndex >= 0) {
        this.currentSlide.set(lastIndex);
        this.swiper!.slideTo(lastIndex, 0);
      }
    });
  }

  goToSlide(index: number) {
    if (!this.swiper) return;

    this.refreshSwiper(index);
  }

  ionViewWillEnter(): void {
    if (this.eventData && this.isModalMode) {
      this.eventForm().patchValue(this.eventData as any);
      this.selectedMetaTags.set(new Set(this.eventData.meta_tags as string[]));
      this.tickets.set(this.eventData.tickets as Ticket[]);
      this.promoCodes.set(this.eventData.promo_codes as PromoCode[]);
      this.co_hosts.set(this.eventData.co_hosts as User[]);
      this.sponsors.set(this.eventData.sponsors as User[]);
      this.speakers.set(this.eventData.speakers as User[]);
      this.visibility.set(this.eventData.visibility as 'public' | 'invite-only');
      this.repeatingEvents.set(this.eventData.repeating_events as any[]);
      this.customRepeatCount.set(this.eventData.custom_repeat_count as number);
    } else {
      const currentDate = this.getTodayDate();
      const currentTime = this.getCurrentTime();

      this.eventForm().patchValue({
        date: currentDate,
        start_time: currentTime,
        category: 'business',
        visibility: 'public'
      });
    }
    this.eventForm()
      .get('start_time')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.eventForm().get('end_time')?.setValue(this.addMinutesToTime(value, 30));
        }
      });

    this.eventForm()
      .get('repeat_count')
      ?.valueChanges.subscribe(() => {
        this.generateRepeatingEvents();
      });

    this.eventForm()
      .get('custom_repeat_count')
      ?.valueChanges.subscribe((value) => {
        this.eventForm().patchValue({ repeat_count: value });
      });
  }

  async openNetworkTagModal() {
    const form = this.eventForm();
    const metaTagsControl = form.get('meta_tags');
    const currentSelected = metaTagsControl?.value || [];

    const data = await this.modalService.openNetworkTagModal(this.metaTagOptions(), currentSelected);
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
    return this.metaTagOptions().find((tag) => tag.value === value);
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins, 0, 0);
    date.setMinutes(date.getMinutes() + minutes);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  get isMetaTagsInvalid(): boolean {
    const form = this.eventForm();
    const metaTagsControl = form.get('meta_tags');
    return !!(metaTagsControl?.invalid && metaTagsControl?.touched);
  }

  getFieldValue<T>(field: string): T | null {
    return this.eventForm().get(field)?.value ?? null;
  }

  getSectionQuestions(type: string) {
    return (this.getFieldValue('questionnaire') as any)?.[type] ?? [];
  }

  hasQuestions(type: string): boolean {
    return this.getSectionQuestions(type).length > 0;
  }

  generateDescription(): void {
    const form = this.eventForm();
    const descriptionControl = form.get('description');

    if (descriptionControl) {
      const generatedDescription =
        '<p>This is a generated event description. You can customize this content to better match your event details and requirements.</p>';
      descriptionControl.setValue(generatedDescription);
      descriptionControl.markAsTouched();

      const tempDiv = this.document.createElement('div');
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
    const data = await this.modalService.openAIPromptModal(this.conversation(), true);

    if (data) {
      if (data.type === 'value' && data.data) {
        this.eventForm().get('description')?.setValue(data.data);
      } else if (data.type === 'data' && data.data) {
        this.conversation.set(data.data);
      }
    }
  }

  deleteMedia(index: number) {
    this.mediaItems.update((items) => {
      items.splice(index, 1);
      return [...items];
    });

    this.refreshSwiper(index - 1);
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.mediaItems(), event.previousIndex, event.currentIndex);
  }

  reorderMedia(event: any) {
    const items = [...this.mediaItems()];
    const [moved] = items.splice(event.detail.from, 1);
    items.splice(event.detail.to, 0, moved);
    this.mediaItems.set(items);
    event.detail.complete();
  }

  onBrowseFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    const newItems = files.map((file) => ({
      id: crypto.randomUUID(),
      type: file.type.startsWith('video') ? 'video' : 'image',
      file,
      url: URL.createObjectURL(file)
    }));

    this.mediaItems.update((list) => [...list, ...newItems]);
    input.value = '';

    this.refreshSwiperAndGoToLast();
  }

  toArray(value: string | string[]): string[] {
    return Array.isArray(value) ? value : [value];
  }

  async openNetworkedGallery(): Promise<void> {
    const data = await this.modalService.openImageGalleryModal();
    if (!data) return;

    const urls = this.toArray(data);

    const items = urls.map((url) => ({
      id: crypto.randomUUID(),
      type: 'image',
      url
    }));

    this.mediaItems.update((list) => [...list, ...items]);
    this.refreshSwiperAndGoToLast();
  }

  async openNetworkedGIFs(): Promise<void> {
    const data = await this.modalService.openGifGalleryModal();
    if (!data) return;

    const urls = this.toArray(data);

    const items: any[] = urls.map((url) => ({
      id: crypto.randomUUID(),
      type: 'image',
      url
    }));

    this.mediaItems.update((list) => [...list, ...items]);
    this.refreshSwiperAndGoToLast();
  }

  handleTicketReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const reorderedTickets = event.detail.complete([...this.tickets()]);
    this.tickets.set(reorderedTickets);
    this.eventForm().get('tickets')?.setValue(reorderedTickets);
    event.detail.complete();
  }

  async openTicketModal(ticketType: 'free' | 'paid' | 'early-bird' | 'sponsor' | 'standard', initialData?: Partial<TicketFormData>) {
    const eventDate = this.eventForm().get('date')?.value || null;
    const eventStartTime = this.eventForm().get('start_time')?.value || null;
    const result = await this.modalService.openTicketModal(ticketType, initialData, eventDate, eventStartTime);

    if (result && result.role === 'save' && result.data) {
      const data = result.data;
      const ticketData: Ticket = {
        id: initialData ? (initialData as any).id : `ticket-${Date.now()}`,
        name: data.name,
        ticket_type: data.ticket_type,
        is_free_ticket: data.ticket_type === 'free',
        price: data.ticket_type === 'free' ? '$0.00' : `$${parseFloat(data.price).toFixed(2)}`,
        quantity: data.quantity,
        description: data.description || null,
        sale_start_date: data.sale_start_date || null,
        sale_end_date: data.sale_end_date || null,
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
        sale_start_date: ticket.sale_start_date || null,
        sale_end_date: ticket.sale_end_date || null,
        end_sale_on_event_start: ticket.end_sale_on_event_start ?? true,
        ticket_type: ticket.ticket_type
      };
      await this.openTicketModal(ticket.ticket_type, ticketData);
    }
  }

  async deleteTicket(index: number) {
    const confirmed = await this.confirmDelete('This ticket will be removed permanently.');

    if (!confirmed) return;

    const currentTickets = [...this.tickets()];
    currentTickets.splice(index, 1);

    this.tickets.set(currentTickets);
    this.eventForm().get('tickets')?.setValue(currentTickets);
  }

  async createFreeTicket() {
    await this.openTicketModal('free');
  }

  async createPaidTicket() {
    // if (!this.isStripeAccountSetup()) {
    //   this.promptStripeSignup();
    //   return;
    // }

    const ticketType = await this.modalService.openTicketTypeModal();

    if (ticketType) {
      await this.openTicketModal(ticketType);
    }
  }

  async promptStripeSignup() {
    const result = await this.modalService.openConfirmModal({
      icon: 'assets/svg/payoutIcon.svg',
      iconBgColor: '#9E0A0A',
      title: 'Add Payout Details',
      description: 'To accept ticket sales in app, you must setup your payout details with Stripe.',
      confirmButtonLabel: 'Connect Payment',
      cancelButtonLabel: 'Maybe Later',
      confirmButtonColor: 'primary'
    });

    if (result && result.role === 'confirm' && result.data) {
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

  async confirmDelete(message: string): Promise<boolean> {
    const result = await this.modalService.openConfirmModal({
      icon: 'assets/svg/deleteWhiteIcon.svg',
      iconBgColor: '#C73838',
      title: 'Delete Confirmation',
      description: message,
      confirmButtonLabel: 'Delete',
      cancelButtonLabel: 'Cancel',
      confirmButtonColor: 'danger',
      iconPosition: 'left'
    });

    return result && result.role === 'confirm' ? true : false;
  }

  async openPromoCodeModal(initialData?: Partial<PromoCodeFormData>) {
    const result = await this.modalService.openPromoCodeModal(initialData);

    if (result && result.role === 'save' && result.data) {
      const data = result.data;
      const promoData: PromoCode = {
        promoCode: data.promoCode,
        promotion_type: data.promotion_type,
        promoPresent: data.promoPresent,
        capped_amount: data.capped_amount || null,
        redemption_limit: data.redemption_limit || null,
        max_use_per_user: data.max_use_per_user || 1
      };

      if (this.editingPromoIndex() !== null) {
        const currentPromoCodes = [...this.promoCodes()];
        currentPromoCodes[this.editingPromoIndex()!] = promoData;
        this.promoCodes.set(currentPromoCodes);
        this.editingPromoIndex.set(null);
      } else {
        const currentPromoCodes = [...this.promoCodes()];
        currentPromoCodes.push(promoData);
        this.promoCodes.set(currentPromoCodes);
      }
      this.eventForm().get('promo_codes')?.setValue(this.promoCodes());
    }
  }

  async editPromoCode(index: number) {
    this.editingPromoIndex.set(index);
    const promo = this.promoCodes()[index];
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

  async deletePromoCode(index: number) {
    const confirmed = await this.confirmDelete('This promo code will be deleted.');

    if (!confirmed) return;

    const currentPromoCodes = [...this.promoCodes()];
    currentPromoCodes.splice(index, 1);
    this.promoCodes.set(currentPromoCodes);
    this.eventForm().get('promo_codes')?.setValue(currentPromoCodes);
  }

  async resetPromoForm() {
    this.editingPromoIndex.set(null);
    await this.openPromoCodeModal();
  }

  getPromoCodeOriginalIndex(promo: PromoCode): number {
    return this.promoCodes().findIndex((p) => p === promo);
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    } else if (this.currentStep() === 1 || this.isModalMode) {
      if (this.isModalMode) {
        this.modalService.close();
      } else {
        this.navCtrl.back();
      }
      return;
    }
  }

  handleButtonClick(): void {
    const step = this.currentStep();
    if (this.isModalMode && step === 3) {
      this.saveRepeatingEventChanges();
      return;
    }
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

  async openDateModal(): Promise<void> {
    const form = this.eventForm();
    const currentDate = form.get('date')?.value || '';
    const date = await this.modalService.openDateTimeModal('date', currentDate);
    if (date) {
      form.patchValue({ date });
    }
  }

  async openTimeModal(type: 'start_time' | 'end_time'): Promise<void> {
    const form = this.eventForm();
    const currentTime = form.get(type)?.value || '';

    let min: string | undefined;
    let max: string | undefined;

    if (type === 'end_time') {
      const startTime = form.get('start_time')?.value;
      if (startTime) {
        min = this.addMinutesToTime(startTime, 30);
      }
    }

    const time = await this.modalService.openDateTimeModal('time', currentTime, min, max);

    if (time) {
      if (type === 'start_time') {
        form.patchValue({ start_time: time });
      } else {
        form.patchValue({ end_time: time });
      }
    }
  }

  async openLocationModal(): Promise<void> {
    const { address } = await this.modalService.openLocationModal();
    this.eventForm().patchValue({ address });
  }

  async openEventCategoryModal(): Promise<void> {
    const currentCategory = this.eventForm().get('category')?.value || 'business';
    const category = await this.modalService.openEventCategoryModal(currentCategory);
    this.eventForm().get('category')?.setValue(category);
  }

  onUsersChange(users: User[], field: 'co_hosts' | 'sponsors' | 'speakers') {
    this[field].set(users);

    this.eventForm().patchValue({
      [field]: users.map((u) => u.uid)
    });
  }

  setVisibility(type: 'public' | 'invite-only'): void {
    this.visibility.set(type);
    this.eventForm().patchValue({ visibility: type });
  }

  setPlusCount(count: number): void {
    this.eventForm().patchValue({ plus: count });
  }

  setRepeatFrequency(frequency: 'weekly' | 'monthly' | 'custom'): void {
    this.eventForm().patchValue({ repeat_frequency: frequency });
  }

  handleRepeatCountClick(value: number | 'custom') {
    if (value === 'custom') {
      this.eventForm().patchValue({ repeat_count: 'custom' });
      return;
    }

    this.customRepeatCount.set(null);
    this.eventForm().patchValue({ repeat_count: value });
  }

  onCustomRepeatValueChange(event: any) {
    const val = Number(event?.target?.value || 0);

    this.customRepeatCount.set(val);

    this.eventForm().patchValue({
      repeat_count: val
    });
  }
  generateRepeatingEvents(): void {
    const form = this.eventForm();
    const values = form.getRawValue();

    const { repeat_frequency: frequency, repeat_count: count = 0, date, title, address, start_time, end_time, description } = values;

    const baseDateObj = new Date(date ?? new Date().toISOString().split('T')[0]);
    const events: any[] = [];

    for (let i = 1; i <= (count as number); i++) {
      const eventDate = new Date(baseDateObj);

      if (frequency === 'weekly') {
        eventDate.setDate(baseDateObj.getDate() + (i - 1) * 7);
      } else if (frequency === 'monthly') {
        eventDate.setMonth(baseDateObj.getMonth() + (i - 1));
      }

      events.push({
        ...values,
        id: `repeating-event-${i}-${Date.now()}`,
        eventNumber: i,
        title,
        date: eventDate.toISOString().split('T')[0],
        start_time,
        end_time,
        address,
        description
      });
    }

    this.repeatingEvents.set(events);
    form.patchValue({ repeating_events: events });
  }

  async editRepeatingEvent(event: any): Promise<void> {
    const result = await this.modalService.openRepeatingEventModal(event);
    if (!result || result.role !== 'save') return;

    const updatedEvents = this.repeatingEvents().map((e) => (e.id === event.id ? { ...e, ...result.data } : e));

    this.repeatingEvents.set(updatedEvents);
    this.eventForm().patchValue({ repeating_events: updatedEvents });
  }

  async deleteRepeatingEvent(eventId: string) {
    const confirmed = await this.confirmDelete('This event occurrence will be permanently removed.');
    if (!confirmed) return;

    const updatedEvents = this.repeatingEvents().filter((e) => e.id !== eventId);

    this.repeatingEvents.set(updatedEvents);
    this.eventForm().patchValue({
      repeating_events: updatedEvents,
      repeat_count: updatedEvents.length || null
    });
  }

  async saveRepeatingEventChanges(): Promise<void> {
    if (this.isModalMode) {
      this.isModalMode = false;
      this.modalCtrl.dismiss(this.eventForm().value, 'save');
      return;
    }
    this.modalService.close();
  }

  async openQuestionnaireModal(type: 'pre_event' | 'post_event') {
    const form = this.eventForm();
    const current = form.get('questionnaire')?.value ?? {};

    const existing = current[type] ?? [];

    const result = await this.modalService.openQuestionnaireModal(type, existing);

    if (!result) return;

    const updated = {
      ...current,
      [type]: result.questions ?? []
    };

    form.patchValue({ questionnaire: updated });
    this.cd.detectChanges();
  }

  async deleteEventQuestionnaire(sectionType: 'pre_event' | 'post_event') {
    const confirm = await this.confirmDelete(
      sectionType === 'pre_event'
        ? 'Are you sure you want to delete all Pre-Event questions?'
        : 'Are you sure you want to delete all Post-Event questions?'
    );

    if (!confirm) return;

    const current = this.eventForm().get('questionnaire')?.value || {};
    const updated = {
      ...current,
      pre_event: sectionType === 'pre_event' ? [] : current.pre_event || [],
      post_event: sectionType === 'post_event' ? [] : current.post_event || []
    };

    this.eventForm().get('questionnaire')?.setValue(updated);
    this.cd.detectChanges();
  }

  cancelModal(): void {
    this.modalService.close();
  }

  async createEvent() {
    console.log(this.eventForm().value);
    return;
  }

  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null!;
    }
  }
}
