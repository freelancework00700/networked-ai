import { CheckboxModule } from 'primeng/checkbox';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { TextInput } from '@/components/form/text-input';
import { NumberInput } from '@/components/form/number-input';
import { TicketFormData, TicketType } from '@/interfaces/event';
import { TextAreaInput } from '@/components/form/text-area-input';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IonHeader, IonFooter, IonContent, IonToolbar } from '@ionic/angular/standalone';
import { Input, OnInit, inject, signal, computed, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ticket-form-modal',
  styleUrl: './ticket-form-modal.scss',
  templateUrl: './ticket-form-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button, TextInput, NumberInput, TextAreaInput, IonHeader, IonToolbar, IonContent, IonFooter, CheckboxModule]
})
export class TicketFormModal implements OnInit {
  // services
  private fb = inject(FormBuilder);
  private modalService = inject(ModalService);

  // inputs
  @Input() ticketType: TicketType = 'Free';
  @Input() initialData?: Partial<TicketFormData> | null;
  @Input() eventDate?: string | null;
  @Input() eventStartTime?: string | null;
  @Input() eventEndTime?: string | null;

  // signals
  ticketForm = signal<FormGroup>(
    this.fb.group({
      free_for_subscribers: false,
      end_at_event_start: true
    })
  );

  isFreeTicket = signal<boolean>(true);
  showDescriptionEditor = signal<boolean>(false);
  endSaleOnEventStart = signal<boolean>(true);
  conversation = signal<any[]>([]);

  showEndSaleInputs = computed(() => !this.endSaleOnEventStart());
  isCustomize = computed(() => this.showDescriptionEditor());

