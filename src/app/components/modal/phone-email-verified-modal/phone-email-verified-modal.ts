import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Input, inject, Component } from '@angular/core';
import { IonFooter, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'phone-email-verified-modal',
  imports: [Button, IonFooter, IonToolbar],
  styleUrl: './phone-email-verified-modal.scss',
  templateUrl: './phone-email-verified-modal.html'
})
export class PhoneEmailVerifiedModal {
  // services
  modalService = inject(ModalService);

  // inputs
  @Input() type: 'email' | 'mobile' = 'email';
}
