import { Component, inject } from '@angular/core';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'block-modal',
  imports: [Button],
  templateUrl: './block-modal.html',
  styleUrl: './block-modal.scss'
})
export class BlockModal {
  private modalCtrl = inject(ModalController);
  private modalService = inject(ModalService);
  blockUser(): void {
    this.modalCtrl.dismiss(true, 'block');
    this.modalService.close();
  }
}
