import { ModalService } from '@/services/modal.service';
import { NavController } from '@ionic/angular/standalone';
import { ToasterService } from '@/services/toaster.service';
import { input, Component, ChangeDetectionStrategy, inject } from '@angular/core';

export interface IEvent {
  date: string;
  day?: string;
  views: string;
  title: string;
  image: string;
  location: string;
  dayOfWeek?: string;
  organization: string;
}

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
    this.navCtrl.navigateForward(`/event/1111`);
  }

  async shareEvent() {
    const result = await this.modalService.openShareModal('1111', 'Event');
    if (result) {
      this.toasterService.showSuccess('Event shared');
    }
  }
}
