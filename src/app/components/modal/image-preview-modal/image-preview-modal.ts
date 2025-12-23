import { Component, Input, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'image-preview-modal',
  styleUrl: './image-preview-modal.scss',
  templateUrl: './image-preview-modal.html'
})
export class ImagePreviewModal {
  @Input() url: string = '';
  private modalCtrl = inject(ModalController);

  closeFullscreen() {
    this.modalCtrl.dismiss();
  }
}
