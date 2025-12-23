import { inject, Component } from '@angular/core';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { IonFooter, IonToolbar, ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'block-modal',
  styleUrl: './block-modal.scss',
  templateUrl: './block-modal.html',
  imports: [Button, IonFooter, IonToolbar]
})
export class BlockModal {
  // services
  private modalCtrl = inject(ModalController);
  private modalService = inject(ModalService);

  blockUser() {
    this.modalCtrl.dismiss(true, 'block');
    this.modalService.close();
  }
}
