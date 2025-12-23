import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { IonFooter, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { Input, inject, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'profile-image-confirm-modal',
  styleUrl: './profile-image-confirm-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-image-confirm-modal.html',
  imports: [Button, IonHeader, IonFooter, IonToolbar]
})
export class ProfileImageConfirmModal {
  // services
  private modalService = inject(ModalService);

  // inputs
  @Input() imageDataUrl: string = '';

  close(): void {
    this.modalService.close({ action: 'cancel' });
  }

  retake(): void {
    this.modalService.close({ action: 'retake' });
  }

  confirm(): void {
    this.modalService.close({ action: 'confirm', imageDataUrl: this.imageDataUrl });
  }
}
