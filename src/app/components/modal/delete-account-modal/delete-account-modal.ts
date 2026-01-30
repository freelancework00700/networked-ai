import { Button } from '@/components/form/button';
import { IonFooter, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { ToasterService } from '@/services/toaster.service';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { ModalService } from '@/services/modal.service';
import { NavigationService } from '@/services/navigation.service';

@Component({
  selector: 'delete-account-modal',
  templateUrl: './delete-account-modal.html',
  styleUrl: './delete-account-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonToolbar, IonFooter]
})
export class DeleteAccountModal {
  // services
  private modalCtrl = inject(ModalController);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private navigationService = inject(NavigationService);

  // signals
  isLoading = signal(false);

  cancel(): void {
    this.modalCtrl.dismiss();
  }

  async confirm(): Promise<void> {
    try {
      this.isLoading.set(true);

      await this.userService.deleteAccount();

      await this.modalCtrl.dismiss();

      await this.modalService.openSuccessModal({
        title: 'Account Deleted',
        description: 'Your account has been deleted successfully.',
        buttonLabel: 'Close',
        onClose: async () => {
          await this.authService.signOut();
          this.navigationService.navigateRoot('/');
        }
      });
    } catch (error: any) {
      console.error('Delete account error:', error);
      this.toasterService.showError(error.message || 'Failed to delete account. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
