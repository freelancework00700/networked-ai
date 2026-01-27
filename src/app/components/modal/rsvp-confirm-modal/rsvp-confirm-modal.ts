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
  @Input() rsvpData: any;
  private modalService = inject(ModalService);
  modalctrl = inject(ModalController);
  share(): void {
    this.modalctrl.dismiss();
    this.modalService.openShareModal(this.rsvpData.eventId, 'Event');
  }

  addEvent(): void {
    this.modalctrl.dismiss();
    this.modalService.close();
  }

  done(): void {
    this.modalctrl.dismiss();
    this.modalService.close();
  }
}
