import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '@/services/auth.service';
import { EventService } from '@/services/event.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MediaService } from '@/services/media.service';
import { ModalService } from '@/services/modal.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '@/services/toaster.service';
import { BaseApiService } from '@/services/base-api.service';
import { EventDisplay } from '@/components/common/event-display';
import { NavigationService } from '@/services/navigation.service';
import { EventDetails } from '@/pages/event/components/event-details';
import { EventTickets } from '@/pages/event/components/event-tickets';
import { SegmentButtonItem } from '@/components/common/segment-button';
import { EventSettings } from '@/pages/event/components/event-settings';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonHeader, IonFooter, IonContent, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { Ticket, PromoCode, EventForm, EventDisplayData, RepeatingFrequencyType, SubscriptionPlan } from '@/interfaces/event';
import { Input, signal, inject, computed, Component, ChangeDetectionStrategy, ViewChild, OnInit, OnDestroy, effect } from '@angular/core';

const EVENT_STEPS = {
  EVENT_DETAILS: 1,
  EVENT_TICKETS: 2,
  EVENT_SETTINGS: 3,
  EVENT_PREVIEW: 4
};

@Component({
  imports: [
    Button,
    IonHeader,
    IonFooter,
    IonToolbar,
    IonContent,
    CommonModule,
    EventDetails,
    EventTickets,
    EventSettings,
    EventDisplay,
    DragDropModule,
    CheckboxModule,
    InputTextModule,
    ReactiveFormsModule
  ],
  selector: 'create-event',
  styleUrl: './create-event.scss',
  templateUrl: './create-event.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateEvent implements OnInit, OnDestroy {
  @ViewChild(EventTickets) eventTickets!: EventTickets;

  // inputs
  @Input() isModalMode: boolean = false;
  @Input() eventData: any | null = null;

  // services
  fb = inject(FormBuilder);
  router = inject(Router);
  route = inject(ActivatedRoute);
  modalService = inject(ModalService);
  modalCtrl = inject(ModalController);
  navigationService = inject(NavigationService);
  mediaService = inject(MediaService);
  eventService = inject(EventService);
  toasterService = inject(ToasterService);
  authService = inject(AuthService);

  // subscriptions
  queryParamsSubscription!: Subscription;
  previewFormValueSubscription?: Subscription;

  // signals
  eventForm = signal<FormGroup<EventForm>>(
    this.fb.group<EventForm>({
      medias: this.fb.control<(string | File)[] | null>(null),
      until_finished: this.fb.control<boolean>(false),
      vibes: this.fb.control<string[]>([], [Validators.required]),
      category_id: this.fb.control<string | null>(null),
      category: this.fb.control<string | null>(null),
      address: this.fb.control<string | null>(null, [Validators.required]),
      latitude: this.fb.control<string | null>(null),
      longitude: this.fb.control<string | null>(null),
      city: this.fb.control<string | null>(null),
      state: this.fb.control<string | null>(null),
      country: this.fb.control<string | null>(null),
      tickets: this.fb.control<Ticket[] | null>([]),
      promo_codes: this.fb.control<PromoCode[] | null>([]),
      is_subscription: this.fb.control<boolean | null>(false),
      subscription_plan: this.fb.control<string | null>(null),
      host_pays_platform_fee: this.fb.control<boolean | null>(false),
      guest_fee_enabled: this.fb.control<boolean | null>(false),
      additional_fees: this.fb.control<string | null>(''),
      participants: this.fb.control<Array<{ user_id: string; role: string; thumbnail_url?: string; name?: string }> | null>([]),
      is_public: this.fb.control<boolean | null>(true),
      max_attendees_per_user: this.fb.control<number | null>(null),
      allow_plus_ones: this.fb.control<boolean | null>(false),
      is_repeating_event: this.fb.control<boolean | null>(false),
      repeating_frequency: this.fb.control<RepeatingFrequencyType | null>('weekly'),
      repeat_count: this.fb.control<number | 'custom' | null>(null),
      repeating_events: this.fb.control<any[] | null>([]),
      custom_repeat_count: this.fb.control<number | null>(null),
      questionnaire: this.fb.control<any | null>(null)
    })
  );

  isLoading = signal(false);
  isCreating = signal(false);
  isEditMode = signal(false);
  isSubmitted = signal(false);
  isUploadingMedia = signal(false);
  selectedDate = signal<string>('');
  previewFormChangeTrigger = signal(0);
  steps = signal<number[]>([1, 2, 3, 4]);
  editingEventId = signal<string | null>(null);
  storedPlans = signal<SubscriptionPlan[]>([]);
  currentStep = signal<number>(EVENT_STEPS.EVENT_DETAILS);

  step1Fields = ['title', 'date', 'address', 'category_id', 'description', 'vibes', 'start_time', 'end_time', 'until_finished'];
  step2Fields = ['tickets', 'promo_codes', 'is_subscription', 'subscription_plan', 'host_pays_platform_fee', 'additional_fees'];

  stepHeading = computed(() => {
    const stepHeadings: Record<number, string> = {
      [EVENT_STEPS.EVENT_DETAILS]: 'Event Details',
      [EVENT_STEPS.EVENT_TICKETS]: 'Event Tickets',
      [EVENT_STEPS.EVENT_SETTINGS]: 'Event Settings',
      [EVENT_STEPS.EVENT_PREVIEW]: 'Event Preview'
    };
    return stepHeadings[this.currentStep()] || 'Event Details';
  });

  buttonLabel = computed(() => {
    if (this.isUploadingMedia()) {
      return 'Uploading media...';
    }
    if (this.isCreating()) {
      return 'Saving event data...';
    }
    const labels: Record<number, string> = {
      [EVENT_STEPS.EVENT_DETAILS]: 'Setup Tickets',
      [EVENT_STEPS.EVENT_TICKETS]: 'Event Settings',
      [EVENT_STEPS.EVENT_SETTINGS]: 'Preview Before Publishing',
      [EVENT_STEPS.EVENT_PREVIEW]: this.isEditMode() ? 'Republish Event' : 'Publish Event'
    };
    return labels[this.currentStep()] || 'Next';
  });

  isButtonDisabled = computed(() => {
    return this.isUploadingMedia() || this.isCreating();
  });

  buttonIcon = computed(() => {
    if (this.isUploadingMedia() || this.isCreating()) {
      return '';
    }
    const step = this.currentStep();
    return step === EVENT_STEPS.EVENT_PREVIEW ? 'pi-check' : 'pi-arrow-right';
  });

  iconPos = computed(() => {
    return this.currentStep() === EVENT_STEPS.EVENT_PREVIEW ? 'left' : 'right';
  });

  hasQuestionnaire = computed(() => {
    this.previewFormChangeTrigger();
    const selectedEvent = this.selectedEventData();
    const questionnaire = selectedEvent?.questionnaire || this.eventForm().get('questionnaire')?.value;
    return questionnaire && Array.isArray(questionnaire) && questionnaire.length > 0;
  });

  repeatingEvents = computed(() => {
    this.previewFormChangeTrigger();
    return this.eventForm().get('repeating_events')?.value || [];
  });

  isRepeatingEvent = computed(() => {
    this.previewFormChangeTrigger();
    const isRepeating = this.eventForm().get('is_repeating_event')?.value ?? false;
    const repeating = this.repeatingEvents();
    return isRepeating || (Array.isArray(repeating) && repeating.length > 0);
  });

  baseEventDate = computed(() => {
    this.previewFormChangeTrigger();
    return this.eventForm().get('date')?.value || '';
  });

  selectedEventData = computed(() => {
    const selected = this.selectedDate();
    const repeating = this.repeatingEvents();
    const baseDate = this.baseEventDate();
    if (selected && baseDate) {
      const baseDateKey = this.eventService.formatDateKey(baseDate);
      if (baseDateKey === selected) {
        return null;
      }
    }

    if (selected && repeating && repeating.length > 0) {
      const event = repeating.find((e: any) => {
        const dateStr = e.date;
        return dateStr ? this.eventService.formatDateKey(dateStr) === selected : false;
      });
      if (event) {
        return event;
      }
    }

    return null;
  });

  eventDate = computed(() => {
    const selectedEvent = this.selectedEventData();
    if (selectedEvent?.date) {
      return selectedEvent.date;
    }

    const selectedDateStr = this.selectedDate();
    if (selectedDateStr) {
      const [month, day] = selectedDateStr.split('/');
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return this.baseEventDate();
  });

  participants = computed(() => {
    this.previewFormChangeTrigger();
    const selectedEvent = this.selectedEventData();
    return selectedEvent?.participants || this.eventForm().get('participants')?.value || [];
  });

  formattedLocation = computed(() => {
    this.previewFormChangeTrigger();
    const selectedEvent = this.selectedEventData();
    const form = this.eventForm();
    const address = selectedEvent?.address || form.get('address')?.value || '';
    const city = selectedEvent?.city || form.get('city')?.value || '';
    const state = selectedEvent?.state || form.get('state')?.value || '';
    const country = selectedEvent?.country || form.get('country')?.value || '';
    return this.eventService.formatLocation(address, city, state, country);
  });

  userSections = computed(() => {
    this.previewFormChangeTrigger();
    const participants = this.participants();
    if (!participants || !Array.isArray(participants)) return [];

    return this.eventService.getUserSections(participants, []);
  });

  dateItems = computed<SegmentButtonItem[]>(() => {
    return this.eventService.createDateItemsFromForm(this.repeatingEvents(), this.baseEventDate(), this.isRepeatingEvent());
  });

  eventDisplayData = computed<Partial<EventDisplayData>>(() => {
    this.previewFormChangeTrigger();
    const form = this.eventForm();
    const selectedEvent = this.selectedEventData();

    const rawMedias = selectedEvent?.medias || form.get('medias')?.value || [];
    const medias = this.eventService.formatMedias(rawMedias);

    const title = selectedEvent?.title || form.get('title')?.value || '';
    const description = selectedEvent?.description || form.get('description')?.value || '';
    const eventDate = selectedEvent?.date || this.eventForm().get('date')?.value;
    const startTime = selectedEvent?.start_time || form.get('start_time')?.value || '';
    const endTime = selectedEvent?.end_time || form.get('end_time')?.value || '';
    const untilFinished = selectedEvent?.until_finished ?? form.get('until_finished')?.value ?? false;
    const tickets = selectedEvent?.tickets || form.get('tickets')?.value || [];
    const isPublic = selectedEvent?.is_public ?? form.get('is_public')?.value ?? true;

    let formattedDateTime = '';
    if (eventDate && startTime) {
      const dateTimeStr = this.eventService.combineDateAndTime(eventDate, startTime);
      if (dateTimeStr) {
        const endDateTimeStr = untilFinished ? null : endTime ? this.eventService.combineDateAndTime(eventDate, endTime) : null;
        formattedDateTime = this.eventService.formatDateTime(dateTimeStr, endDateTimeStr || undefined);
      }
    }

    const latValue = form.get('latitude')?.value;
    const lngValue = form.get('longitude')?.value;
    const lat = latValue !== null && latValue !== undefined && latValue !== '' ? parseFloat(String(latValue)) : null;
    const lng = lngValue !== null && lngValue !== undefined && lngValue !== '' ? parseFloat(String(lngValue)) : null;
    
    const mapCenter: [number, number] | null = 
      lat !== null && !isNaN(lat) && lng !== null && !isNaN(lng) && isFinite(lat) && isFinite(lng)
        ? [lng, lat] 
        : null;

    const participants = this.participants();
    const host = Array.isArray(participants) ? participants.find((p: any) => p.role === 'Host') : null;
    const hostName = host?.name || host?.user?.name || null;

    const thumbnailMedia = medias.find((m: any) => m.order === 1) || medias[0];
    const thumbnailUrl = thumbnailMedia?.url || '';

    const displayMedias = medias.filter((media: any, index: number) => {
        if (media.order === 1) return false;
      if (!media.order && index === 0 && media.url === thumbnailUrl) return false;
      return true;
    });

    return {
      thumbnail_url: thumbnailUrl,
      title,
      description,
      displayMedias: displayMedias,
      views: '0',
      isPublic,
      location: this.formattedLocation(),
      hostName,
      mapCenter,
      admission: this.eventService.formatAdmission(tickets),
      formattedDateTime,
      userSections: this.userSections(),
      isRepeatingEvent: this.isRepeatingEvent(),
      dateItems: this.dateItems()
    };
  });

  onDateChange(date: string): void {
    this.selectedDate.set(date);
  }

  constructor() {
    effect(() => {
      const items = this.dateItems();
      if (items.length > 0 && !this.selectedDate()) {
        this.selectedDate.set(items[0].value);
      }
    });
  }

  ngOnInit(): void {
    if (this.isModalMode) {
      return;
    }

    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.editingEventId.set(eventId);
      this.isEditMode.set(true);
      this.loadEventForEdit();
    }

    const initialStep = this.route.snapshot.queryParams['step'];
    if (initialStep) {
      const step = parseInt(initialStep, 10);
      if (this.steps().includes(step)) {
        this.currentStep.set(step);
      }
    }

    this.queryParamsSubscription = this.route.queryParamMap.subscribe((params) => {
      const currentStep = params.get('step');
      if (!currentStep) return;

      const requestedStep = parseInt(currentStep, 10);
      if (this.steps().includes(requestedStep) && requestedStep !== this.currentStep()) {
        this.currentStep.set(requestedStep);
      }
    });
  }

  async ionViewWillEnter(): Promise<void> {
    const form = this.eventForm();
    const currentUser = this.authService.currentUser();

    if (this.eventData && this.isModalMode) {
      form.patchValue(this.eventData as any);
    } else if (this.isEditMode() && this.editingEventId()) {
      await this.loadEventForEdit();
    } else {
      const defaultParticipants: Array<{ user_id: string; role: string; thumbnail_url?: string; name?: string }> = [];

      if (currentUser?.id) {
        defaultParticipants.push({
          user_id: currentUser.id,
          role: 'Host',
          thumbnail_url: currentUser.thumbnail_url,
          name: currentUser.name
        });
      }

      form.patchValue({
        date: this.getTodayDate(),
        start_time: this.getCurrentTime(),
        is_public: true,
        participants: defaultParticipants
      });
    }

    form.get('start_time')?.valueChanges.subscribe((value) => {
      if (value) {
        const endTimeControl = form.get('end_time');
        const currentEndTime = endTimeControl?.value;

        if (!currentEndTime || this.isTimeAfter(value, currentEndTime)) {
          endTimeControl?.setValue(this.addMinutesToTime(value, 30));
        }
      }
    });

    form.get('custom_repeat_count')?.valueChanges.subscribe((value) => {
      if (value) {
        form.patchValue({ repeat_count: value });
        this.generateRepeatingEventsIfReady();
      }
    });

    form.get('until_finished')?.valueChanges.subscribe((value) => {
      const endTimeControl = form.get('end_time');
      value ? endTimeControl?.disable() : endTimeControl?.enable();
    });

    form.get('is_repeating_event')?.valueChanges.subscribe((value) => {
      if (!value) {
        form.patchValue({
          repeating_events: [],
          repeating_frequency: null,
          repeat_count: null,
          custom_repeat_count: null
        });
      }
    });

    this.previewFormValueSubscription = form.valueChanges.subscribe(() => {
      this.previewFormChangeTrigger.update((v) => v + 1);
    });
  }

  async loadEventForEdit(): Promise<void> {
    const eventId = this.editingEventId();
    if (!eventId) return;

    try {
      this.isLoading.set(true);
      const eventData = await this.eventService.getEventById(eventId);

      if (eventData) {
        const formData = this.eventService.transformEventDataToForm(eventData);
        this.eventForm().patchValue(formData);
      }
    } catch (error) {
      const errorMessage = BaseApiService.getErrorMessage(error, 'Failed to load event data.');
      this.toasterService.showError(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  getFieldValue<T>(field: string): T | null {
    return this.eventForm().get(field)?.value ?? null;
  }

  get tickets(): any[] {
    this.previewFormChangeTrigger();
    return this.eventForm().get('tickets')?.value ?? [];
  }

  getTodayDate(): string {
    return this.eventService.getTodayDate();
  }

  getCurrentTime(): string {
    return this.eventService.getCurrentTime();
  }

  addMinutesToTime(time: string, minutes: number): string {
    return this.eventService.addMinutesToTime(time, minutes);
  }

  isTimeAfter(time1: string, time2: string): boolean {
    return this.eventService.isTimeAfter(time1, time2);
  }

  previousStep(): void {
    if (this.currentStep() === EVENT_STEPS.EVENT_DETAILS) {
      if (this.isModalMode) {
        this.modalService.close();
      } else {
        this.navigationService.back();
      }
    } else {
      const previousStep = this.currentStep() - 1;
      this.navigateToStep(previousStep);
    }
  }

  navigateToStep(step: number): void {
    this.currentStep.set(step);

    if (!this.isModalMode) {
      this.router.navigate([], {
        queryParams: { step },
        relativeTo: this.route,
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  }

  handleButtonClick(): void {
    const step = this.currentStep();
    if (this.isModalMode && step === EVENT_STEPS.EVENT_SETTINGS) {
      this.saveRepeatingEventChanges();
      return;
    }
    if (step === EVENT_STEPS.EVENT_PREVIEW) {
      this.createEvent();
    } else {
      this.nextStep();
    }
  }

  validateFields(fieldNames: string[]): boolean {
    this.isSubmitted.set(true);
    const form = this.eventForm();
    const isValid = fieldNames.every((field) => {
      const control = form.get(field);
      return control ? control.disabled || control.valid : false;
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
    if (this.currentStep() === EVENT_STEPS.EVENT_DETAILS) {
      const form = this.eventForm();
      const untilFinished = form.get('until_finished')?.value;
      const fieldsToValidate = untilFinished ? this.step1Fields.filter((field) => field !== 'end_time') : this.step1Fields;

      if (!this.validateFields(fieldsToValidate)) {
        return;
      }

      const mediaItems = this.getFieldValue<Array<{ id: string; type: string; file?: File; url: string }>>('medias') || [];
      if (mediaItems.length === 0 || (mediaItems[0].type !== 'image' && mediaItems[0].type !== 'gif')) {
        return;
      }

      this.navigateToStep(EVENT_STEPS.EVENT_TICKETS);
    } else if (this.currentStep() === EVENT_STEPS.EVENT_TICKETS) {
      const tickets = this.getFieldValue<Ticket[]>('tickets') || [];
      if (tickets.length === 0) {
        return;
      }
      this.navigateToStep(EVENT_STEPS.EVENT_SETTINGS);
    } else if (this.currentStep() === EVENT_STEPS.EVENT_SETTINGS) {
      this.navigateToStep(EVENT_STEPS.EVENT_PREVIEW);
    }
  }

  async saveRepeatingEventChanges(): Promise<void> {
    if (this.isModalMode) {
      this.isModalMode = false;
      this.modalCtrl.dismiss(this.eventForm().value, 'save');
      return;
    }
    this.modalService.close();
  }

  cancelModal(): void {
    this.modalService.close();
  }

  generateRepeatingEventsIfReady(): void {
    const form = this.eventForm();
    const frequency = form.get('repeating_frequency')?.value;
    const count = form.get('repeat_count')?.value;
    const customCount = form.get('custom_repeat_count')?.value;

    if (!frequency || !count) {
      return;
    }

    const finalCount = count === 'custom' ? customCount || 0 : count;
    if (finalCount <= 0) {
      return;
    }
    this.generateRepeatingEvents();
  }

  generateRepeatingEvents(): void {
    const form = this.eventForm();
    const values = form.getRawValue();
    const { repeating_frequency: frequency, repeat_count: count, custom_repeat_count: customCount, date } = values;

    const finalCount = count === 'custom' ? customCount || 0 : count || 0;
    if (finalCount <= 0) {
      return;
    }

    const baseDateObj = new Date(date ?? this.getTodayDate());
    const events: Array<Record<string, unknown>> = [];

    for (let i = 2; i <= finalCount; i++) {
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
        date: eventDate.toISOString().split('T')[0]
      });
    }

    form.patchValue({ repeating_events: events });
  }

  async uploadAndFormatMedia(mediaItems: Array<{ id: string; type: string; file?: File; url: string }>): Promise<any[]> {
    if (mediaItems.length === 0) {
      return [];
    }

    const filesToUpload: Array<{ file: File; originalIndex: number }> = [];
    mediaItems.forEach((item, index) => {
      if (item.file) {
        filesToUpload.push({ file: item.file, originalIndex: index });
      }
    });

    const uploadedUrls = new Map<number, string>();

    if (filesToUpload.length > 0) {
      this.isUploadingMedia.set(true);
      try {
        const files = filesToUpload.map((f) => f.file);
        const uploadResponse = await this.mediaService.uploadMedia('Event', files);

        if (uploadResponse?.data) {
          if (Array.isArray(uploadResponse.data)) {
            uploadResponse.data.forEach((media: any, index: number) => {
              const originalIndex = filesToUpload[index].originalIndex;
              uploadedUrls.set(originalIndex, media.url || media.media_url || media.path);
            });
          } else if (typeof uploadResponse.data === 'object') {
            const originalIndex = filesToUpload[0].originalIndex;
            uploadedUrls.set(originalIndex, uploadResponse.data.url || uploadResponse.data.media_url || uploadResponse.data.path);
          }
        }
      } finally {
        this.isUploadingMedia.set(false);
      }
    }

    return mediaItems.map((item, index) => ({
      media_url: uploadedUrls.get(index) ?? item.url,
      media_type: item.type === 'image' ? 'Image' : 'Video',
      order: index + 1
    }));
  }

  async createEvent(): Promise<void> {
    if (this.isCreating()) return;

    try {
      this.isCreating.set(true);
      const form = this.eventForm();
      const formData = form.getRawValue();

      // Prepare common data
      const mediaItems = this.getFieldValue<Array<{ id: string; type: string; file?: File; url: string }>>('medias') || [];
      const eventDate = formData.date ?? null;
      const eventStartTime = formData.start_time ?? null;
      const eventEndTime = formData.end_time ?? null;
      const untilFinished = formData.until_finished;

      // Format common data
      const mediasWithOrder = await this.uploadAndFormatMedia(mediaItems);
      const startDate = this.eventService.combineDateAndTime(eventDate, eventStartTime);
      const endDate = untilFinished ? null : this.eventService.combineDateAndTime(eventDate, eventEndTime);
      const formattedTickets = this.eventService.formatTickets(formData.tickets || [], eventDate, eventStartTime);
      const formattedPromoCodes = this.eventService.formatPromoCodes(formData.promo_codes || []);
      const formattedQuestionnaire = this.eventService.formatQuestionnaire(formData.questionnaire || []);
      const settings = this.eventService.buildEventSettings(formData);

      // Handle edit mode
      if (this.isEditMode() && this.editingEventId()) {
        await this.updateEvent(mediasWithOrder, startDate, endDate, formattedTickets, formattedPromoCodes, formattedQuestionnaire, settings);
        return;
      }

      // Handle create mode
      const eventsToCreate = await this.prepareEventsToCreate(
        formData,
        mediaItems,
        mediasWithOrder,
        eventDate,
        eventStartTime,
        eventEndTime,
        untilFinished,
        formattedTickets,
        formattedPromoCodes,
        formattedQuestionnaire,
        settings
      );

      await this.createEvents(eventsToCreate);
    } catch (error) {
      const errorMessage = BaseApiService.getErrorMessage(error, 'Failed to create event. Please try again.');
      this.toasterService.showError(errorMessage);
    } finally {
      this.isCreating.set(false);
    }
  }

  private async updateEvent(
    mediasWithOrder: any[],
    startDate: string | null,
    endDate: string | null,
    formattedTickets: any[],
    formattedPromoCodes: any[],
    formattedQuestionnaire: any[],
    settings: any
  ): Promise<void> {
    const form = this.eventForm();
    const formData = form.getRawValue();

    const eventPayload = this.eventService.cleanupEventPayload(
      {
        ...formData,
        medias: mediasWithOrder,
        start_date: startDate,
        end_date: endDate,
        tickets: formattedTickets,
        promo_codes: formattedPromoCodes,
        questionnaire: formattedQuestionnaire
      },
      settings
    );

    const response = await this.eventService.updateEvent(this.editingEventId()!, eventPayload);
    this.toasterService.showSuccess('Event updated successfully!');

    if (this.isModalMode) {
      this.modalCtrl.dismiss(response, 'updated');
    } else {
      this.router
        .navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        })
        .then(() => this.navigationService.back());
    }
  }

  private async prepareEventsToCreate(
    formData: any,
    mediaItems: Array<{ id: string; type: string; file?: File; url: string }>,
    mediasWithOrder: any[],
    eventDate: string | null,
    eventStartTime: string | null,
    eventEndTime: string | null,
    untilFinished: boolean | null | undefined,
    formattedTickets: any[],
    formattedPromoCodes: any[],
    formattedQuestionnaire: any[],
    settings: any
  ): Promise<any[]> {
    const repeatingEvents = formData.repeating_events || [];

    // Create main event from form data
    const mainEventPayload = this.eventService.cleanupEventPayload(
      {
        ...formData,
        medias: mediasWithOrder,
        start_date: this.eventService.combineDateAndTime(eventDate, eventStartTime),
        end_date: untilFinished ? null : this.eventService.combineDateAndTime(eventDate, eventEndTime),
        tickets: formattedTickets,
        promo_codes: formattedPromoCodes,
        questionnaire: formattedQuestionnaire
      },
      settings
    );

    // If no repeating events, return only main event
    if (repeatingEvents.length === 0) {
      return [mainEventPayload];
    }

    // Create repeating events
    const repeatingEventPayloads = await Promise.all(
      repeatingEvents.map(async (repeatingEvent: any) => {
        const repeatingEventDate = repeatingEvent.date || eventDate;
        const repeatingStartDate = this.eventService.combineDateAndTime(repeatingEventDate ?? null, eventStartTime);
        const repeatingEndDate = untilFinished ? null : this.eventService.combineDateAndTime(repeatingEventDate ?? null, eventEndTime);
        const repeatingMediaItems = Array.isArray(repeatingEvent.medias) && repeatingEvent.medias.length > 0 ? repeatingEvent.medias : mediaItems;
        const repeatingMediasWithOrder = await this.uploadAndFormatMedia(repeatingMediaItems);

        return this.eventService.cleanupEventPayload(
          {
            ...repeatingEvent,
            medias: repeatingMediasWithOrder,
            start_date: repeatingStartDate,
            end_date: repeatingEndDate,
            tickets: formattedTickets,
            promo_codes: formattedPromoCodes,
            questionnaire: formattedQuestionnaire
          },
          settings
        );
      })
    );

    // Return main event first, then repeating events
    return [mainEventPayload, ...repeatingEventPayloads];
  }

  private async createEvents(eventsToCreate: any[]): Promise<void> {
    const createResponse = await this.eventService.createEvents(eventsToCreate);
    const successMessage = eventsToCreate.length > 1 ? 'Events created successfully!' : 'Event created successfully!';
    this.toasterService.showSuccess(successMessage);

    if (this.isModalMode) {
      this.modalCtrl.dismiss(createResponse, 'created');
    } else {
      this.router
        .navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        })
        .then(() => this.navigationService.back());
    }
  }

  async openQuestionnairePreview(): Promise<void> {
    const questionnaire = this.selectedEventData()?.questionnaire || this.eventForm().get('questionnaire')?.value;
    if (!questionnaire || questionnaire.length === 0) {
      return;
    }
    await this.modalService.openQuestionnairePreviewModal(questionnaire, true);
  }

  handleConfirmModal = async (message: string): Promise<boolean> => {
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

    return result?.role === 'confirm';
  };

  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
    this.previewFormValueSubscription?.unsubscribe();
  }
}
