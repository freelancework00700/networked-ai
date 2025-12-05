import { inject, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { LoadingModal } from '@/components/modal/loading-modal';
import { PasswordSavedModal } from '@/components/modal/password-saved-modal';
import { PhoneEmailVerifiedModal } from '@/components/modal/phone-email-verified-modal';

@Injectable({ providedIn: 'root' })
export class ModalService {
  // services
  modalCtrl = inject(ModalController);

  async openLoadingModal(message: string): Promise<void> {
    const modal = await this.modalCtrl.create({
      backdropDismiss: false,
      component: LoadingModal,
      componentProps: { message },
      cssClass: 'auto-hight-modal',
    });

    await modal.present();
  }

  async openPhoneEmailVerifiedModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      backdropDismiss: false,
      component: PhoneEmailVerifiedModal,
      cssClass: 'auto-hight-modal',
    });

    await modal.present();
  }

  async openPasswordSavedModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      backdropDismiss: false,
      component: PasswordSavedModal,
      cssClass: 'auto-hight-modal',
    });

    await modal.present();
  } 

  async close(): Promise<void> {
    const modal = await this.modalCtrl.getTop();
    if (modal) await modal.dismiss();
  }
}