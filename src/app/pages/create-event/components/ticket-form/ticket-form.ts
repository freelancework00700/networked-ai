import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { TextInput } from '@/components/form/text-input';
import { ModalInput } from '@/components/form/modal-input';
import { NumberInput } from '@/components/form/number-input';
import { TextAreaInput } from '@/components/form/text-area-input';
import { ModalController, IonCheckbox } from '@ionic/angular/standalone';
import { AIPromptModal } from '@/pages/create-event/components/ai-prompt-modal';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, ChangeDetectionStrategy, signal, OnInit, Input, computed } from '@angular/core';

export interface TicketFormData {
  name: string;
  price: string;
  quantity: number | null;
  description?: string;
  sales_start_date?: string | null;
  sales_start_time?: string | null;
  sales_end_date?: string | null;
  sales_end_time?: string | null;
  end_sale_on_event_start: boolean;
  free_for_subscribers?: boolean;
  ticket_type: 'free' | 'paid' | 'early-bird' | 'sponsor' | 'standard';
}

@Component({
  selector: 'ticket-form',
  styleUrl: './ticket-form.scss',
  templateUrl: './ticket-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, Button, TextInput, ModalInput, IonCheckbox, NumberInput, TextAreaInput]
})
export class TicketForm implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);

  @Input() ticketType: 'free' | 'paid' | 'early-bird' | 'sponsor' | 'standard' = 'free';
  @Input() initialData?: Partial<TicketFormData> | null;

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

  // Computed signal to check if end sale inputs should be shown
  showEndSaleInputs = computed(() => !this.endSaleOnEventStart());

  // Computed signal to check if in customize mode
  isCustomize = computed(() => this.showDescriptionEditor());

  ngOnInit(): void {
    const isFree = this.ticketType === 'free';
    this.isFreeTicket.set(isFree);

    // Initialize date/time values for form controls
    let salesStartDateValue = '';
    let salesStartTimeValue = '';
    if (this.initialData?.sales_start_date) {
      const date = new Date(this.initialData.sales_start_date);
      salesStartDateValue = date.toISOString().split('T')[0];
      salesStartTimeValue = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    let salesEndDateValue = '';
    let salesEndTimeValue = '';
    if (this.initialData?.sales_end_date) {
      const date = new Date(this.initialData.sales_end_date);
      salesEndDateValue = date.toISOString().split('T')[0];
      salesEndTimeValue = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    const endSaleOnEventStart = this.initialData?.end_sale_on_event_start ?? true;
    this.endSaleOnEventStart.set(endSaleOnEventStart);

    const form = this.fb.group({
      name: [this.initialData?.name || '', [Validators.required]],
      price: [isFree ? '0.00' : this.initialData?.price || '5.00', [Validators.required]],
      quantity: [this.initialData?.quantity || 500, [Validators.required]],
      description: [this.initialData?.description || ''],
      sales_start_date: [salesStartDateValue],
      sales_start_time: [salesStartTimeValue],
      sales_end_date: [salesEndDateValue],
      sales_end_time: [salesEndTimeValue],
      end_sale_on_event_start: [endSaleOnEventStart],
      free_for_subscribers: [this.initialData?.free_for_subscribers ?? false]
    });
    this.ticketForm.set(form);

    if (isFree) {
      form.get('price')?.disable();
    }

    form.get('end_sale_on_event_start')?.valueChanges.subscribe((value) => {
      this.endSaleOnEventStart.set(value ?? true);
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
    const modal = await this.modalCtrl.create({
      component: AIPromptModal,
      initialBreakpoint: 1,
      handle: true,
      componentProps: {
        conversation: this.conversation(),
        isEvent: false
      }
    });

    await modal.present();

    // Handle modal dismissal and data
    const { data } = await modal.onWillDismiss();

    if (data) {
      if (data.type === 'value' && data.data) {
        // Update description value
        const form = this.ticketForm();
        const descriptionControl = form.get('description');
        if (descriptionControl) {
          descriptionControl.setValue(data.data);
          descriptionControl.markAsTouched();
        }
      } else if (data.type === 'data' && data.data) {
        // Update conversation data
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

    this.modalCtrl.dismiss(form.value, 'save');
  }

  close(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}