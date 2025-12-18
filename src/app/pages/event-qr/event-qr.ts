import { Button } from '@/components/form/button';
import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'event-qr',
  styleUrl: './event-qr.scss',
  templateUrl: './event-qr.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, IonToolbar, IonHeader, Button]
})
export class EventQr {
  navCtrl = inject(NavController);
  isShareLoading = signal<boolean>(false);
  isDownloadLoading = signal<boolean>(false);
  back() {
    this.navCtrl.back();
  }

  shareQR() {
    this.isShareLoading.set(true);
    setTimeout(() => {
      this.isShareLoading.set(false);
    }, 2000);
  }

  downloadQR() {
    this.isDownloadLoading.set(true);
    setTimeout(() => {
      this.isDownloadLoading.set(false);
    }, 2000);
  }
}
