import { CommonModule } from '@angular/common';
import { Chip } from '@/components/common/chip';
import { ModalService } from '@/services/modal.service';
import { ToggleInput } from '@/components/form/toggle-input';
import { NumberInput } from '@/components/form/number-input';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ParticipantInput, User } from '@/pages/event/components/participant-input';
import { RepeatingEventItem } from '@/pages/event/components/repeating-event-item';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, output, signal, effect, DestroyRef } from '@angular/core';
@Component({
  selector: 'event-settings',
  styleUrl: './event-settings.scss',
  templateUrl: './event-settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Chip, ToggleInput, NumberInput, ParticipantInput, RepeatingEventItem, ReactiveFormsModule, CommonModule]
})
export class EventSettings {
  // Inputs
  eventForm = input.required<FormGroup>();
  isModalMode = input<boolean>(false);
  openConfirmModal = input.required<(message: string) => Promise<boolean>>();

  // Outputs
  generateRepeatingEvents = output<void>();

  // Services
  modalService = inject(ModalService);
  cd = inject(ChangeDetectorRef);
  destroyRef = inject(DestroyRef);

  coHosts = signal<User[]>([]);
  sponsors = signal<User[]>([]);
  speakers = signal<User[]>([]);
  visibility = signal<'public' | 'invite-only'>('public');
  repeatingEvents = signal<Array<Record<string, unknown>>>([]);

  // Signals
  repeatOptions = signal<Array<{ label: string; value: 'weekly' | 'monthly' | 'custom' }>>([
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Custom', value: 'custom' }
  ]);

  repeatCountOptions = signal<Array<{ label: string; value: number | 'custom' }>>([
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: 'Custom', value: 'custom' }
  ]);

  sections = signal<Array<{ type: 'pre_event' | 'post_event'; label: string; placeholder: string }>>([
    { type: 'pre_event', label: 'Pre-Event', placeholder: 'Displayed when user signs up for the event.' },
    { type: 'post_event', label: 'Post-Event', placeholder: 'A feedback survey after the event has concluded.' }
  ]);

  constructor() {
    effect(() => {
      const users = this.coHosts();
      const uids = users.map((u) => u.uid);
      this.eventForm().get('co_hosts')?.setValue(uids);
    });

    effect(() => {
      const users = this.sponsors();
      const uids = users.map((u) => u.uid);
      this.eventForm().get('sponsors')?.setValue(uids);
    });

    effect(() => {
      const users = this.speakers();
      const uids = users.map((u) => u.uid);
      this.eventForm().get('speakers')?.setValue(uids);
    });

    effect(() => {
      const visibility = this.visibility();
      this.eventForm().get('visibility')?.setValue(visibility);
    });

    effect(() => {
      const form = this.eventForm();
      const formVisibility = form.get('visibility')?.value;
      if (formVisibility && (formVisibility === 'public' || formVisibility === 'invite-only')) {
        this.visibility.set(formVisibility);
      }
    });

    effect(() => {
      const events = this.repeatingEvents();
      this.eventForm().get('repeating_events')?.setValue(events);
    });

    effect(() => {
      const form = this.eventForm();
      const repeatingEventsControl = form.get('repeating_events');
      if (!repeatingEventsControl) return;

      repeatingEventsControl.valueChanges.subscribe((formEvents) => {
        if (Array.isArray(formEvents)) {
          const currentEvents = this.repeatingEvents();
          const formEventsStr = JSON.stringify(formEvents);
          const currentEventsStr = JSON.stringify(currentEvents);
          if (formEventsStr !== currentEventsStr) {
            this.repeatingEvents.set(formEvents);
            this.cd.markForCheck();
          }
        }
      });

      const formEvents = repeatingEventsControl.value;
      if (Array.isArray(formEvents) && formEvents.length > 0 && this.repeatingEvents().length === 0) {
        this.repeatingEvents.set(formEvents);
      }
    });
  }

  getFieldValue<T>(field: string): T | null {
    return this.eventForm().get(field)?.value ?? null;
  }

  getSectionQuestions(type: string): Array<{ id: string; question: string }> {
    return (this.getFieldValue<Record<string, unknown>>('questionnaire')?.[type] as Array<{ id: string; question: string }>) ?? [];
  }

  hasQuestions(type: string): boolean {
    return this.getSectionQuestions(type).length > 0;
  }

  onUsersChange(users: User[], field: 'co_hosts' | 'sponsors' | 'speakers'): void {
    if (field === 'co_hosts') {
      this.coHosts.set(users);
    } else if (field === 'sponsors') {
      this.sponsors.set(users);
    } else if (field === 'speakers') {
      this.speakers.set(users);
    }
  }

  updateFormField(field: string, value: unknown): void {
    this.eventForm().patchValue({ [field]: value });
    this.cd.markForCheck();
  }

  setVisibility(type: 'public' | 'invite-only'): void {
    this.visibility.set(type);
  }

  setPlusCount(count: number): void {
    this.updateFormField('plus', count);
  }

  setRepeatFrequency(frequency: 'weekly' | 'monthly' | 'custom'): void {
    this.updateFormField('repeat_frequency', frequency);

    this.generateRepeatingEvents.emit();
  }

  handleRepeatCountClick(value: number | 'custom'): void {
    this.updateFormField('repeat_count', value);
    if (value !== 'custom') {
      this.generateRepeatingEvents.emit();
    }
  }

  async editRepeatingEvent(event: Record<string, unknown>): Promise<void> {
    const result = await this.modalService.openRepeatingEventModal(event);
    if (!result || result.role !== 'save') return;

    const eventId = event['id'];
    const updatedEvents = this.repeatingEvents().map((e) => (e['id'] === eventId ? { ...e, ...result.data } : e));
    this.updateRepeatingEvents(updatedEvents);
  }

  async deleteRepeatingEvent(eventId: string | unknown): Promise<void> {
    const confirmed = await this.confirmDelete('This event occurrence will be permanently removed.');
    if (!confirmed) return;

    const id = String(eventId);
    const updatedEvents = this.repeatingEvents().filter((e) => String(e['id']) !== id);
    this.updateRepeatingEvents(updatedEvents);
  }

  updateRepeatingEvents(events: Array<Record<string, unknown>>): void {
    this.repeatingEvents.set(events);
  }

  async confirmDelete(message: string): Promise<boolean> {
    return this.openConfirmModal()(message);
  }

  async openQuestionnaireModal(type: 'pre_event' | 'post_event'): Promise<void> {
    const currentQuestions = this.getSectionQuestions(type);
    const result = await this.modalService.openQuestionnaireFormModal(type, currentQuestions.length > 0 ? currentQuestions : undefined);

    if (result?.questions) {
      const form = this.eventForm();
      const questionnaireControl = form.get('questionnaire');
      const currentValue = (questionnaireControl?.value as Record<string, unknown>) || {};
      questionnaireControl?.setValue({
        ...currentValue,
        [type]: result.questions
      });
      this.cd.markForCheck();
    }
  }

  deleteEventQuestionnaire(type: 'pre_event' | 'post_event'): void {
    const form = this.eventForm();
    const questionnaireControl = form.get('questionnaire');
    const currentValue = (questionnaireControl?.value as Record<string, unknown>) || {};
    const { [type]: _, ...updatedValue } = currentValue;
    questionnaireControl?.setValue(updatedValue);
    this.cd.markForCheck();
  }
}
