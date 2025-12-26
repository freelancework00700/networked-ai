import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { TextInput } from '@/components/form/text-input';
import { NumberInput } from '@/components/form/number-input';
import { TextAreaInput } from '@/components/form/text-area-input';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IonHeader, IonFooter, IonContent, IonToolbar, IonCheckbox } from '@ionic/angular/standalone';
import { Input, OnInit, inject, signal, computed, Component, ChangeDetectionStrategy } from '@angular/core';

export interface TicketFormData {
  name: string;
  price: string;
  quantity: number | null;
  description?: string;
  sale_start_date?: string | null;
  sale_start_time?: string | null;
  sale_end_date?: string | null;
  sale_end_time?: string | null;
  end_sale_on_event_start: boolean;
  free_for_subscribers?: boolean;
  ticket_type: 'free' | 'paid' | 'early-bird' | 'sponsor' | 'standard';
}

@Component({
  selector: 'ticket-form',
  styleUrl: './ticket-form.scss',
  templateUrl: './ticket-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button, TextInput, IonCheckbox, NumberInput, TextAreaInput, IonHeader, IonToolbar, IonContent, IonFooter]
})
export class TicketForm implements OnInit {
  // services
  private fb = inject(FormBuilder);
  private modalService = inject(ModalService);

  // inputs
  @Input() ticketType: 'free' | 'paid' | 'early-bird' | 'sponsor' | 'standard' = 'free';
  @Input() initialData?: Partial<TicketFormData> | null;
  @Input() eventDate?: string | null;

  // signals
  ticketForm = signal<FormGroup>(
    this.fb.group({
      free_for_subscribers: false,
      end_sale_on_event_start: true
    })
  );

  isFreeTicket = signal<boolean>(true);
  showDescriptionEditor = signal<boolean>(false);
  endSaleOnEventStart = signal<boolean>(true);
  conversation = signal<any[]>([]);

  showEndSaleInputs = computed(() => !this.endSaleOnEventStart());
  isCustomize = computed(() => this.showDescriptionEditor());

  ngOnInit(): void {
    const isFree = this.ticketType === 'free';
    this.isFreeTicket.set(isFree);

    // Get current date and time for defaults
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Initialize date/time values for form controls
    let salesStartDateValue = '';
    let salesStartTimeValue = '';
    if (this.initialData?.sale_start_date) {
      const date = new Date(this.initialData.sale_start_date);
      salesStartDateValue = date.toISOString().split('T')[0];
      salesStartTimeValue = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      // Set default to current date and time
      salesStartDateValue = currentDate;
      salesStartTimeValue = currentTime;
    }

    const endSaleOnEventStart = this.initialData?.end_sale_on_event_start ?? true;
    this.endSaleOnEventStart.set(endSaleOnEventStart);

    let salesEndDateValue = '';
    let salesEndTimeValue = '';
    if (this.initialData?.sale_end_date) {
      const date = new Date(this.initialData.sale_end_date);
      salesEndDateValue = date.toISOString().split('T')[0];
      salesEndTimeValue = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (!endSaleOnEventStart) {
      // Set default to current date and time if end sale is enabled
      salesEndDateValue = currentDate;
      salesEndTimeValue = currentTime;
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
      end_sale_on_event_start: [endSaleOnEventStart],
      free_for_subscribers: [this.initialData?.free_for_subscribers ?? false]
    });
    this.ticketForm.set(form);

    if (isFree) {
      form.get('price')?.disable();
    }

    form.get('end_sale_on_event_start')?.valueChanges.subscribe((value) => {
      this.endSaleOnEventStart.set(value ?? true);

      // Update validators for sale_end_date and sale_end_time based on checkbox value
      const salesEndDateControl = form.get('sale_end_date');
      const salesEndTimeControl = form.get('sale_end_time');

      if (value) {
        // If end_sale_on_event_start is true, remove required validators
        salesEndDateControl?.clearValidators();
        salesEndTimeControl?.clearValidators();
        // Clear values when checkbox is checked
        salesEndDateControl?.setValue('');
        salesEndTimeControl?.setValue('');
      } else {
        // If end_sale_on_event_start is false, add required validators
        salesEndDateControl?.setValidators([Validators.required]);
        salesEndTimeControl?.setValidators([Validators.required]);
        // Set default values to current date/time if fields are empty
        if (!salesEndDateControl?.value) {
          const now = new Date();
          salesEndDateControl?.setValue(now.toISOString().split('T')[0]);
        }
        if (!salesEndTimeControl?.value) {
          const now = new Date();
          salesEndTimeControl?.setValue(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
        }
      }

      salesEndDateControl?.updateValueAndValidity();
      salesEndTimeControl?.updateValueAndValidity();
    });
  }

  getTitle(): string {
    switch (this.ticketType) {
      case 'free':
        return 'Free Ticket';
      case 'early-bird':
        return 'Early Bird Ticket';
      case 'sponsor':
        return 'Sponsor Ticket';
      case 'standard':
        return 'Standard Paid Ticket';
      case 'paid':
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
