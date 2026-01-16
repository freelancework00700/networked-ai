import { ModalService } from '@/services/modal.service';
import { ToasterService } from '@/services/toaster.service';
import { signal, inject, Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'account-settings',
  styleUrl: './account-settings.scss',
  templateUrl: './account-settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonContent]
})
export class AccountSettings implements OnInit {
  // services
  navCtrl = inject(NavController);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);

  // signals
  email = signal('user@email.com');
  phoneNumber = signal('+1 009 882 9912');
  username = signal('sandra_t');
  isLoading = signal<boolean>(false);

  ngOnInit(): void {}

  onEditEmail(): void {
    this.navCtrl.navigateForward('/settings/change-account-info/email');
  }

  onEditPhone(): void {
    this.navCtrl.navigateForward('/settings/change-account-info/phone');
  }

  onEditUsername(): void {
    this.navCtrl.navigateForward('/settings/change-account-info/username');
  }

  async onDeleteAccount(): Promise<void> {
    try {
      await this.modalService.openDeleteAccountModal();
    } catch (error: any) {
      console.error('Delete account error:', error);
      this.toasterService.showError(error.message || 'Failed to open delete account modal. Please try again.');
    }
  }
}