import { inject, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { TitleModal } from '@/components/modal/title-modal';
import { LoadingModal } from '@/components/modal/loading-modal';
import { LocationModal } from '@/components/modal/location-modal';
import { DateTimeModal } from '@/components/modal/date-time-modal';
import { AccountTypeModal } from '@/components/modal/account-type-modal';
import { EventCategoryModal } from '@/components/modal/event-category-modal';
import { PasswordSavedModal } from '@/components/modal/password-saved-modal';
import { PhoneEmailVerifiedModal } from '@/components/modal/phone-email-verified-modal';

@Injectable({ providedIn: 'root' })
export class ModalService {
  // services
  modalCtrl = inject(ModalController);

  async openLoadingModal(message: string): Promise<void> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: false,
      component: LoadingModal,
      componentProps: { message },
      cssClass: 'auto-hight-modal'
    });

    await modal.present();
  }

  async openPhoneEmailVerifiedModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: false,
      cssClass: 'auto-hight-modal',
      component: PhoneEmailVerifiedModal
    });

    await modal.present();
  }

  async openPasswordSavedModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: false,
      cssClass: 'auto-hight-modal',
      component: PasswordSavedModal
    });

    await modal.present();
  }

  async openTitleModal(value: string): Promise<string> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: TitleModal,
      backdropDismiss: false,
      componentProps: { value },
      cssClass: 'auto-hight-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    return data;
  }

  async openDateTimeModal(type: 'date' | 'time', value?: string): Promise<string> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: false,
      component: DateTimeModal,
      cssClass: 'auto-hight-modal',
      componentProps: { type, value }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    return data;
  }

  async openAccountTypeModal(value: string): Promise<string> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: false,
      componentProps: { value },
      component: AccountTypeModal,
      cssClass: 'auto-hight-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    return data;
  }

  async openLocationModal(): Promise<{ address: string; latitude: number; longitude: number }> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: false,
      component: LocationModal,
      cssClass: 'auto-hight-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    return data;
  }

  async openEventCategoryModal(): Promise<string> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: false,
      cssClass: 'auto-hight-modal',
      component: EventCategoryModal
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    return data;
  }

  async close(): Promise<void> {
    const modal = await this.modalCtrl.getTop();
    if (modal) await modal.dismiss();
  }
}
