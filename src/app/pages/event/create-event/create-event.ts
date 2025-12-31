import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ModalService } from '@/services/modal.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { EventDetails } from '@/pages/event/components/event-details';
import { EventTickets } from '@/pages/event/components/event-tickets';
import { EventSettings } from '@/pages/event/components/event-settings';
import { EventForm, Ticket, PromoCode, SubscriptionPlan } from '@/interfaces/event';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonHeader, IonFooter, IonContent, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { Input, signal, inject, computed, Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';

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
export class CreateEvent {
  @ViewChild(EventTickets) eventTickets!: EventTickets;

  // services
  fb = inject(FormBuilder);
  navCtrl = inject(NavController);
  modalService = inject(ModalService);
  modalCtrl = inject(ModalController);

  // inputs
  @Input() isModalMode: boolean = false;
  @Input() eventData: any | null = null;

  eventForm = signal<FormGroup<EventForm>>(
    this.fb.group<EventForm>({
      medias: this.fb.control<(string | File)[] | null>(null),
      until_finished: this.fb.control<boolean>(false),
      meta_tags: this.fb.control<string[]>([], [Validators.required]),
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

  // signals
  formChangeTrigger = signal(0);
  steps = signal([1, 2, 3, 4]);
  currentStep = signal<number>(EVENT_STEPS.EVENT_DETAILS);
  isSubmitted = signal(false);

  storedPlans = signal<SubscriptionPlan[]>([]);

  step1Fields = ['title', 'date', 'address', 'category', 'description', 'meta_tags', 'start_time', 'end_time', 'until_finished'];
  step2Fields = ['tickets', 'promo_codes', 'is_subscription', 'subscription_plan', 'host_pays_fees', 'additional_fees'];

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
    const labels: Record<number, string> = {
      [EVENT_STEPS.EVENT_DETAILS]: 'Setup Tickets',
      [EVENT_STEPS.EVENT_TICKETS]: 'Event Settings',
      [EVENT_STEPS.EVENT_SETTINGS]: 'Preview Before Publishing',
      [EVENT_STEPS.EVENT_PREVIEW]: 'Publish Event'
    };
    return labels[this.currentStep()] || 'Next';
  });

  buttonIcon = computed(() => {
    const step = this.currentStep();
    return step === EVENT_STEPS.EVENT_PREVIEW ? 'pi-check' : 'pi-arrow-right';
  });

  iconPos = computed(() => {
    return this.currentStep() === EVENT_STEPS.EVENT_PREVIEW ? 'left' : 'right';
  });

  constructor() {
    const form = this.eventForm();
    form.get('until_finished')?.valueChanges.subscribe((value) => {
      const endTimeControl = form.get('end_time');
      value ? endTimeControl?.disable() : endTimeControl?.enable();
    });

    form.get('tickets')?.valueChanges.subscribe(() => {
      this.formChangeTrigger.update((v) => v + 1);
    });
  }

  ionViewWillEnter(): void {
    const form = this.eventForm();

    if (this.eventData && this.isModalMode) {
      form.patchValue(this.eventData as any);
    } else {
      form.patchValue({
        date: this.getTodayDate(),
        start_time: this.getCurrentTime(),
        category: 'business',
        visibility: 'public'
      });
    }

    form.get('start_time')?.valueChanges.subscribe((value) => {
      if (value) {
        form.get('end_time')?.setValue(this.addMinutesToTime(value, 30));
      }
    });

    form.get('custom_repeat_count')?.valueChanges.subscribe((value) => {
      if (value) {
        form.patchValue({ repeat_count: value });
        this.generateRepeatingEventsIfReady();
      }
    });
  }

  getFieldValue<T>(field: string): T | null {
    return this.eventForm().get(field)?.value ?? null;
  }

  get tickets(): any[] {
    this.formChangeTrigger();
    return this.eventForm().get('tickets')?.value ?? [];
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getCurrentTime(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes, 0, 0);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  previousStep(): void {
    if (this.currentStep() === EVENT_STEPS.EVENT_DETAILS) {
      if (this.isModalMode) {
        this.modalService.close();
      } else {
        this.navCtrl.back();
      }
    } else {
      this.currentStep.set(this.currentStep() - 1);
      this.isSubmitted.set(false);
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
      this.currentStep.set(EVENT_STEPS.EVENT_TICKETS);
    } else if (this.currentStep() === EVENT_STEPS.EVENT_TICKETS) {
      const tickets = this.getFieldValue<Ticket[]>('tickets') || [];
      if (tickets.length === 0) {
        return;
      }
      this.currentStep.set(EVENT_STEPS.EVENT_SETTINGS);
    } else if (this.currentStep() === EVENT_STEPS.EVENT_SETTINGS) {
      this.currentStep.set(EVENT_STEPS.EVENT_PREVIEW);
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
    const frequency = form.get('repeat_frequency')?.value;
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
    const { repeat_frequency: frequency, repeat_count: count, custom_repeat_count: customCount, date } = values;

    const finalCount = count === 'custom' ? customCount || 0 : count || 0;
    if (finalCount <= 0) {
      return;
    }

    const baseDateObj = new Date(date ?? this.getTodayDate());
    const events: Array<Record<string, unknown>> = [];

    for (let i = 1; i <= finalCount; i++) {
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

  async createEvent(): Promise<void> {
    const eventData = this.eventForm().getRawValue();
    console.log('Event Data:', eventData);
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

  createTicket(): void {
    this.eventTickets.createTicket();
  }
}
