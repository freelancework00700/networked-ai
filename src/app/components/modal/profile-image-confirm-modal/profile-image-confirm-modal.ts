import { Button } from '@/components/form/button';
import { ModalController } from '@ionic/angular/standalone';
import { Component, inject, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  imports: [Button],
  selector: 'app-profile-image-confirm-modal',
  styleUrl: './profile-image-confirm-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-image-confirm-modal.html'
})
export class ProfileImageConfirmModal {
  private modalCtrl = inject(ModalController);

  @Input() imageDataUrl: string = '';

  close(): void {
    this.modalCtrl.dismiss({ action: 'cancel' });
  }

  retake(): void {
    this.modalCtrl.dismiss({ action: 'retake' });
  }

  confirm(): void {
    this.modalCtrl.dismiss({ action: 'confirm', imageDataUrl: this.imageDataUrl });
  }
}
