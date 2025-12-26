import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ModalService } from '@/services/modal.service';
import { NumberInput } from '@/components/form/number-input';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TicketCard } from '@/pages/create-event/components/ticket-card';
import { Ticket, PromoCode, SubscriptionPlan } from '@/interfaces/event';
import { IonLabel, IonToggle, IonCheckbox } from '@ionic/angular/standalone';
import { TicketFormData } from '@/pages/create-event/components/ticket-form';
import { PromoCodeCard } from '@/pages/create-event/components/promo-code-card';
import { TicketTypeItem } from '@/pages/create-event/components/ticket-type-item';
import { IonReorderGroup, ItemReorderEventDetail } from '@ionic/angular/standalone';
import { PromoCodeFormData } from '@/pages/create-event/components/promo-code-form';
import { SubscriptionInput } from '@/pages/create-event/components/subscription-input';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal, effect } from '@angular/core';

@Component({
  selector: 'event-tickets',
  imports: [
    IonLabel,
    IonToggle,
    TicketCard,
    IonCheckbox,
    NumberInput,
    CommonModule,
    PromoCodeCard,
    TicketTypeItem,
    IonReorderGroup,
    SubscriptionInput,
    ReactiveFormsModule
  ],
  styleUrl: './event-tickets.scss',
  templateUrl: './event-tickets.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventTickets {
  // Inputs
  eventForm = input.required<FormGroup>();
  storedPlans = input.required<SubscriptionPlan[]>();
  openConfirmModal = input.required<(message: string) => Promise<boolean>>();

  // Services
  modalService = inject(ModalService);
  navCtrl = inject(NavController);

  tickets = signal<Ticket[]>([]);
  promoCodes = signal<PromoCode[]>([]);
  promoCodeSectionOpen = signal<boolean>(false);
  advancedSettingsOpen = signal<boolean>(false);
  editingPromoIndex = signal<number | null>(null);
  editingTicketIndex = signal<number | null>(null);

  isEventCompletelyFree = computed(() => {
    return this.tickets().every((ticket) => ticket.is_free_ticket);
  });

  hasFreeTicket = computed(() => {
    return this.tickets().some((t) => t.ticket_type === 'free');
  });

  constructor() {
    this.syncFormToSignal('tickets', this.tickets);

    this.syncFormToSignal('promo_codes', this.promoCodes);

    effect(() => {
      this.eventForm().get('tickets')?.setValue(this.tickets());
    });

    effect(() => {
      this.eventForm().get('promo_codes')?.setValue(this.promoCodes());
    });
  }

  syncFormToSignal(formControlName: string, signalRef: ReturnType<typeof signal<any[]>>): void {
    effect(() => {
      const form = this.eventForm();
      const control = form.get(formControlName);

      if (control) {
        const formValue = control.value || [];
        if (Array.isArray(formValue) && formValue.length > 0 && signalRef().length === 0) {
          signalRef.set([...formValue] as any);
        }

        control.valueChanges.subscribe((value) => {
          if (Array.isArray(value) && value.length > 0 && signalRef().length === 0) {
            signalRef.set([...value] as any);
          }
        });
      }
    });
  }

  async confirmDelete(message: string): Promise<boolean> {
    return this.openConfirmModal()(message);
  }

  getFieldValue<T>(field: string): T | null {
    return this.eventForm().get(field)?.value ?? null;
  }

  updateTickets(tickets: Ticket[]): void {
    this.tickets.set(tickets);
  }

  updatePromoCodes(promoCodes: PromoCode[]): void {
    this.promoCodes.set(promoCodes);
  }

  createTicketFromFormData(data: TicketFormData, ticketId?: string): Ticket {
    return {
      id: ticketId || `ticket-${Date.now()}`,
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
  }

  createPromoCodeFromFormData(data: PromoCodeFormData): PromoCode {
    return {
      promoCode: data.promoCode,
      promotion_type: data.promotion_type,
      promoPresent: data.promoPresent,
      capped_amount: data.capped_amount || null,
      redemption_limit: data.redemption_limit || null,
      max_use_per_user: data.max_use_per_user || 1
    };
  }

  handleTicketReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const reorderedTickets = event.detail.complete([...this.tickets()]);
    this.updateTickets(reorderedTickets);
    event.detail.complete();
  }

  async openTicketModal(ticketType: 'free' | 'paid' | 'early-bird' | 'sponsor' | 'standard', initialData?: Partial<TicketFormData>): Promise<void> {
    const eventDate = this.eventForm().get('date')?.value || null;
    const eventStartTime = this.eventForm().get('start_time')?.value || null;
    const result = await this.modalService.openTicketModal(ticketType, initialData, eventDate, eventStartTime);

    if (result?.role === 'save' && result.data) {
      const editingIndex = this.editingTicketIndex();
      const ticketId = editingIndex !== null ? this.tickets()[editingIndex]?.id : (initialData as { id?: string })?.id;
      const ticketData = this.createTicketFromFormData(result.data, ticketId);

      const currentTickets = [...this.tickets()];
      if (editingIndex !== null) {
        currentTickets[editingIndex] = ticketData;
      } else {
        currentTickets.push(ticketData);
      }

      this.updateTickets(currentTickets);
      this.editingTicketIndex.set(null);
    }
  }

  async editTicket(index: number): Promise<void> {
    this.editingTicketIndex.set(index);
    const ticket = this.tickets()[index];
    if (!ticket) return;

    const ticketData: Partial<TicketFormData> & { id?: string } = {
      id: ticket.id,
      name: ticket.name,
      price: ticket.price.replace('$', ''),
      quantity: ticket.quantity || null,
      description: (ticket as { description?: string }).description,
      sale_start_date: ticket.sale_start_date || null,
      sale_end_date: ticket.sale_end_date || null,
      end_sale_on_event_start: ticket.end_sale_on_event_start ?? true,
      ticket_type: ticket.ticket_type
    };
    await this.openTicketModal(ticket.ticket_type, ticketData);
  }

  async deleteTicket(index: number): Promise<void> {
    const confirmed = await this.confirmDelete('This ticket will be removed permanently.');
    if (!confirmed) return;

    const currentTickets = [...this.tickets()];
    currentTickets.splice(index, 1);
    this.updateTickets(currentTickets);
  }

  async createFreeTicket(): Promise<void> {
    await this.openTicketModal('free');
  }

  async createPaidTicket(): Promise<void> {
    const ticketType = await this.modalService.openTicketTypeModal();
    if (ticketType) {
      await this.openTicketModal(ticketType);
    }
  }

  navigateToSubscriptionPlans(): void {
    this.navCtrl.navigateForward('/subscription-plans');
  }

  async openPromoCodeModal(initialData?: Partial<PromoCodeFormData>): Promise<void> {
    const result = await this.modalService.openPromoCodeModal(initialData);

    if (result?.role === 'save' && result.data) {
      const promoData = this.createPromoCodeFromFormData(result.data);
      const editingIndex = this.editingPromoIndex();
      const updatedPromoCodes = [...this.promoCodes()];

      if (editingIndex !== null) {
        updatedPromoCodes[editingIndex] = promoData;
        this.editingPromoIndex.set(null);
      } else {
        updatedPromoCodes.push(promoData);
        this.promoCodeSectionOpen.set(true);
      }

      this.updatePromoCodes(updatedPromoCodes);
    }
  }

  async editPromoCode(index: number): Promise<void> {
    this.editingPromoIndex.set(index);
    const promo = this.promoCodes()[index];
    if (!promo) return;

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

  async deletePromoCode(index: number): Promise<void> {
    const confirmed = await this.confirmDelete('This promo code will be deleted.');
    if (!confirmed) return;

    const currentPromoCodes = [...this.promoCodes()];
    currentPromoCodes.splice(index, 1);
    this.updatePromoCodes(currentPromoCodes);
  }

  async resetPromoForm(): Promise<void> {
    this.editingPromoIndex.set(null);
    await this.openPromoCodeModal();
  }

  getPromoCodeOriginalIndex(promo: PromoCode): number {
    return this.promoCodes().findIndex((p) => p === promo);
  }
}
