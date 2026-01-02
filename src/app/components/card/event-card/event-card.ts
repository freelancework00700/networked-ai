import { IEvent } from '@/interfaces/event';
import { ModalService } from '@/services/modal.service';
import { NavController } from '@ionic/angular/standalone';
import { ToasterService } from '@/services/toaster.service';
import { input, Component, ChangeDetectionStrategy, inject } from '@angular/core';

@Component({
  selector: 'event-card',
  styleUrl: './event-card.scss',
  templateUrl: './event-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCard {
  navCtrl = inject(NavController);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);

  event = input.required<IEvent>();
  variant = input<'default' | 'compact'>('default');

  viewEvent() {
    this.navCtrl.navigateForward(`/event/bd6cabe4-21ae-488c-a830-6e63ab1b4cfe`);
  }

  async shareEvent() {
    const result = await this.modalService.openShareModal('1111', 'Event');
    if (result) {
      this.toasterService.showSuccess('Event shared');
    }
  }
}
