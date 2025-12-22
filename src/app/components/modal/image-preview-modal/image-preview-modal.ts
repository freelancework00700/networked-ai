import { IonIcon } from '@ionic/angular/standalone';
import { Component, Input, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'image-preview-modal',
  imports: [IonIcon],
  templateUrl: './image-preview-modal.html',
  styleUrl: './image-preview-modal.scss'
})
export class ImagePreviewModal {
  @Input() url: string = '';
  private modalCtrl = inject(ModalController);

  closeFullscreen() {
    this.modalCtrl.dismiss();
  }
}
