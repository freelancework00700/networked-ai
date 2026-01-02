import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { IonIcon } from '@ionic/angular/standalone';
import { TicketFormData } from '@/interfaces/event';
import { ModalService } from '@/services/modal.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TicketCard } from '@/components/card/ticket-card';
import { PromoCodeFormModalData } from '@/interfaces/event';
import { NumberInput } from '@/components/form/number-input';
import { ToggleInput } from '@/components/form/toggle-input';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PromoCodeCard } from '@/components/card/promo-code-card';
import { SubscriptionInput } from '@/pages/event/components/subscription-input';
import { IonReorderGroup, ItemReorderEventDetail } from '@ionic/angular/standalone';
import { Ticket, PromoCode, SubscriptionPlan, TicketType } from '@/interfaces/event';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal, effect } from '@angular/core';

@Component({
  selector: 'event-tickets',
  imports: [
    IonIcon,
    TicketCard,
    NumberInput,
    ToggleInput,
    CommonModule,
    PromoCodeCard,
    CheckboxModule,
    IonReorderGroup,
    SubscriptionInput,
    ToggleSwitchModule,
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
    return this.tickets().every((ticket) => ticket.ticket_type === 'Free');
  });

  hasFreeTicket = computed(() => {
    return this.tickets().some((t) => t.ticket_type === 'Free');
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
      price: data.ticket_type !== 'Free' ? data.price || 0 : 0,
      available_quantity: data.quantity || null,
      description: data.description || null,
      sale_start_date: data.sale_start_date || null,
      sale_start_time: data.sale_start_time || null,
      sale_end_date: data.sale_end_date || null,
      sale_end_time: data.sale_end_time || null,
      end_at_event_start: data.end_at_event_start
    };
  }

  createPromoCodeFromFormData(data: PromoCodeFormModalData): PromoCode {
    return {
      promo_code: data.promo_code,
      type: data.type,
      value: data.value,
      capped_amount: data.capped_amount || null,
      redemption_limit: data.redemption_limit || null,
      max_uses_per_user: data.max_uses_per_user || 1
    };
  }

  handleTicketReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const reorderedTickets = event.detail.complete([...this.tickets()]);
    // Update order field based on new position
    const ticketsWithOrder = reorderedTickets.map((ticket: Ticket, index: number) => ({
      ...ticket,
      order: index + 1
    }));
    this.updateTickets(ticketsWithOrder);
    event.detail.complete();
  }

  async openTicketModal(ticketType: TicketType, initialData?: Partial<TicketFormData>): Promise<void> {
    const eventDate = this.eventForm().get('date')?.value || null;
    const eventStartTime = this.eventForm().get('start_time')?.value || null;
    const eventEndTime = this.eventForm().get('end_time')?.value || null;
    const result = await this.modalService.openTicketModal(ticketType, initialData, eventDate, eventStartTime, eventEndTime);

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
      price: ticket.price || 0,
      quantity: ticket.available_quantity || null, // Read from available_quantity
      description: (ticket as { description?: string }).description,
      sale_start_date: ticket.sale_start_date || null,
      sale_start_time: ticket.sale_start_time || null,
      sale_end_date: ticket.sale_end_date || null,
      sale_end_time: ticket.sale_end_time || null,
      end_at_event_start: ticket.end_at_event_start ?? true,
      ticket_type: ticket.ticket_type
    };
    await this.openTicketModal(ticket.ticket_type, ticketData);
  }

  async deleteTicket(index: number): Promise<void> {
    const confirmed = await this.confirmDelete('This ticket will be removed permanently.');
    if (!confirmed) return;

    const currentTickets = [...this.tickets()];
    currentTickets.splice(index, 1);
    // Update order field for remaining tickets
    const ticketsWithOrder = currentTickets.map((ticket: Ticket, idx: number) => ({
      ...ticket,
      order: idx + 1
    }));
    this.updateTickets(ticketsWithOrder);
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

  async openPromoCodeModal(initialData?: Partial<PromoCodeFormModalData>): Promise<void> {
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

    const initialData: Partial<PromoCodeFormModalData> = {
      promo_code: promo.promo_code,
      type: promo.type,
      value: promo.value,
      capped_amount: promo.capped_amount || null,
      redemption_limit: promo.redemption_limit || null,
      max_uses_per_user: promo.max_uses_per_user || 1
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

  async createTicket(): Promise<void> {
    const ticketType = await this.modalService.openTicketTypeModal(false, this.hasFreeTicket());
    if (ticketType && ticketType === 'Free') {
      await this.openTicketModal('Free');
    } else if (ticketType && ticketType === 'Paid') {
      this.createPaidTicket();
    }
  }
}
