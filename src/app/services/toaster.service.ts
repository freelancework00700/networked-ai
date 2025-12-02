import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class ToasterService {
  toastController = inject(ToastController);

  async showSuccess(message: string, position: 'top' | 'bottom' = 'top', duration = 2000) {
    const toaster = await this.toastController.create({
      message,
      position,
      duration,
      mode: 'ios',
      color: 'dark',
      icon: 'checkmark-circle',
      cssClass: 'success-toast',
      buttons: [{ icon: 'close-outline' }]
    });

    await toaster.present();
  }

  async showError(message: string, position: 'top' | 'bottom' = 'top', duration = 2000) {
    const toaster = await this.toastController.create({
      message,
      position,
      duration,
      mode: 'ios',
      color: 'dark',
      icon: 'close-circle',
      cssClass: 'error-toast',
      buttons: [{ icon: 'close-outline' }]
    });

    await toaster.present();
  }
}
