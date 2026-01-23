import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { NavigationService } from '@/services/navigation.service';
import { ToasterService } from '@/services/toaster.service';
import { signal, inject, Component, ChangeDetectionStrategy, OnInit, computed } from '@angular/core';
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
  navigationService = inject(NavigationService);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);

  // signals
  currentUser = computed(() => this.authService.currentUser());
  isLoading = signal<boolean>(false);

  ngOnInit(): void {}

  onEditEmail(): void {
    this.navigationService.navigateForward('/settings/change-account-info/email', false, {
      email: this.currentUser()?.email
    });
  }

  onEditPhone(): void {
    this.navigationService.navigateForward('/settings/change-account-info/phone', false, {
      phone: this.currentUser()?.mobile
    });
  }

  onEditUsername(): void {
    this.navigationService.navigateForward('/settings/change-account-info/username', false, {
      username: this.currentUser()?.username
    });
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
