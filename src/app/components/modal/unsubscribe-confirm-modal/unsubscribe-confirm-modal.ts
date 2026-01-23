import { Button } from '@/components/form/button';
import { Component, Input, inject, signal } from '@angular/core';
import { IonToolbar, IonFooter, IonIcon, ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'unsubscribe-confirm-modal',
  imports: [IonFooter, IonToolbar, IonIcon, Button],
  templateUrl: './unsubscribe-confirm-modal.html',
  styleUrl: './unsubscribe-confirm-modal.scss'
})
export class UnsubscribeConfirmModal {
  @Input() planName: string = '';
  @Input() endDate: string = '';
  @Input() onConfirm?: () => Promise<void>;

  modalctrl = inject(ModalController);
  isLoading = signal(false);

  async unsubscribe(): Promise<void> {
    if (this.onConfirm) {
      try {
        this.isLoading.set(true);
        await this.onConfirm();
        this.isLoading.set(false);
        await this.modalctrl.dismiss({ confirmed: true });
      } catch (error) {
        this.isLoading.set(false);
      }
    } else {
      await this.modalctrl.dismiss({ confirmed: true });
    }
  }

  staySubscribed(): void {
    if (!this.isLoading()) {
      this.modalctrl.dismiss({ confirmed: false });
    }
  }
}
