import { inject, Component, Input } from '@angular/core';
import { Button } from '@/components/form/button';
import { IonToolbar, ModalController, NavController, IonFooter } from '@ionic/angular/standalone';

@Component({
  selector: 'success-modal',
  imports: [Button, IonToolbar, IonFooter],
  styleUrl: './success-modal.scss',
  templateUrl: './success-modal.html'
})
export class SuccessModal {
  // services
  navCtrl = inject(NavController);
  modalCtrl = inject(ModalController);

  // inputs
  @Input() title: string = 'Success';
  @Input() description: string = '';
  @Input() buttonLabel: string = 'Close';
  @Input() navigateBack: boolean = false;
  @Input() navigateTo?: string;

  async dismiss(): Promise<void> {
    await this.modalCtrl.dismiss();
    if (this.navigateTo) {
      this.navCtrl.navigateRoot(this.navigateTo);
    } else if (this.navigateBack) {
      this.navCtrl.back();
    }
  }
}
