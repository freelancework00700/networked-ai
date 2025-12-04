import { Button } from '../../button';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { Component, inject, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'image-confirm-modal',
  templateUrl: './image-confirm-modal.html',
  styleUrl: './image-confirm-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, Button]
})
export class ImageConfirmModal {
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