  ngOnInit(): void {
    const isFree = this.ticketType === 'Free';
    this.isFreeTicket.set(isFree);

    // Get current date and time for defaults
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Initialize date/time values for form controls
    let salesStartDateValue = '';
    let salesStartTimeValue = '';
    if (this.initialData?.sale_start_date && this.initialData?.sale_start_time) {
      // Use separate date and time strings directly
      salesStartDateValue = this.initialData.sale_start_date;
      salesStartTimeValue = this.initialData.sale_start_time;
    } else {
      // Set default to current date and time
      salesStartDateValue = currentDate;
      salesStartTimeValue = currentTime;
    }

    const endSaleOnEventStart = this.initialData?.end_at_event_start ?? true;
    this.endSaleOnEventStart.set(endSaleOnEventStart);

    let salesEndDateValue = '';
    let salesEndTimeValue = '';
    if (this.initialData?.sale_end_date && this.initialData?.sale_end_time) {
      // Use separate date and time strings directly
      salesEndDateValue = this.initialData.sale_end_date;
      salesEndTimeValue = this.initialData.sale_end_time;
    } else if (!endSaleOnEventStart && this.eventDate && this.eventEndTime) {
      // Set default to event end date and time if end_at_event_start is false
      salesEndDateValue = this.eventDate;
      salesEndTimeValue = this.eventEndTime;
    }

    const form = this.fb.group({
      name: [this.initialData?.name || '', [Validators.required]],
      price: [isFree ? '0.00' : this.initialData?.price || '5.00', [Validators.required]],
      quantity: [this.initialData?.quantity || 500, [Validators.required]],
      description: [this.initialData?.description || ''],
      sale_start_date: [salesStartDateValue, [Validators.required]],
      sale_start_time: [salesStartTimeValue, [Validators.required]],
      sale_end_date: [salesEndDateValue],
      sale_end_time: [salesEndTimeValue],
      end_at_event_start: [endSaleOnEventStart],
      free_for_subscribers: [this.initialData?.free_for_subscribers ?? false]
    });
    this.ticketForm.set(form);

    if (isFree) {
      form.get('price')?.disable();
    }

    form.get('end_at_event_start')?.valueChanges.subscribe((value) => {
      this.endSaleOnEventStart.set(value ?? true);

      // Update validators for sale_end_date and sale_end_time based on checkbox value
      const salesEndDateControl = form.get('sale_end_date');
      const salesEndTimeControl = form.get('sale_end_time');

      if (value) {
        // If end_at_event_start is true, remove required validators
        salesEndDateControl?.clearValidators();
        salesEndTimeControl?.clearValidators();
        // Clear values when checkbox is checked
        salesEndDateControl?.setValue('');
        salesEndTimeControl?.setValue('');
      } else {
        // If end_at_event_start is false, add required validators
        salesEndDateControl?.setValidators([Validators.required]);
        salesEndTimeControl?.setValidators([Validators.required]);
        // Set default values to event end date/time if fields are empty, otherwise current date/time
        if (!salesEndDateControl?.value) {
          if (this.eventDate) {
            salesEndDateControl?.setValue(this.eventDate);
          } else {
            const now = new Date();
            salesEndDateControl?.setValue(now.toISOString().split('T')[0]);
          }
        }
        if (!salesEndTimeControl?.value) {
          if (this.eventEndTime) {
            salesEndTimeControl?.setValue(this.eventEndTime);
          } else {
            const now = new Date();
            salesEndTimeControl?.setValue(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
          }
        }
      }

      salesEndDateControl?.updateValueAndValidity();
      salesEndTimeControl?.updateValueAndValidity();
    });
  }

  getTitle(): string {
    switch (this.ticketType) {
      case 'Free':
        return 'Free Ticket';
      case 'Early Bird':
        return 'Early Bird Ticket';
      case 'Sponsor':
        return 'Sponsor Ticket';
      case 'Standard':
        return 'Standard Paid Ticket';
      case 'Paid':
        return 'Paid Ticket';
      default:
        return 'Ticket';
    }
  }

  generateDescription(): void {
    const form = this.ticketForm();
    const descriptionControl = form.get('description');

    if (descriptionControl) {
      const generatedDescription = 'This is a generated ticket description. You can customize this content to better match your ticket details.';
      descriptionControl.setValue(generatedDescription);
      descriptionControl.markAsTouched();
      this.showDescriptionEditor.set(true);
    }
  }

  handleGenerateClick(): void {
    if (this.showDescriptionEditor()) {
      this.openAIPromptModal();
    } else {
      this.generateDescription();
    }
  }

  async openAIPromptModal(): Promise<void> {
    const data = await this.modalService.openAIPromptModal(this.conversation());

    if (data) {
      if (data.type === 'value' && data.data) {
        const form = this.ticketForm();
        const descriptionControl = form.get('description');
        if (descriptionControl) {
          descriptionControl.setValue(data.data);
          descriptionControl.markAsTouched();
        }
      } else if (data.type === 'data' && data.data) {
        this.conversation.set(data.data);
      }
    }
  }

  saveTicket(): void {
    const form = this.ticketForm();
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.modalService.close({ ...form.value, ticket_type: this.ticketType }, 'save');
  }

  async openDateModal(type: 'sale_start_date' | 'sale_end_date' = 'sale_start_date'): Promise<void> {
    const form = this.ticketForm();
    const currentDate = form.get(type)?.value || '';

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const maxDate = this.eventDate || undefined;

    let minDate: string | undefined = todayStr;
    if (type === 'sale_end_date') {
      const salesStartDate = form.get('sale_start_date')?.value;
      if (salesStartDate) {
        minDate = salesStartDate;
      }
    }

    const date = await this.modalService.openDateTimeModal('date', currentDate, minDate, maxDate);
    if (date) {
      if (type === 'sale_start_date') {
        form.patchValue({ sale_start_date: date });
      } else {
        form.patchValue({ sale_end_date: date });
      }
    }
  }

  async openTimeModal(type: 'sale_start_time' | 'sale_end_time'): Promise<void> {
    const form = this.ticketForm();
    const currentTime = form.get(type)?.value || '';

    const time = await this.modalService.openDateTimeModal('time', currentTime);
    if (time) {
      if (type === 'sale_start_time') {
        form.patchValue({ sale_start_time: time });
      } else {
        form.patchValue({ sale_end_time: time });
      }
    }
  }

  close(): void {
    this.modalService.close(null, 'cancel');
  }
}
