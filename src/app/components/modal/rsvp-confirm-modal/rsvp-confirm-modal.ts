import { Button } from '@/components/form/button';
import { Component, Input, inject } from '@angular/core';
import { ModalService } from '@/services/modal.service';
import { IonToolbar, IonFooter, ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'rsvp-confirm-modal',
  imports: [IonFooter, IonToolbar, Button],
  templateUrl: './rsvp-confirm-modal.html',
  styleUrl: './rsvp-confirm-modal.scss'
})
export class RsvpConfirmModal {
  @Input() eventData: any;
  private modalService = inject(ModalService);
  modalctrl = inject(ModalController);

  share(): void {
    this.modalctrl.dismiss();
    this.modalService.openShareModal(this.eventData.id, 'Event');
  }

  async addEvent(): Promise<void> {
    await this.modalService.openAddToCalendarModal(this.eventData);
  }

  done(): void {
    this.modalctrl.dismiss();
    this.modalService.close();
  }
}
